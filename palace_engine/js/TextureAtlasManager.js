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
        this.atlasSize = this.nextPowerOfTwo(config.atlasSize || 4096); // CRITICAL BUG FIX #3: Power of 2 constraint
        this.padding = config.padding || 2;
        this.atlasTexture = null;
        this.uvMap = new Map();
        
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
            // CRITICAL BUG FIX #1: Memory leak prevention
            const tempTextures = [];
            const canvases = [];

            // 1. Create textures for each word
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                
                // Import createOptimizedCardTexture dynamically to avoid circular dependencies
                const { createOptimizedCardTexture } = await import('./optimized-texture-generator.js');
                
                const texture = await createOptimizedCardTexture({
                    word: word.en,
                    translation: word.ru,
                    imagePath: word.image,
                    example: word.example,
                    transcription: word.transcription
                });
                
                tempTextures.push(texture);
                canvases.push({ 
                    canvas: texture.image, // CRITICAL BUG FIX: Get canvas from texture.image
                    index: i,
                    width: texture.image.width,
                    height: texture.image.height
                });
            }

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
     * Упаковка текстур в атлас с использованием улучшенного алгоритма bin packing
     * CRITICAL BUG FIX #2: Improved bin packing instead of simple grid
     * @param {Array} items - массив объектов {canvas, index, width, height}
     * @returns {Object} - результат упаковки
     */
    packTextures(items) {
        // Sort by height (descending) for better bin packing heuristic
        const sortedItems = [...items].sort((a, b) => b.height - a.height);
        
        // Simple row-based packing algorithm
        const rectangles = [];
        const rows = [];
        let currentY = 0;
        
        for (const item of sortedItems) {
            // Find suitable row
            let placed = false;
            
            for (const row of rows) {
                if (row.y === currentY && row.remainingWidth >= item.width + this.padding) {
                    // Place in existing row
                    const rect = {
                        canvas: item.canvas,
                        index: item.index,
                        x: this.atlasSize - row.remainingWidth,
                        y: row.y,
                        width: item.width,
                        height: item.height
                    };
                    
                    rectangles.push(rect);
                    row.remainingWidth -= item.width + this.padding;
                    placed = true;
                    break;
                }
            }
            
            if (!placed) {
                // Start new row if there's space
                if (currentY + item.height + this.padding <= this.atlasSize) {
                    const newRow = {
                        y: currentY,
                        remainingWidth: this.atlasSize - item.width - this.padding
                    };
                    
                    const rect = {
                        canvas: item.canvas,
                        index: item.index,
                        x: 0,
                        y: currentY,
                        width: item.width,
                        height: item.height
                    };
                    
                    rectangles.push(rect);
                    rows.push(newRow);
                    currentY += item.height + this.padding;
                }
            }
        }
        
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