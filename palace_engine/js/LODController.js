/**
 * LOD Controller для автоматического управления детализацией
 * Уровни детализации (LOD) для карточек в зависимости от расстояния до камеры
 */
import * as THREE from 'three';

export class LODController {
    /**
     * Константы для уровней LOD
     */
    static LOD_LEVELS = {
        HIGH_DETAIL: 0,    // < 5m
        MEDIUM_DETAIL: 1,  // 5-15m
        LOW_DETAIL: 2      // > 15m
    };

    /**
     * Конструктор LODController
     */
    constructor() {
        this.camera = null;
        this.cards = null;
        this.lodLevels = [
            { distance: 5, level: LODController.LOD_LEVELS.HIGH_DETAIL },
            { distance: 15, level: LODController.LOD_LEVELS.MEDIUM_DETAIL },
            { distance: Infinity, level: LODController.LOD_LEVELS.LOW_DETAIL }
        ];
        this.currentLODs = new Map(); // Store current LOD for each card
        this.frustum = new THREE.Frustum();
        this.cameraProjectionMatrix = new THREE.Matrix4();
    }

    /**
     * Инициализировать LOD систему
     * @param {THREE.PerspectiveCamera|THREE.OrthographicCamera} camera - камера сцены
     * @param {Array|THREE.InstancedMesh} cards - массив карточек или InstancedMesh
     */
    initialize(camera, cards) {
        try {
            this.camera = camera;
            this.cards = cards;
            
            // Initialize LOD states for all cards
            this._initializeCardLODs();
        } catch (error) {
            console.error('Error initializing LOD controller:', error);
            throw error;
        }
    }

    /**
     * Инициализировать состояния LOD для всех карточек
     * @private
     */
    _initializeCardLODs() {
        // TODO: реализация инициализации LOD состояний
        if (this.cards instanceof THREE.InstancedMesh) {
            // For InstancedMesh, initialize LOD states for each instance
            for (let i = 0; i < this.cards.count; i++) {
                this.currentLODs.set(i, LODController.LOD_LEVELS.HIGH_DETAIL);
            }
        } else if (Array.isArray(this.cards)) {
            // For array of objects, initialize LOD states
            this.cards.forEach((card, index) => {
                this.currentLODs.set(index, LODController.LOD_LEVELS.HIGH_DETAIL);
            });
        }
    }

    /**
     * Установить уровни LOD
     * @param {Array} levels - массив уровней [{distance, level}, ...]
     */
    setLODLevels(levels) {
        this.lodLevels = [...levels].sort((a, b) => a.distance - b.distance);
    }

    /** 
     * Обновить LOD уровни на каждом кадре
     * CRITICAL BUG FIX #1: Frustum culling performance optimization
     * @param {number} deltaTime - время с последнего кадра
     */
    update(deltaTime) {
        try {
            // CRITICAL BUG FIX #3: Update frustum every frame for proper culling
            this.camera.updateMatrixWorld();
            this.cameraProjectionMatrix.multiplyMatrices(
                this.camera.projectionMatrix,
                this.camera.matrixWorldInverse
            );
            this.frustum.setFromProjectionMatrix(this.cameraProjectionMatrix);

            // CRITICAL BUG FIX #1: Throttle updates to reduce performance impact
            // Only update every 5 frames (adjust as needed)
            if (this.frameCounter === undefined) {
                this.frameCounter = 0;
            }
            
            this.frameCounter++;
            if (this.frameCounter % 5 !== 0) {
                return; // Skip update every 5th frame
            }

            if (this.cards instanceof THREE.InstancedMesh) {
                this._updateInstancedMeshLODs();
            } else if (Array.isArray(this.cards)) {
                this._updateArrayCardsLODs();
            }
        } catch (error) {
            console.error('Error updating LODs:', error);
        }
    }

    /**
     * Обновить LOD для InstancedMesh
     * @private
     */
    _updateInstancedMeshLODs() {
        // TODO: реализация обновления LOD для InstancedMesh
        const tempMatrix = new THREE.Matrix4();
        const tempPosition = new THREE.Vector3();
        
        for (let i = 0; i < this.cards.count; i++) {
            // Get world position of instance
            this.cards.getMatrixAt(i, tempMatrix);
            tempPosition.setFromMatrixPosition(tempMatrix);
            
            // Calculate distance to camera
            const distance = tempPosition.distanceTo(this.camera.position);
            
            // Determine LOD level based on distance
            const lodLevel = this._getLODLevelByDistance(distance);
            const currentLod = this.currentLODs.get(i);
            
            // Update if LOD changed
            if (currentLod !== lodLevel) {
                this.currentLODs.set(i, lodLevel);
                
                // TODO: применить изменения для уровня детализации
                // Это может включать изменение UV координат или видимости
                this._applyLODChanges(i, lodLevel);
            }
        }
    }

