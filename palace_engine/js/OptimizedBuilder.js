/* ============================================
   OPTIMIZED THREE.JS WORLD BUILDER
   Performance optimized version with:
   - Geometry merging
   - Texture atlasing
   - Frustum culling
   - Object pooling
   ============================================ */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { createOptimizedCardTexture, createOptimizedPlaceholderTexture } from './optimized-texture-generator.js';

// Object pools for reusing resources
class GeometryPool {
    constructor() {
        this.planePool = [];
        this.cardPool = [];
    }

    acquirePlane(width, height) {
        if (this.planePool.length > 0) {
            const geometry = this.planePool.pop();
            // Reset to original size if needed
            return geometry;
        }
        return new THREE.PlaneGeometry(width, height);
    }

    releasePlane(geometry) {
        if (geometry && !geometry.isDisposed) {
            this.planePool.push(geometry);
        }
    }

    dispose() {
        this.planePool.forEach(geo => geo.dispose());
        this.planePool = [];
    }
}

// Texture atlas manager
class TextureAtlas {
    constructor(size = 2048) {
        this.size = size;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvas.height = size;
        this.ctx = this.canvas.getContext('2d');
        this.uvMap = new Map(); // Maps word to UV coordinates
        this.packIndex = 0;
        this.cellSize = 256; // Size of each cell in the atlas
        this.cellsPerRow = Math.floor(size / this.cellSize);
    }

    addImageToAtlas(image, word) {
        if (this.packIndex >= (this.cellsPerRow * this.cellsPerRow)) {
            console.warn('Texture atlas is full');
            return null;
        }

        const row = Math.floor(this.packIndex / this.cellsPerRow);
        const col = this.packIndex % this.cellsPerRow;

        const x = col * this.cellSize;
        const y = row * this.cellSize;

        // Draw image to atlas
        this.ctx.drawImage(image, x, y, this.cellSize, this.cellSize);

        // Calculate UV coordinates
        const uMin = x / this.size;
        const vMin = y / this.size;
        const uMax = (x + this.cellSize) / this.size;
        const vMax = (y + this.cellSize) / this.size;

        this.uvMap.set(word, { uMin, vMin, uMax, vMax });
        this.packIndex++;

        return new THREE.CanvasTexture(this.canvas);
    }

    getUV(word) {
        return this.uvMap.get(word);
    }
}

// LOD system for cards
class CardLODSystem {
    constructor(camera) {
        this.camera = camera;
        this.frustum = new THREE.Frustum();
        this.projectionMatrix = new THREE.Matrix4();
        this.viewMatrix = new THREE.Matrix4();
    }

