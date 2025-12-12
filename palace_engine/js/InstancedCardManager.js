/**
 * Instanced Card Manager для GPU Instancing карточек
 * Использует texture atlas и InstancedMesh для оптимизации производительности
 */
import * as THREE from 'three';

export class InstancedCardManager {
    /**
     * Конструктор InstancedCardManager
     */
    constructor() {
        this.instancedMesh = null;
        this.customShaderMaterial = null;
        this.uvOffsetsAttribute = null;
        
        // Initialize custom shader material
        this._initCustomShaderMaterial();
    }

    /**
     * Инициализировать custom shader material с поддержкой UV offsets
     * @private
     */
    _initCustomShaderMaterial() {
        // Vertex shader source
        const vertexShaderSource = `
            attribute vec4 uvOffset;
            
            varying vec2 vUv;
            
            void main() {
                // Map local UV coordinates to atlas UV coordinates
                // CRITICAL BUG FIX #4: Correct UV mapping accounting for Y-axis inversion
                vUv = vec2(
                    mix(uvOffset.x, uvOffset.x + uvOffset.z, uv.x),
                    mix(uvOffset.y, uvOffset.y + uvOffset.w, 1.0 - uv.y)  // CRITICAL: Invert Y axis for correct texture orientation
                );
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        
        // Fragment shader source
        const fragmentShaderSource = `
            uniform sampler2D atlasTexture;
            
            varying vec2 vUv;
            
            void main() {
                vec4 color = texture2D(atlasTexture, vUv);
                if (color.a < 0.1) discard; // Handle transparency
                gl_FragColor = color;
            }
        `;
        
        // CRITICAL BUG FIX #1: Proper uniforms for lighting support
        this.customShaderMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.merge([
                THREE.UniformsLib.common,  // Base uniforms
                THREE.UniformsLib.lights,  // Lighting uniforms
                { 
                    atlasTexture: { value: null }
                }
            ]),
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            transparent: true,
            side: THREE.DoubleSide,
            lights: true  // CRITICAL BUG FIX: Enable lighting
        });
    }

    /**
     * Создать InstancedMesh для карточек
     * @param {number} count - количество инстансов
     * @param {THREE.Texture} atlasTexture - текстура атласа
     * @param {Map} uvMap - карта UV координат
     * @returns {THREE.InstancedMesh} - созданный InstancedMesh
     */
    createInstancedMesh(count, atlasTexture, uvMap) {
        try {
            // Update shader material with atlas texture
            this.customShaderMaterial.uniforms.atlasTexture.value = atlasTexture;
            
            // Get shared geometry from pool
            // NOTE: Geometry should be obtained from SharedGeometryPool
            const geometry = new THREE.PlaneGeometry(3, 2); // Temporary - should come from pool
            
            // Create InstancedMesh
            this.instancedMesh = new THREE.InstancedMesh(geometry, this.customShaderMaterial, count);
            
            // Initialize UV offsets attribute
            this.uvOffsetsAttribute = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
            
            // Set initial UV offsets based on uvMap
            for (let i = 0; i < count; i++) {
                const uvData = uvMap.get(i) || { uMin: 0, vMin: 0, uMax: 1, vMax: 1 };
                
                // Store: [uOffset, vOffset, uWidth, vHeight]
                const uWidth = uvData.uMax - uvData.uMin;
                const vHeight = uvData.vMax - uvData.vMin;
                
                this.uvOffsetsAttribute.setXYWH(i, uvData.uMin, uvData.vMin, uWidth, vHeight);
            }
            
            this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            this.instancedMesh.setAttribute('uvOffset', this.uvOffsetsAttribute);
            
            // CRITICAL BUG FIX #2: Mark attribute as needing update
            this.uvOffsetsAttribute.needsUpdate = true;
            
            return this.instancedMesh;
        } catch (error) {
            console.error('Error creating instanced mesh:', error);
            throw error;
        }
    }

    /**
     * Обновить трансформацию конкретного инстанса
     * @param {number} index - индекс инстанса
     * @param {THREE.Vector3} position - новая позиция
     * @param {THREE.Euler|THREE.Quaternion} rotation - новая ориентация
     * @param {THREE.Vector3} [scale=new THREE.Vector3(1,1,1)] - масштаб
     */
    updateInstanceTransform(index, position, rotation, scale = new THREE.Vector3(1, 1, 1)) {
        if (!this.instancedMesh || index >= this.instancedMesh.count) {
            console.warn(`Invalid instance index: ${index}`);
            return;
        }
        
        const matrix = new THREE.Matrix4();
        matrix.compose(position, 
                      rotation.isEuler ? new THREE.Quaternion().setFromEuler(rotation) : rotation,
                      scale);
        
        this.instancedMesh.setMatrixAt(index, matrix);
        
        // CRITICAL BUG FIX #5: Mark instance matrix as needing update
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }

    /**
     * Установить смещение UV для конкретного инстанса
     * @param {number} index - индекс инстанса
     * @param {Object} uvOffset - объект смещения { uMin, vMin, uMax, vMax }
     */
    setInstanceUVOffset(index, uvOffset) {
        if (!this.uvOffsetsAttribute || index >= this.uvOffsetsAttribute.count) {
            console.warn(`Invalid instance index for UV offset: ${index}`);
            return;
        }
        
        // Calculate scale from offset values
        const uScale = uvOffset.uMax - uvOffset.uMin;
        const vScale = uvOffset.vMax - uvOffset.vMin;
        
        // Set UV offset data [uOffset, vOffset, uScale, vScale]
        this.uvOffsetsAttribute.setXYWH(index, uvOffset.uMin, uvOffset.vMin, uScale, vScale);
        this.uvOffsetsAttribute.needsUpdate = true;
    }

    /**
     * Получить пересечение raycast с InstancedMesh
     * CRITICAL BUG FIX: Raycast для InstancedMesh
     * @param {THREE.Raycaster} raycaster - raycaster объект
     * @returns {Object|null} - информация о пересечении
     */
    getRaycastIntersection(raycaster) {
        if (!this.instancedMesh) return null;
        
        const intersects = raycaster.intersectObject(this.instancedMesh);
        
        if (intersects.length > 0) {
            const intersection = intersects[0];
            
            // Three.js automatically adds instanceId
            const instanceId = intersection.instanceId;
            
            if (instanceId !== undefined) {
                return {
                    instanceId,
                    point: intersection.point,
                    distance: intersection.distance,
                    face: intersection.face,
                    object: this.instancedMesh
                };
            }
        }
        
        return null;
    }
}