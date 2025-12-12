/**
 * Texture Atlas Manager для оптимизации draw calls
 * Упаковывает N текстур в одну большую
 */
import * as THREE from 'three';

export class TextureAtlasManager {
    /**
     * Конструктор TextureAtlasManager
     * @param {Object} config - конфигурация
     * @param {number} [config.atlasSize=4096] - размер атласа
     * @param {number} [config.padding=2] - отступ между текстурами
     */
    constructor(config = {}) {
        // ✅ КРИТИЧНО: Dynamic atlas size based on card count
        const cardCount = config.cardCount || 25;
        const requestedCardSize = config.cardSize || { width: 768, height: 384 };
        
        // Calculate how many cards fit in grid
        const cols = Math.floor(8192 / (requestedCardSize.width + 4)); // Using default padding
        const rows = Math.floor(8192 / (requestedCardSize.height + 4));
        const capacity = cols * rows;
        
        if (cardCount > capacity) {
            // ✅ Auto-scale down card size
            const targetCols = Math.ceil(Math.sqrt(cardCount));
            const targetRows = Math.ceil(cardCount / targetCols);
            
            const maxCardWidth = Math.floor((8192 / targetCols) - 4);
            const maxCardHeight = Math.floor((8192 / targetRows) - 4);
            
            // Round down to power of 2
            this.cardSize = {
                width: Math.pow(2, Math.floor(Math.log2(maxCardWidth))),
                height: Math.pow(2, Math.floor(Math.log2(maxCardHeight)))
            };
            
            console.warn(`⚡ Auto-scaled cards: ${requestedCardSize.width}×${requestedCardSize.height} → ${this.cardSize.width}×${this.cardSize.height}`);
        } else {
            this.cardSize = requestedCardSize;
        }
        
        // Calculate required atlas size based on actual card size
        const totalArea = cardCount * this.cardSize.width * this.cardSize.height;
        const efficiency = 0.75; // 75% packing efficiency
        
        const requiredSize = Math.sqrt(totalArea / efficiency);
        
        // Round up to next power of 2
        this.atlasSize = this.nextPowerOfTwo(Math.max(
            requiredSize,
            config.atlasSize || 4096
        ));
        
        // ✅ Auto-scale if atlas is too large
        if (this.atlasSize > 8192) {
            console.warn(`⚠️ Atlas size too large (${this.atlasSize}), reducing card size`);
            
            // Scale down cards
            const scaleFactor = 8192 / this.atlasSize;
            this.cardSize = {
                width: Math.floor(this.cardSize.width * scaleFactor),
                height: Math.floor(this.cardSize.height * scaleFactor)
            };
            
            this.atlasSize = 8192;
        }
        
        this.padding = config.padding || 4; // Increased padding for quality
        this.atlasTexture = null;
        this.uvMap = new Map();
        
        console.log(`📐 Atlas configured: ${this.atlasSize}×${this.atlasSize}, Card size: ${this.cardSize.width}×${this.cardSize.height}, Capacity: ${capacity} cards`);
        
        // Canvas for atlas creation
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.atlasSize;
        this.canvas.height = this.atlasSize;
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Создать атлас из массива слов
     * @param {Array} words - массив объектов слов
     * @param {Object} config - дополнительная конфигурация
     * @returns {Promise<Object>} - { texture, uvMap }
     */
    async createAtlas(words, config) {
        try {
            // ✅ КРИТИЧНО: Pre-check if cards will fit
            const estimatedArea = words.length * 768 * 384; // card size
            const atlasArea = this.atlasSize * this.atlasSize;
            const efficiency = 0.7; // realistic packing efficiency
            
            if (estimatedArea / efficiency > atlasArea) {
                console.error(`❌ Atlas size too small!`);
                console.error(`Required: ${Math.sqrt(estimatedArea / efficiency).toFixed(0)}px`);
                console.error(`Current: ${this.atlasSize}px`);
                console.error(`Recommendation: Use atlasSize: ${this.nextPowerOfTwo(Math.sqrt(estimatedArea / efficiency))}`);
                
                // ✅ Auto-upgrade atlas size
                const recommendedSize = this.nextPowerOfTwo(Math.sqrt(estimatedArea / efficiency));
                if (recommendedSize <= 8192) {
                    console.warn(`⚡ Auto-upgrading atlas to ${recommendedSize}px`);
                    this.atlasSize = recommendedSize;
                    this.canvas.width = this.atlasSize;
                    this.canvas.height = this.atlasSize;
                } else {
                    throw new Error(`Atlas would be too large (${recommendedSize}px). Reduce card count or size.`);
                }
            }

            // CRITICAL BUG FIX #1: Memory leak prevention
            const tempTextures = [];
            const canvases = [];

            // 1. Create textures for each word - PARALLEL PROCESSING TO FIX RACE CONDITION
            const texturePromises = words.map(async (word, i) => {
                // Import createOptimizedCardTexture dynamically to avoid circular dependencies
                const { createOptimizedCardTexture } = await import('./optimized-texture-generator.js');
                
                const texture = await createOptimizedCardTexture({
                    word: word.en,
                    translation: word.ru,
                    imagePath: word.image,
                    example: word.example,
                    transcription: word.transcription
                });
                
                return {
                    texture,
                    canvasInfo: { 
                        canvas: texture.image, // CRITICAL BUG FIX: Get canvas from texture.image
                        index: i,
                        width: texture.image.width,
                        height: texture.image.height
                    }
                };
            });
            
            // Wait for ALL textures to be created in parallel
            const results = await Promise.all(texturePromises);
            
            // Extract textures and canvas info
            results.forEach(result => {
                tempTextures.push(result.texture);
                canvases.push(result.canvasInfo);
            });

            // 2. Pack textures using improved bin-packing algorithm
            const packedResult = this.packTextures(canvases);

            // 3. Draw packed textures onto atlas canvas
            this.ctx.clearRect(0, 0, this.atlasSize, this.atlasSize);
            for (const rect of packedResult.rectangles) {
                this.ctx.drawImage(
                    rect.canvas,
                    rect.x, rect.y,
                    rect.width, rect.height
                );

                // Save UV coordinates normalized to [0,1] range
                this.uvMap.set(rect.index, {
                    uMin: rect.x / this.atlasSize,
                    vMin: rect.y / this.atlasSize,
                    uMax: (rect.x + rect.width) / this.atlasSize,
                    vMax: (rect.y + rect.height) / this.atlasSize
                });
            }

            // 4. Create final Three.js texture from canvas
            this.atlasTexture = new THREE.CanvasTexture(this.canvas);
            this.atlasTexture.needsUpdate = true; // CRITICAL: Mark texture as needing update
            this.generateMipmaps();

            // 5. CRITICAL BUG FIX #1: Dispose temporary textures to prevent memory leaks
            tempTextures.forEach(tex => {
                if (tex && typeof tex.dispose === 'function') {
                    tex.dispose();
                }
            });
            
            // 6. CRITICAL FIX: Now safe to clean up canvases after atlas creation
            canvases.forEach(canvasInfo => {
                if (canvasInfo.canvas) {
                    canvasInfo.canvas.width = 0;
                    canvasInfo.canvas.height = 0;
                }
            });

            return {
                texture: this.atlasTexture,
                uvMap: this.uvMap
            };
        } catch (error) {
            console.error('Error creating texture atlas:', error);
            throw error;
        }
    }

    /**
     * Упаковка текстур в атлас с использованием Grid-based алгоритма
     * CRITICAL FIX: Grid packing вместо row-based для предсказуемости
     * @param {Array} items - массив объектов {canvas, index, width, height}
     * @returns {Object} - результат упаковки
     */
    packTextures(items) {
        if (items.length === 0) {
            return { rectangles: [] };
        }
        
        // ✅ Валидация: Canvas должен быть живым
        const cardWidth = items[0].width;
        const cardHeight = items[0].height;
        
        if (!cardWidth || !cardHeight || cardWidth <= 0 || cardHeight <= 0) {
            throw new Error(
                `❌ Invalid card canvas dimensions: ${cardWidth}×${cardHeight}\n` +
                `Canvas was destroyed prematurely in optimized-texture-generator.js`
            );
        }
        
        // ✅ Рассчитываем grid
        const cols = Math.floor(this.atlasSize / (cardWidth + this.padding));
        const rows = Math.floor(this.atlasSize / (cardHeight + this.padding));
        const capacity = cols * rows;
        
        console.log(`📐 Grid packing: ${cols}×${rows} = ${capacity} cards capacity (${cardWidth}×${cardHeight} each)`);
        
        // ✅ Проверка overflow
        if (items.length > capacity) {
            console.error(`❌ Atlas overflow!`);
            console.error(`   Cards needed: ${items.length}`);
            console.error(`   Grid capacity: ${capacity} (${cols}×${rows})`);
            console.error(`   Card size: ${cardWidth}×${cardHeight}`);
            console.error(`   Atlas size: ${this.atlasSize}×${this.atlasSize}`);
            
            throw new Error(
                `Texture atlas too small!\n` +
                `Cards: ${items.length}, Capacity: ${capacity}\n` +
                `Reduce card size or increase atlas size.`
            );
        }
        
        // ✅ Разместить карточки в grid
        const rectangles = [];
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            const x = col * (cardWidth + this.padding);
            const y = row * (cardHeight + this.padding);
            
            // Проверка границ (safety check)
            if (x + cardWidth > this.atlasSize || y + cardHeight > this.atlasSize) {
                console.error(`❌ Card ${i} out of bounds: (${x}, ${y})`);
                continue;
            }
            
            rectangles.push({
                canvas: item.canvas,
                index: item.index,
                x,
                y,
                width: item.width,
                height: item.height
            });
        }
        
        // ✅ Статистика
        const usedRows = Math.min(rows, Math.ceil(items.length / cols));
        const usedCols = Math.min(cols, Math.ceil(items.length / usedRows));
        const efficiency = ((items.length / capacity) * 100).toFixed(1);
        
        console.log(`✅ Packed ${rectangles.length}/${items.length} cards`);
        console.log(`   Grid used: ${usedCols}×${usedRows} of ${cols}×${rows}`);
        console.log(`   Efficiency: ${efficiency}%`);
        
        return { rectangles };
    }

    /**
     * Получить UV координаты для конкретной карточки
     * @param {number} cardIndex - индекс карточки
     * @returns {Object} - UV координаты { uMin, vMin, uMax, vMax }
     */
    getUVMapping(cardIndex) {
        return this.uvMap.get(cardIndex) || { uMin: 0, vMin: 0, uMax: 1, vMax: 1 };
    }

    /**
     * Создать mipmap уровни для текстуры атласа
     */
    generateMipmaps() {
        if (this.atlasTexture) {
            this.atlasTexture.generateMipmaps = true;
            this.atlasTexture.minFilter = THREE.LinearMipmapLinearFilter;
            this.atlasTexture.magFilter = THREE.LinearFilter;
        }
    }
    
    /**
     * Вспомогательная функция для получения следующей степени двойки
     * CRITICAL BUG FIX #3: Power of 2 constraint
     * @param {number} value - входное значение
     * @returns {number} - следующая степень двойки
     */
    nextPowerOfTwo(value) {
        return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2)));
    }
}