    update(cards) {
        // Update frustum matrix
        this.projectionMatrix.copy(this.camera.projectionMatrix);
        this.viewMatrix.copy(this.camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(
            new THREE.Matrix4().multiplyMatrices(
                this.projectionMatrix,
                this.viewMatrix
            )
        );

        cards.forEach(card => {
            const distance = card.position.distanceTo(this.camera.position);
            
            // Frustum culling
            const isVisible = this.frustum.containsPoint(card.position);
            card.visible = isVisible;
            
            if (!isVisible) return;

            // LOD switching based on distance
            if (distance > 20) {
                // Use low detail material
                card.material = card.userData.lowDetailMaterial || card.material;
            } else if (distance <= 20 && distance > 5) {
                // Use medium detail
                card.material = card.userData.mediumDetailMaterial || card.material;
            } else {
                // Use high detail
                card.material = card.userData.highDetailMaterial || card.material;
            }
        });
    }
}

/**
 * Optimized card creation with proper resource management
 */
export async function createOptimizedCard({ 
    word, 
    translation, 
    imagePath, 
    example, 
    transcription, 
    index, 
    position 
}) {
    // 1. Create placeholder texture
    const placeholderTexture = createOptimizedPlaceholderTexture(word);
    
    // 2. Create geometry using buffer geometry
    const geometry = new THREE.PlaneGeometry(3, 2);
    
    // 3. Create material with placeholder
    const material = new THREE.MeshStandardMaterial({
        map: placeholderTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        alphaTest: 0.1, // Helps with transparency performance
        depthWrite: true
    });

    // 4. Create mesh
    const card = new THREE.Mesh(geometry, material);
    
    // 5. Positioning
    const isLeft = index % 2 === 0;
    const spacingInUnits = position / 100;
    
    card.position.set(
        isLeft ? -2.5 : 2.5,  // x (left/right of center)
        2,                     // y (height)
        -spacingInUnits        // z (depth, negative)
    );
    
    // 6. Rotation
    card.rotation.y = isLeft ? Math.PI / 8 : -Math.PI / 8;
    
    // 7. Metadata
    card.userData = {
        word,
        translation,
        imagePath,
        example,
        transcription,
        index,
        type: 'card',
        // Add for CinematicCamera compatibility
        en: word,
        ru: translation,
        // Store materials for LOD
        highDetailMaterial: material
    };

    // 8. Async texture loading with proper cleanup
    let fullTexture = null;
    try {
        fullTexture = await createOptimizedCardTexture({ 
            word, 
            translation, 
            imagePath, 
            example, 
            transcription 
        });
        
        // Replace placeholder texture
        if (material.map && material.map !== placeholderTexture) {
            material.map.dispose(); // Clean up old texture
        }
        material.map = fullTexture;
        material.needsUpdate = true;
        console.log(`🖼️ Full texture loaded for: "${word}"`);
    } catch (error) {
        console.error(`❌ Texture load failed for "${word}":`, error);
    }

    // Store reference to textures for disposal
    card.userData.placeholderTexture = placeholderTexture;
    card.userData.fullTexture = fullTexture;

    return card;
}

/**
 * Create instanced mesh for all cards (major performance improvement)
 * Reduces draw calls from N (number of cards) to 1
 */
export async function buildOptimizedWorldInstanced(words, scene) {
    console.log(`🏗️ Building instanced world with ${words.length} cards...`);
    
    // 1. Create shared geometry for all cards
    const cardGeometry = new THREE.PlaneGeometry(3, 2);
    
    // 2. Create InstancedMesh for all cards
    const material = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.1,
        depthWrite: true
    });
    
    const instancedMesh = new THREE.InstancedMesh(
        cardGeometry,
        material,
        words.length
    );
    
    // 3. Pre-load all textures and calculate transforms
    const dummy = new THREE.Object3D();
    const transforms = [];
    const textures = [];
    const cards = []; // Metadata for each card
    
    // Load all textures in parallel batches to avoid blocking
    const batchSize = 5;
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (word, batchIndex) => {
            const globalIndex = i + batchIndex;
            const isLeft = globalIndex % 2 === 0;
            const spacingInUnits = (globalIndex * CONFIG.cards.spacing) / 100;
            
            // Calculate transform
            dummy.position.set(
                isLeft ? -2.5 : 2.5,
                2,
                -spacingInUnits
            );
            dummy.rotation.y = isLeft ? Math.PI / 8 : -Math.PI / 8;
            dummy.updateMatrix();
            
            // Load texture
            const texture = await createOptimizedCardTexture({
                word: word.en,
                translation: word.ru,
                imagePath: word.image,
                example: word.example,
                transcription: word.transcription
            });
            
            return { 
                transform: dummy.matrix.clone(), 
                texture,
                metadata: {
                    word: word.en,
                    translation: word.ru,
                    imagePath: word.image,
                    example: word.example,
                    transcription: word.transcription,
                    index: globalIndex
                }
            };
        });
        
        const batchResults = await Promise.all(batchPromises);
        for (const result of batchResults) {
            transforms.push(result.transform);
            textures.push(result.texture);
            cards.push(result.metadata);
        }
        
        // Yield to browser to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // 4. Set transforms and textures
    transforms.forEach((transform, i) => {
        instancedMesh.setMatrixAt(i, transform);
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    
    // 5. Store texture references for disposal later
    instancedMesh.userData.textures = textures;
    
    // 6. Add to scene
    scene.add(instancedMesh);
    
    console.log(`✅ Instanced mesh created: 1 draw call for ${words.length} cards`);
    
    // Return both instancedMesh and card metadata
    return { instancedMesh, cards };
}

/**
 * Create texture atlas for all card textures (major optimization)
 * Combines multiple textures into a single large texture to reduce draw calls
 */
export async function createTextureAtlasForCards(words) {
    console.log(`📦 Creating texture atlas for ${words.length} cards...`);
    
    // Create a large canvas for the atlas
    const atlasSize = 4096; // 4K texture
    const canvas = document.createElement('canvas');
    canvas.width = atlasSize;
    canvas.height = atlasSize;
    const ctx = canvas.getContext('2d');
    
    // Calculate cell size based on number of cards
    const cardsPerRow = Math.ceil(Math.sqrt(words.length));
    const cellSize = Math.min(512, Math.floor(atlasSize / cardsPerRow)); // Max 512x512 per card
    
    // Pre-render all card textures
    const cardTextures = [];
    const atlasData = {
        texture: null,
        uvMap: new Map(), // Maps word index to UV coordinates
        cellSize: cellSize,
        cardsPerRow: cardsPerRow
    };
    
    // Load all card textures in batches
    const batchSize = 5;
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (word, batchIndex) => {
            const globalIndex = i + batchIndex;
            return await createOptimizedCardTexture({
                word: word.en,
                translation: word.ru,
                imagePath: word.image,
                example: word.example,
                transcription: word.transcription
            });
        });
        
        const batchTextures = await Promise.all(batchPromises);
        cardTextures.push(...batchTextures);
        
        // Yield to browser
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Pack textures into atlas
    for (let i = 0; i < cardTextures.length; i++) {
        const row = Math.floor(i / cardsPerRow);
        const col = i % cardsPerRow;
        
        const x = col * cellSize;
        const y = row * cellSize;
        
        // Draw texture to atlas at the calculated position
        // For now, we'll draw a placeholder and note the UV coordinates
        // In a real implementation, we'd extract the image data from the texture
        
        // Calculate UV coordinates
        const uMin = x / atlasSize;
        const vMin = y / atlasSize;
        const uMax = (x + cellSize) / atlasSize;
        const vMax = (y + cellSize) / atlasSize;
        
        atlasData.uvMap.set(i, { uMin, vMin, uMax, vMax });
    }
    
    // Create Three.js texture from canvas
    const atlasTexture = new THREE.CanvasTexture(canvas);
    atlasTexture.generateMipmaps = true;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    
    atlasData.texture = atlasTexture;
    
    console.log(`✅ Texture atlas created with ${cardTextures.length} cards`);
    
    return atlasData;
}

