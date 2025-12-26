/**
 * ARCHITECTURAL DIAGNOSTICS SYSTEM
 * Автоматическая проверка критических проблем в Three.js проекте
 * Запускается при инициализации и периодически во время выполнения
 */

export class ArchitecturalDiagnostics {
    constructor(app) {
        this.app = app;
        this.issues = [];
        this.warnings = [];
    }

    /**
     * Полная диагностика всего проекта
     */
    runFullDiagnostics() {
        console.log('🔍 === ARCHITECTURAL DIAGNOSTICS START ===');
        
        this.issues = [];
        this.warnings = [];
        
        // 1. Shader Material Diagnostics
        this.checkShaderMaterials();
        
        // 2. Lighting Uniforms Diagnostics
        this.checkLightingUniforms();
        
        // 3. InstancedMesh Diagnostics
        this.checkInstancedMesh();
        
        // 4. Texture Atlas Diagnostics
        this.checkTextureAtlas();
        
        // 5. UV Mapping Diagnostics
        this.checkUVMapping();
        
        // 6. Camera & Frustum Diagnostics
        this.checkCameraSetup();
        
        // 7. Performance Bottlenecks
        this.checkPerformance();
        
        // 8. Memory Leaks
        this.checkMemoryLeaks();
        
        // Report
        this.generateReport();
        
        console.log('✅ === ARCHITECTURAL DIAGNOSTICS END ===\n');
        
        return {
            issues: this.issues,
            warnings: this.warnings,
            critical: this.issues.length > 0
        };
    }

    /**
     * 1. Проверка ShaderMaterial
     */
    checkShaderMaterials() {
        console.log('\n📦 [1/8] Checking ShaderMaterials...');
        
        const materials = [];
        
        this.app.scene?.traverse((obj) => {
            if (obj.material && obj.material.type === 'ShaderMaterial') {
                materials.push({
                    object: obj,
                    material: obj.material
                });
            }
        });
        
        materials.forEach(({ object, material }) => {
            // Check if uniforms are defined
            if (!material.uniforms) {
                this.issues.push({
                    type: 'SHADER_NO_UNIFORMS',
                    severity: 'CRITICAL',
                    object: object.name || 'unnamed',
                    message: 'ShaderMaterial has no uniforms defined'
                });
            }
            
            // Check if lights flag is set but lighting uniforms are missing
            if (material.lights && material.uniforms) {
                const hasAmbient = material.uniforms.ambientLightColor !== undefined;
                const hasDirectional = material.uniforms.directionalLightColor !== undefined;
                
                if (!hasAmbient && !hasDirectional) {
                    this.issues.push({
                        type: 'SHADER_MISSING_LIGHTING_UNIFORMS',
                        severity: 'CRITICAL',
                        object: object.name || 'unnamed',
                        message: 'ShaderMaterial has lights:true but no lighting uniforms. Objects will be BLACK.',
                        fix: 'Add lighting uniforms OR set lights:false and use emissive/basic lighting'
                    });
                }
            }
            
            // Check if custom attributes are used but not updated
            if (object.geometry) {
                const attrs = Object.keys(object.geometry.attributes);
                const customAttrs = attrs.filter(a => !['position', 'normal', 'uv', 'color'].includes(a));
                
                customAttrs.forEach(attr => {
                    const attribute = object.geometry.attributes[attr];
                    if (attribute.needsUpdate === false) {
                        this.warnings.push({
                            type: 'ATTRIBUTE_NOT_UPDATED',
                            severity: 'WARNING',
                            object: object.name || 'unnamed',
                            attribute: attr,
                            message: `Custom attribute "${attr}" may not be updated. Set needsUpdate=true after modification.`
                        });
                    }
                });
            }
        });
        
        console.log(`   Found ${materials.length} ShaderMaterials`);
    }

