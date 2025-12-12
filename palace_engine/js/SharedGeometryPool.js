/**
 * Shared Geometry Pool для переиспользования геометрий
 * Предотвращает создание дубликатов геометрий, экономит память
 */
import * as THREE from 'three';

export class SharedGeometryPool {
    /**
     * Конструктор SharedGeometryPool
     */
    constructor() {
        // CRITICAL BUG FIX #1: Check if instance already exists
        if (SharedGeometryPool.instance) {
            return SharedGeometryPool.instance;
        }
        
        this.geometries = new Map();
        this.usageCounters = new Map();
        
        // Lazy initialization flags
        this.cardGeometryInitialized = false;
        this.floorGeometryInitialized = false;
        
        // Store reference to static instance
        SharedGeometryPool.instance = this;
    }

    /**
     * Получить общую геометрию для карточек
     * @returns {THREE.PlaneGeometry} - плоская геометрия для карточек (3x2)
     */
    getCardGeometry() {
        const key = 'card_geometry';
        
        if (!this.geometries.has(key)) {
            // Create new geometry
            const geometry = new THREE.PlaneGeometry(3, 2);
            this.geometries.set(key, geometry);
            this.usageCounters.set(key, 1);
            this.cardGeometryInitialized = true;
        } else {
            // Increment usage counter
            const currentCount = this.usageCounters.get(key);
            this.usageCounters.set(key, currentCount + 1);
        }
        
        return this.geometries.get(key);
    }

    /**
     * Получить геометрию для пола
     * @returns {THREE.BufferGeometry} - геометрия пола
     */
    getFloorGeometry() {
        const key = 'floor_geometry';
        
        if (!this.geometries.has(key)) {
            // TODO: реализация создания геометрии пола
            // Create new floor geometry
            const geometry = new THREE.PlaneGeometry(100, 100);
            geometry.rotateX(-Math.PI / 2); // Rotate to horizontal
            this.geometries.set(key, geometry);
            this.usageCounters.set(key, 1);
            this.floorGeometryInitialized = true;
        } else {
            // Increment usage counter
            const currentCount = this.usageCounters.get(key);
            this.usageCounters.set(key, currentCount + 1);
        }
        
        return this.geometries.get(key);
    }

    /**
     * Получить другую общую геометрию по типу
     * @param {string} type - тип геометрии
     * @param {Object} params - параметры для создания геометрии
     * @returns {THREE.BufferGeometry} - запрашиваемая геометрия
     */
    getGeometry(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        
        if (!this.geometries.has(key)) {
            let geometry;
            
            switch (type) {
                case 'plane':
                    geometry = new THREE.PlaneGeometry(
                        params.width || 1,
                        params.height || 1,
                        params.widthSegments || 1,
                        params.heightSegments || 1
                    );
                    break;
                    
                case 'box':
                    geometry = new THREE.BoxGeometry(
                        params.width || 1,
                        params.height || 1,
                        params.depth || 1,
                        params.widthSegments || 1,
                        params.heightSegments || 1,
                        params.depthSegments || 1
                    );
                    break;
                    
                case 'sphere':
                    geometry = new THREE.SphereGeometry(
                        params.radius || 1,
                        params.widthSegments || 8,
                        params.heightSegments || 6
                    );
                    break;
                    
                default:
                    console.warn(`Unknown geometry type: ${type}`);
                    geometry = new THREE.BufferGeometry(); // Return empty geometry as fallback
            }
            
            this.geometries.set(key, geometry);
            this.usageCounters.set(key, 1);
        } else {
            // Increment usage counter
            const currentCount = this.usageCounters.get(key);
            this.usageCounters.set(key, currentCount + 1);
        }
        
        return this.geometries.get(key);
    }

    /**
     * Очистить все геометрии в пуле
     */
    dispose() {
        try {
            // Dispose all geometries
            for (const [key, geometry] of this.geometries) {
                geometry.dispose();
            }
            
            // Clear maps
            this.geometries.clear();
            this.usageCounters.clear();
            
            // Reset initialization flags
            this.cardGeometryInitialized = false;
            this.floorGeometryInitialized = false;
        } catch (error) {
            console.error('Error disposing geometry pool:', error);
        }
    }

    /**
     * Освободить геометрию из пула
     * CRITICAL: Reference counting для предотвращения преждевременного удаления
     * @param {string} key - ключ геометрии
     */
    releaseGeometry(key) {
        if (!this.geometries.has(key)) {
            console.warn(`Cannot release geometry: ${key} not found in pool`);
            return;
        }
        
        const currentCount = this.usageCounters.get(key);
        
        if (currentCount > 1) {
            // Уменьшаем счётчик
            this.usageCounters.set(key, currentCount - 1);
            console.log(`📦 Geometry '${key}' released. Remaining refs: ${currentCount - 1}`);
        } else {
            // Последний пользователь — удаляем полностью
            const geometry = this.geometries.get(key);
            if (geometry) {
                geometry.dispose();
                console.log(`♻️ Geometry '${key}' disposed (last reference)`);
            }
            
            this.geometries.delete(key);
            this.usageCounters.delete(key);
        }
    }

    /**
     * Получить статистику использования геометрий
     * @returns {Object} - статистика использования
     */
    getStats() {
        const stats = {};
        for (const [key, count] of this.usageCounters) {
            stats[key] = count;
        }
        return stats;
    }

    // Singleton implementation
    static getInstance() {
        if (!SharedGeometryPool.instance) {
            SharedGeometryPool.instance = new SharedGeometryPool();
        }
        return SharedGeometryPool.instance;
    }
}

// Static property for singleton
SharedGeometryPool.instance = null;