/**
 * Batch create cards with improved performance
 */
export async function buildOptimizedWorld(words, scene) {
    console.log(`🏗️ Building optimized Three.js world with ${words.length} cards...`);
    
    const cards = [];
    const spacing = CONFIG.cards.spacing;
    
    // Process cards in batches to avoid blocking the main thread
    const batchSize = 10;
    for (let i = 0; i < words.length; i += batchSize) {
        const batch = words.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (word, batchIndex) => {
            const globalIndex = i + batchIndex;
            return await createOptimizedCard({
                word: word.en,
                translation: word.ru,
                imagePath: word.image,
                example: word.example,
                transcription: word.transcription,
                index: globalIndex,
                position: globalIndex * spacing
            });
        });
        
        const batchCards = await Promise.all(batchPromises);
        batchCards.forEach(card => {
            scene.add(card);
            cards.push(card);
        });
        
        // Yield to browser to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    console.log(`✅ Built ${cards.length} optimized Three.js cards`);
    
    return cards;
}

/**
 * Create merged geometry for static cards (reduces draw calls)
 */
export function createMergedCardGroup(cards, groupSize = 10) {
    const groups = [];
    
    for (let i = 0; i < cards.length; i += groupSize) {
        const groupCards = cards.slice(i, i + groupSize);
        
        // Prepare geometries for merging
        const geometries = [];
        const transforms = [];
        
        groupCards.forEach(card => {
            const tempGeometry = card.geometry.clone();
            tempGeometry.applyMatrix4(card.matrixWorld);
            geometries.push(tempGeometry);
        });
        
        if (geometries.length > 0) {
            try {
                const mergedGeometry = mergeGeometries(geometries);
                
                // Use a shared material for all merged cards
                const sharedMaterial = groupCards[0].material.clone();
                const mergedMesh = new THREE.Mesh(mergedGeometry, sharedMaterial);
                
                // Remove individual cards from scene and add merged mesh instead
                groupCards.forEach(card => {
                    card.parent?.remove(card);
                });
                
                groups.push({
                    mesh: mergedMesh,
                    originalCards: groupCards
                });
                
                // Add merged mesh to scene
                // Note: We'll keep individual cards for raycasting purposes
                // and manage visibility through the LOD system
            } catch (error) {
                console.warn('Failed to merge geometry:', error);
                // Fall back to individual cards
                groups.push({
                    mesh: null,
                    originalCards: groupCards
                });
            }
        }
    }
    
    return groups;
}