    /**
     * 2. Проверка lighting uniforms
     */
    checkLightingUniforms() {
        console.log('\n💡 [2/8] Checking Lighting Uniforms...');
        
        // Find all lights in scene
        const lights = {
            ambient: [],
            directional: [],
            point: [],
            spot: []
        };
        
        this.app.scene?.traverse((obj) => {
            if (obj.isAmbientLight) lights.ambient.push(obj);
            if (obj.isDirectionalLight) lights.directional.push(obj);
            if (obj.isPointLight) lights.point.push(obj);
            if (obj.isSpotLight) lights.spot.push(obj);
        });
        
        console.log(`   Lights: Ambient=${lights.ambient.length}, Directional=${lights.directional.length}, Point=${lights.point.length}, Spot=${lights.spot.length}`);
        
        // Check if ShaderMaterials reference these lights
        this.app.scene?.traverse((obj) => {
            if (obj.material?.type === 'ShaderMaterial' && obj.material.lights) {
                const mat = obj.material;
                
                // Check if lighting uniforms have actual values
                if (mat.uniforms.ambientLightColor) {
                    const val = mat.uniforms.ambientLightColor.value;
                    if (!val || (val.r === 0 && val.g === 0 && val.b === 0)) {
                        this.issues.push({
                            type: 'LIGHTING_UNIFORM_ZERO',
                            severity: 'CRITICAL',
                            object: obj.name || 'unnamed',
                            message: 'ambientLightColor is black or undefined. Scene will be dark.',
                            fix: 'Set uniform value from scene lights OR disable lights:true'
                        });
                    }
                }
                
                if (mat.uniforms.directionalLightColor) {
                    const val = mat.uniforms.directionalLightColor.value;
                    if (!val || (val.r === 0 && val.g === 0 && val.b === 0)) {
                        this.issues.push({
                            type: 'LIGHTING_UNIFORM_ZERO',
                            severity: 'CRITICAL',
                            object: obj.name || 'unnamed',
                            message: 'directionalLightColor is black or undefined. Scene will be dark.',
                            fix: 'Set uniform value from scene lights'
                        });
                    }
                }
            }
        });
    }

    /**
     * 3. Проверка InstancedMesh
     */
    checkInstancedMesh() {
        console.log('\n🔢 [3/8] Checking InstancedMesh...');
        
        let instancedMeshes = [];
        
        this.app.scene?.traverse((obj) => {
            if (obj.type === 'InstancedMesh') {
                instancedMeshes.push(obj);
            }
        });
        
        console.log(`   Found ${instancedMeshes.length} InstancedMesh objects`);
        
        instancedMeshes.forEach(mesh => {
            // Check if instanceMatrix is updated
            if (!mesh.instanceMatrix.needsUpdate && mesh.count > 0) {
                this.warnings.push({
                    type: 'INSTANCE_MATRIX_NOT_UPDATED',
                    severity: 'WARNING',
                    message: 'InstancedMesh instanceMatrix may not be updated after setMatrixAt()'
                });
            }
            
            // Check if material supports instancing
            if (mesh.material?.type === 'ShaderMaterial') {
                // Check if vertex shader uses instanceMatrix
                const hasInstanceMatrix = mesh.material.vertexShader?.includes('instanceMatrix');
                
                if (!hasInstanceMatrix) {
                    this.issues.push({
                        type: 'SHADER_NO_INSTANCING_SUPPORT',
                        severity: 'CRITICAL',
                        message: 'ShaderMaterial used with InstancedMesh but vertex shader does not use instanceMatrix',
                        fix: 'Add instanceMatrix transformation in vertex shader OR use standard material'
                    });
                }
            }
            
            // Check frustum culling
            if (mesh.frustumCulled && mesh.count > 100) {
                this.warnings.push({
                    type: 'INSTANCED_MESH_FRUSTUM_CULLING',
                    severity: 'INFO',
                    message: `InstancedMesh with ${mesh.count} instances has frustumCulled=true. May cause pop-in if instances are spread out.`,
                    fix: 'Consider setting frustumCulled=false for large spread instances'
                });
            }
        });
    }

