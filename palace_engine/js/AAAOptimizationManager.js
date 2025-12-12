/**
 * AAA Optimization Manager для интеграции всех оптимизаций
 * Главный модуль для объединения всех компонентов AAA-оптимизации
 */
import * as THREE from 'three';
import { TextureAtlasManager } from './TextureAtlasManager.js';
import { InstancedCardManager } from './InstancedCardManager.js';
import { SharedGeometryPool } from './SharedGeometryPool.js';
import { LODController } from './LODController.js';

export class AAAOptimizationManager {
    /**
     * Константы для метрик производительности
     */
    static METRICS = {
        MAX_DRAW_CALLS: 5,
        TARGET_FPS: 60,
        MAX_TEXTURES: 1,
        MAX_GEOMETRIES: 1
    };

    /**
     * Конструктор AAAOptimizationManager
     */
    constructor() {
        this.scene = null;
        this.camera = null;
        this.words = [];
        
        // Component managers
        this.textureAtlasManager = null;
        this.instancedCardManager = null;
        this.sharedGeometryPool = null;
        this.lodController = null;
        
        // Result objects
        this.instancedMesh = null;
        this.virtualCards = []; // Virtual objects for raycasting and interaction
        
        // Performance metrics
        this.metrics = {
            drawCalls: 0,
            textures: 0,
            geometries: 0,
            fps: 0
        };
        
        // State
        this.initialized = false;
        this.disposed = false;
    }