    /**
     * Обновить LOD для массива карточек
     * @private
     */
    _updateArrayCardsLODs() {
        // TODO: реализация обновления LOD для массива карточек
        this.cards.forEach((card, index) => {
            // Calculate distance to camera
            const distance = card.position ? 
                card.position.distanceTo(this.camera.position) : 
                0;
            
            // Determine LOD level based on distance
            const lodLevel = this._getLODLevelByDistance(distance);
            const currentLod = this.currentLODs.get(index);
            
            // Update if LOD changed
            if (currentLod !== lodLevel) {
                this.currentLODs.set(index, lodLevel);
                
                // Apply changes based on LOD level
                this._applyLODChangesForObject3D(card, lodLevel);
            }
        });
    }

    /**
     * Получить уровень LOD по расстоянию
     * @param {number} distance - расстояние до объекта
     * @returns {number} - уровень LOD
     */
    _getLODLevelByDistance(distance) {
        for (const lod of this.lodLevels) {
            if (distance <= lod.distance) {
                return lod.level;
            }
        }
        return this.lodLevels[this.lodLevels.length - 1].level;
    }

    /**
     * Применить изменения LOD к конкретному инстансу (для InstancedMesh)
     * @param {number} index - индекс инстанса
     * @param {number} lodLevel - уровень LOD
     * @private
     */
    _applyLODChanges(index, lodLevel) {
        if (!(this.cards instanceof THREE.InstancedMesh)) return;
        
        const tempMatrix = new THREE.Matrix4();
        const tempPosition = new THREE.Vector3();
        const tempQuaternion = new THREE.Quaternion();
        const tempScale = new THREE.Vector3();
        
        // Получить текущую матрицу
        this.cards.getMatrixAt(index, tempMatrix);
        tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);
        
        // FRUSTUM CULLING: Скрыть если вне поля зрения
        const isVisible = this.frustum.containsPoint(tempPosition);
        
        if (!isVisible) {
            // Скрываем через scale=0
            tempScale.set(0, 0, 0);
        } else {
            // LOD применяется через uniform (если shader поддерживает)
            // Или через разные scale уровни
            switch (lodLevel) {
                case LODController.LOD_LEVELS.HIGH_DETAIL:
                    tempScale.set(1, 1, 1);
                    break;
                case LODController.LOD_LEVELS.MEDIUM_DETAIL:
                    tempScale.set(0.9, 0.9, 0.9);
                    break;
                case LODController.LOD_LEVELS.LOW_DETAIL:
                    tempScale.set(0.7, 0.7, 0.7);
                    break;
            }
        }
        
        // Применить обновлённую матрицу
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        this.cards.setMatrixAt(index, tempMatrix);
        this.cards.instanceMatrix.needsUpdate = true;
    }

    /**
     * Применить изменения LOD к Object3D
     * @param {THREE.Object3D} object - объект для применения изменений
     * @param {number} lodLevel - уровень LOD
     * @private
     */
    _applyLODChangesForObject3D(object, lodLevel) {
        // TODO: реализация применения изменений LOD для Object3D
        // Настройка видимости или качества в зависимости от уровня
        switch (lodLevel) {
            case LODController.LOD_LEVELS.HIGH_DETAIL:
                object.visible = true;
                break;
            case LODController.LOD_LEVELS.MEDIUM_DETAIL:
                object.visible = true;
                break;
            case LODController.LOD_LEVELS.LOW_DETAIL:
                object.visible = true; // Or potentially false for very far objects
                break;
        }
    }

    /**
     * Проверить видимость объекта в frustum
     * @param {THREE.Object3D} object - объект для проверки
     * @returns {boolean} - видим ли объект
     */
    isObjectInFrustum(object) {
        // TODO: реализация проверки видимости в frustum
        const sphere = new THREE.Sphere();
        object.geometry.computeBoundingSphere();
        sphere.copy(object.geometry.boundingSphere);
        sphere.applyMatrix4(object.matrixWorld);
        
        return this.frustum.intersectsSphere(sphere);
    }
}