    /**
     * 4. Проверка Texture Atlas
     */
    checkTextureAtlas() {
        console.log('\n🖼️  [4/8] Checking Texture Atlas...');
        
        const manager = this.app.optimizationManager || this.app.aaaManager;
        
        if (manager?.atlasManager) {
            const atlas = manager.atlasManager;
            
            // Check atlas size vs content
            const efficiency = atlas.packedCount / atlas.capacity;
            
            if (efficiency < 0.3) {
                this.warnings.push({
                    type: 'ATLAS_LOW_EFFICIENCY',
                    severity: 'WARNING',
                    message: `Texture atlas efficiency is ${(efficiency * 100).toFixed(1)}%. Wasting GPU memory.`,
                    fix: 'Consider reducing atlas size or packing more textures'
                });
            }
            
            console.log(`   Atlas: ${atlas.atlasWidth}x${atlas.atlasHeight}, Efficiency: ${(efficiency * 100).toFixed(1)}%`);
        }
    }

    /**
     * 5. Проверка UV Mapping
     */
    checkUVMapping() {
        console.log('\n📐 [5/8] Checking UV Mapping...');
        
        this.app.scene?.traverse((obj) => {
            if (obj.geometry?.attributes.uv) {
                const uvArray = obj.geometry.attributes.uv.array;
                
                // Check if UVs are outside [0,1] range (may indicate issues)
                let outOfBounds = false;
                for (let i = 0; i < uvArray.length; i++) {
                    if (uvArray[i] < -0.01 || uvArray[i] > 1.01) {
                        outOfBounds = true;
                        break;
                    }
                }
                
                if (outOfBounds) {
                    this.warnings.push({
                        type: 'UV_OUT_OF_BOUNDS',
                        severity: 'WARNING',
                        object: obj.name || 'unnamed',
                        message: 'UV coordinates outside [0,1] range. May cause texture bleeding.',
                        fix: 'Check UV generation or texture wrapping settings'
                    });
                }
            }
            
            // Check if custom uvOffset is defined but not in shader
            if (obj.geometry?.attributes.uvOffset && obj.material?.type === 'ShaderMaterial') {
                const hasUVOffset = obj.material.vertexShader?.includes('uvOffset');
                
                if (!hasUVOffset) {
                    this.issues.push({
                        type: 'UV_OFFSET_ATTRIBUTE_UNUSED',
                        severity: 'CRITICAL',
                        object: obj.name || 'unnamed',
                        message: 'Geometry has uvOffset attribute but shader does not use it. UVs will be wrong!',
                        fix: 'Add "attribute vec4 uvOffset;" to vertex shader and use it in UV calculation'
                    });
                }
            }
        });
    }

    /**
     * 6. Проверка Camera
     */
    checkCameraSetup() {
        console.log('\n📹 [6/8] Checking Camera Setup...');
        
        const cam = this.app.camera;
        
        if (!cam) {
            this.issues.push({
                type: 'NO_CAMERA',
                severity: 'CRITICAL',
                message: 'No camera found in app'
            });
            return;
        }
        
        console.log(`   Camera: pos=(${cam.position.x.toFixed(1)}, ${cam.position.y.toFixed(1)}, ${cam.position.z.toFixed(1)})`);
        console.log(`   Near/Far: ${cam.near} / ${cam.far}`);
        
        // Check if near/far are reasonable
        if (cam.far / cam.near > 10000) {
            this.warnings.push({
                type: 'CAMERA_LARGE_DEPTH_RANGE',
                severity: 'WARNING',
                message: `Camera depth range is very large (far/near = ${(cam.far / cam.near).toFixed(0)}). May cause Z-fighting.`,
                fix: 'Reduce far plane or increase near plane'
            });
        }
    }

    /**
     * 7. Проверка Performance
     */
    checkPerformance() {
        console.log('\n⚡ [7/8] Checking Performance...');
        
        const info = this.app.renderer?.info;
        
        if (info) {
            console.log(`   Draw calls: ${info.render.calls}`);
            console.log(`   Triangles: ${info.render.triangles}`);
            console.log(`   Textures: ${info.memory.textures}`);
            console.log(`   Geometries: ${info.memory.geometries}`);
            
            if (info.render.calls > 50) {
                this.warnings.push({
                    type: 'HIGH_DRAW_CALLS',
                    severity: 'WARNING',
                    message: `Draw calls: ${info.render.calls}. Consider using more InstancedMesh or merging geometries.`
                });
            }
            
            if (info.memory.textures > 20) {
                this.warnings.push({
                    type: 'MANY_TEXTURES',
                    severity: 'WARNING',
                    message: `${info.memory.textures} textures loaded. Consider using texture atlas.`
                });
            }
        }
    }