    /**
     * Главная инициализация системы оптимизаций
     * CRITICAL BUG FIX #1: Proper initialization order
     * @param {THREE.Scene} scene - сцена Three.js
     * @param {THREE.PerspectiveCamera} camera - камера Three.js
     * @param {Array} words - массив слов для карточек
     * @returns {Promise<Object>} - результат инициализации
     */
    async initialize(scene, camera, words) {
        try {
            if (this.initialized) {
                console.warn('AAAOptimizationManager already initialized');
                return;
            }
            
            this.scene = scene;
            this.camera = camera;
            this.words = words;
            
            // CRITICAL BUG FIX #1: Proper initialization order - atlas first
            // Step 1: Initialize TextureAtlasManager and create atlas
            try {
                this.textureAtlasManager = new TextureAtlasManager({
                    atlasSize: 8192,
                    padding: 4,
                    cardCount: words.length
                });
                
                console.log('Creating texture atlas...');
                const atlasResult = await this.textureAtlasManager.createAtlas(words);
                console.log('Texture atlas created successfully');
            } catch (atlasError) {
                if (atlasError.message.includes('too large')) {
                    console.warn('⚠️ Atlas too large, retrying with smaller cards...');
                    
                    // Пересоздать manager с меньшими карточками
                    this.textureAtlasManager = new TextureAtlasManager({
                        atlasSize: 8192,
                        padding: 4,
                        cardCount: words.length,
                        cardSize: { width: 512, height: 256 } // ✅ Fallback размер
                    });
                    
                    const atlasResult = await this.textureAtlasManager.createAtlas(words);
                    console.log('✅ Atlas created with fallback card size');
                } else {
                    throw atlasError;
                }
            }
            
            // Step 2: Get shared geometry from pool
            this.sharedGeometryPool = SharedGeometryPool.getInstance();
            const cardGeometry = this.sharedGeometryPool.getCardGeometry();
            
            // Step 3: Create InstancedMesh using InstancedCardManager
            this.instancedCardManager = new InstancedCardManager();
            this.instancedMesh = this.instancedCardManager.createInstancedMesh(
                words.length,
                atlasResult.texture,
                atlasResult.uvMap
            );
            
            // Add instanced mesh to scene
            this.scene.add(this.instancedMesh);
            
            // Step 4: Initialize LODController with proper camera and mesh
            this.lodController = new LODController();
            this.lodController.initialize(this.camera, this.instancedMesh);
            
            // Create virtual cards for interaction (raycasting, etc.)
            this.virtualCards = this._createVirtualCards(words);
            
            // Update metrics
            this._updateMetrics();
            
            this.initialized = true;
            
            console.log('AAA Optimization Manager initialized successfully');
            console.log('Metrics:', this.getStats());
            
            return {
                instancedMesh: this.instancedMesh,
                virtualCards: this.virtualCards,
                metrics: this.metrics
            };
        } catch (error) {
            console.error('Error initializing AAA optimization manager:', error);
            
            // ✅ User-friendly error message
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 0, 0, 0.9);
                color: white;
                padding: 30px;
                border-radius: 12px;
                max-width: 500px;
                z-index: 10000;
                text-align: center;
            `;
            
            errorDiv.innerHTML = `
                <h2 style="margin: 0 0 15px;">⚠️ Ошибка инициализации</h2>
                <p>${error.message}</p>
                <p style="font-size: 14px; opacity: 0.8; margin-top: 15px;">
                    Попробуйте уменьшить количество карточек или обновите страницу.
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: white;
                    color: red;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                ">Перезагрузить</button>
            `;
            
            document.body.appendChild(errorDiv);
            
            throw error;
        }
    }

    /**
     * Создать виртуальные карточки для взаимодействия
     * CRITICAL FIX: Proper positioning + userData
     * @param {Array} words - массив слов
     * @returns {Array} - массив виртуальных карточек
     * @private
     */
    _createVirtualCards(words) {
        const virtualCards = [];
        const dummy = new THREE.Object3D();
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            
            // ✅ КРИТИЧНО: Позиционирование карточек в коридоре
            const isLeft = i % 2 === 0;
            const spacingInUnits = (i * 100) / 100; // 1 метр между карточками
            
            dummy.position.set(
                isLeft ? -2.5 : 2.5,  // Слева/справа от центра
                2,                     // Высота 2 метра
                -spacingInUnits       // Глубина по Z
            );
            
            dummy.rotation.y = isLeft ? Math.PI / 8 : -Math.PI / 8; // Поворот к центру
            
            dummy.updateMatrix();
            
            // ✅ Установить матрицу для InstancedMesh
            this.instancedMesh.setMatrixAt(i, dummy.matrix);
            
            // ✅ Создать виртуальную карточку для raycast
            const virtualCard = new THREE.Mesh(
                this.sharedGeometryPool.getCardGeometry(),
                new THREE.MeshBasicMaterial({ visible: false })
            );
            
            virtualCard.position.copy(dummy.position);
            virtualCard.rotation.copy(dummy.rotation);
            
            // ✅ КРИТИЧНО: Сохранить полные данные слова
            virtualCard.userData = {
                word: word.en,
                translation: word.ru,
                transcription: word.transcription,
                example: word.example,
                image: word.image,
                index: i,
                originalIndex: i
            };
            
            virtualCards.push(virtualCard);
            
            // ✅ Добавить в сцену для raycast (но invisible)
            this.scene.add(virtualCard);
        }
        
        // ✅ КРИТИЧНО: Обновить instanceMatrix
        this.instancedMesh.instanceMatrix.needsUpdate = true;
        
        console.log(`✅ Positioned ${words.length} cards in corridor`);
        
        return virtualCards;
    }

    /**
     * Обновление системы на каждом кадре
     * CRITICAL BUG FIX: Ensure update is called in render loop
     * @param {number} deltaTime - время с последнего кадра
     */
    update(deltaTime) {
        if (!this.initialized || this.disposed) {
            return;
        }
        
        // Update LOD system
        if (this.lodController) {
            this.lodController.update(deltaTime);
        }
        
        // Update performance metrics
        this._updateMetrics();
    }

    /**
     * Обновить метрики производительности
     * @private
     */
    _updateMetrics() {
        // TODO: реализация сбора метрик производительности
        // Это может включать подсчет draw calls, текстур, геометрий и т.д.
        
        this.metrics.drawCalls = 1; // Thanks to instancing, we have 1 draw call
        this.metrics.textures = 1;  // Single atlas texture
        this.metrics.geometries = 1; // Single shared geometry
    }

    /**
     * Получить статистику производительности
     * @returns {Object} - объект с метриками
     */
    getStats() {
        return {
            ...this.metrics,
            targetDrawCalls: AAAOptimizationManager.METRICS.MAX_DRAW_CALLS,
            targetFPS: AAAOptimizationManager.METRICS.TARGET_FPS,
            targetTextures: AAAOptimizationManager.METRICS.MAX_TEXTURES,
            initialized: this.initialized,
            disposed: this.disposed
        };
    }

    /**
     * Очистка ресурсов
     * CRITICAL BUG FIX #3: Proper resource disposal to prevent memory leaks
     */
    dispose() {
        try {
            if (this.disposed) {
                return;
            }
            
            // Remove instanced mesh from scene
            if (this.instancedMesh && this.instancedMesh.parent) {
                this.instancedMesh.parent.remove(this.instancedMesh);
            }
            
            // Dispose components
            if (this.instancedMesh) {
                this.instancedMesh.geometry.dispose();
                if (this.instancedMesh.material) {
                    this.instancedMesh.material.dispose();
                }
            }
            
            // Dispose atlas texture
            if (this.textureAtlasManager && this.textureAtlasManager.atlasTexture) {
                this.textureAtlasManager.atlasTexture.dispose();
            }
            
            // Dispose virtual cards
            if (this.virtualCards) {
                for (const card of this.virtualCards) {
                    if (card.geometry) {
                        card.geometry.dispose();
                    }
                    if (card.material && typeof card.material.dispose === 'function') {
                        card.material.dispose();
                    }
                }
            }
            
            // Mark as disposed
            this.initialized = false;
            this.disposed = true;
            
            console.log('AAA Optimization Manager disposed');
        } catch (error) {
            console.error('Error disposing AAA optimization manager:', error);
        }
    }
}