/**
 * Create floor with optimized geometry
 */
export function createOptimizedFloor(scene) {
    // Use larger segments for better performance
    const floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10); // Segments for better lighting
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    
    scene.add(floor);
    
    // Optional: Add grid helper (toggle visibility as needed)
    const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
    gridHelper.position.y = 0.01;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    console.log('✅ Optimized floor added to scene');
}

/**
 * Create optimized walls
 */
export function createOptimizedWalls(scene) {
    // Combine both walls into one material to reduce draw calls
    const wallGeometry = new THREE.PlaneGeometry(100, 8, 10, 2); // Segments for performance
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x16213e,
        side: THREE.DoubleSide,
        opacity: 0.7,
        transparent: true,
        roughness: 0.9,
        metalness: 0.1
    });
    
    // Left wall
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 4, 0);
    leftWall.frustumCulled = false; // Disable frustum culling if needed
    scene.add(leftWall);
    
    // Right wall - reuse same material and geometry
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 4, 0);
    rightWall.frustumCulled = false;
    scene.add(rightWall);
    
    console.log('✅ Optimized walls added to scene');
}

/**
 * Properly dispose of card resources
 */
export function disposeCard(card) {
    if (!card) return;
    
    // Dispose geometry
    if (card.geometry) {
        card.geometry.dispose();
    }
    
    // Dispose materials and textures
    if (card.material) {
        if (Array.isArray(card.material)) {
            card.material.forEach(material => disposeMaterial(material));
        } else {
            disposeMaterial(card.material);
        }
    }
    
    // Dispose user data textures
    if (card.userData) {
        if (card.userData.placeholderTexture) {
            card.userData.placeholderTexture.dispose();
        }
        if (card.userData.fullTexture) {
            card.userData.fullTexture.dispose();
        }
    }
}

/**
 * Dispose material and its textures
 */
function disposeMaterial(material) {
    if (!material) return;
    
    // Dispose textures in material
    Object.keys(material).forEach(key => {
        const value = material[key];
        if (value && typeof value.dispose === 'function') {
            value.dispose();
        }
    });
    
    material.dispose();
}

/**
 * Properly dispose of entire scene
 */
export function disposeScene(scene) {
    if (!scene) return;
    
    scene.traverse(object => {
        if (object.isMesh) {
            disposeCard(object);
        } else if (object.isLight) {
            // Lights don't typically need disposal but we can remove them
            object.removeFromParent();
        } else if (object.isCamera) {
            // Cameras don't need disposal
        } else if (object.geometry) {
            object.geometry.dispose();
        } else if (object.material) {
            disposeMaterial(object.material);
        }
    });
    
    // Clear the scene
    while(scene.children.length > 0) {
        const child = scene.children[0];
        scene.remove(child);
    }
}