    /**
     * 8. Проверка Memory Leaks
     */
    checkMemoryLeaks() {
        console.log('\n🧹 [8/8] Checking Memory Leaks...');
        
        // Check if dispose methods are implemented
        const hasCleanup = typeof this.app.cleanup === 'function';
        
        if (!hasCleanup) {
            this.warnings.push({
                type: 'NO_CLEANUP_METHOD',
                severity: 'WARNING',
                message: 'App has no cleanup() method. May cause memory leaks on page reload.',
                fix: 'Implement app.cleanup() to dispose geometries, materials, textures'
            });
        }
    }

    /**
     * Генерация отчёта
     */
    generateReport() {
        console.log('\n📊 === DIAGNOSTIC REPORT ===');
        
        if (this.issues.length === 0 && this.warnings.length === 0) {
            console.log('✅ No issues found! Architecture looks good.');
            return;
        }
        
        if (this.issues.length > 0) {
            console.log(`\n🔴 CRITICAL ISSUES (${this.issues.length}):`);
            this.issues.forEach((issue, i) => {
                console.log(`\n${i + 1}. [${issue.type}] ${issue.severity}`);
                console.log(`   ${issue.message}`);
                if (issue.object) console.log(`   Object: ${issue.object}`);
                if (issue.fix) console.log(`   Fix: ${issue.fix}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
            this.warnings.forEach((warning, i) => {
                console.log(`\n${i + 1}. [${warning.type}] ${warning.severity}`);
                console.log(`   ${warning.message}`);
                if (warning.fix) console.log(`   Fix: ${warning.fix}`);
            });
        }
        
        console.log('\n' + '='.repeat(50));
    }
}

// === INTEGRATION ===

/**
 * Использование в app.js:
 */
/*
import { ArchitecturalDiagnostics } from './ArchitecturalDiagnostics.js';

// В конце init():
if (CONFIG.debug) {
    const diagnostics = new ArchitecturalDiagnostics(this);
    const result = diagnostics.runFullDiagnostics();
    
    if (result.critical) {
        console.error('❌ Critical architectural issues detected! Check console above.');
    }
    
    // Периодическая проверка каждые 30 секунд
    setInterval(() => {
        diagnostics.runFullDiagnostics();
    }, 30000);
}
*/

/**
 * Добавить в InstancedCardManager.js после _initCustomShaderMaterial()
 */

/**
 * Обновить lighting uniforms из сцены
 * Вызывать каждый кадр или когда меняется освещение
 * @param {THREE.Scene} scene 
 */
updateLightingUniforms(scene) {
    if (!this.customShaderMaterial || !this.customShaderMaterial.uniforms) {
        return;
    }
    
    // Find lights
    let ambientLight = null;
    let directionalLight = null;
    
    scene.traverse((obj) => {
        if (!ambientLight && obj.isAmbientLight) ambientLight = obj;
        if (!directionalLight && obj.isDirectionalLight) directionalLight = obj;
    });
    
    // Update uniforms
    if (ambientLight && this.customShaderMaterial.uniforms.ambientLightColor) {
        const color = ambientLight.color.clone().multiplyScalar(ambientLight.intensity);
        this.customShaderMaterial.uniforms.ambientLightColor.value.copy(color);
    }
    
    if (directionalLight) {
        if (this.customShaderMaterial.uniforms.directionalLightColor) {
            const color = directionalLight.color.clone().multiplyScalar(directionalLight.intensity);
            this.customShaderMaterial.uniforms.directionalLightColor.value.copy(color);
        }
        
        if (this.customShaderMaterial.uniforms.directionalLightDirection) {
            const dir = new THREE.Vector3();
            directionalLight.getWorldDirection(dir);
            this.customShaderMaterial.uniforms.directionalLightDirection.value.copy(dir);
        }
    }
}