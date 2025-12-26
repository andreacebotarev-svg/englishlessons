/**
 * 🖼️ OPTIMIZED TEXTURE GENERATOR FOR CARDS
 * 
 * Optimized version with power-of-two textures and proper resource management
 */

import * as THREE from 'three';

/**
 * Ensure texture dimensions are power of 2
 */
function nextPowerOfTwo(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2)));
}

/**
 * Load image with proper power-of-two dimensions
 */
function loadImageAsync(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            // Create canvas with power-of-two dimensions
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate power-of-two dimensions
            const width = nextPowerOfTwo(img.width);
            const height = nextPowerOfTwo(img.height);
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw image centered on canvas
            const offsetX = (width - img.width) / 2;
            const offsetY = (height - img.height) / 2;
            ctx.drawImage(img, offsetX, offsetY, img.width, img.height);
            
            // Create texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            
            resolve(texture);
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Failed to load image: ${imagePath}`);
            reject(null);
        };
        
        img.src = `../images/${imagePath}`;
        
        // Timeout 5 seconds
        setTimeout(() => {
            if (!img.complete) {
                console.warn(`⏱️ Image load timeout: ${imagePath}`);
                reject(null);
            }
        }, 5000);
    });
}

/**
 * Load image specifically for canvas drawing (returns HTMLImageElement, not Three.js texture)
 */
function loadImageForCanvas(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            if (img.complete && img.naturalWidth > 0) {
                resolve(img);
            } else {
                reject(new Error('Image loaded but invalid'));
            }
        };
        
        img.onerror = () => reject(new Error(`Failed to load: ${imagePath}`));
        img.src = `../images/${imagePath}`;
        
        setTimeout(() => {
            if (!img.complete) {
                reject(new Error(`Timeout loading: ${imagePath}`));
            }
        }, 5000);
    });
}

/**
 * Draw optimized background
 */
function drawBackground(ctx, width, height) {
    // Gradient from dark blue to blue
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f3460');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Frame
    ctx.strokeStyle = 'rgba(15, 76, 117, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4); // inset for anti-aliasing
}

/**
 * Draw optimized text
 */
function drawText(ctx, word, translation, transcription, example, width, height) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Enable text smoothing
    ctx.textRendering = 'optimizeLegibility';
    ctx.fontKerning = 'auto';
    ctx.imageSmoothingEnabled = true;
    
    // 1. Word (large, white)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "SF Pro Display", Arial, sans-serif';  // Reduced from 68px for better fit
    ctx.fillText(word, width / 2, 120);
    
    // 2. Transcription (below word, gray)
    if (transcription) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '28px "SF Pro Display", Arial, sans-serif';
        ctx.fillText(transcription, width / 2, 170);
    }
    
    // 3. Example (bottom, small)
    if (example) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'italic 24px "SF Pro Display", Arial, sans-serif';
        
        // Text wrapping
        const maxWidth = width - 40;
        const words = example.split(' ');
        let line = '';
        let y = height - 100;
        
        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, width / 2, y);
                line = word + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width / 2, y);
    }
}

/**
 * Draw optimized image
 */
async function drawImage(ctx, imagePath, width, height) {
    if (!imagePath) return null;
    
    try {
        const img = await loadImageForCanvas(imagePath);
        
        if (!img) return null;
        
        // Calculate image area
        const imageAreaWidth = width - 100;
        const imageAreaHeight = 200;
        const imageX = 50;
        const imageY = 220;
        
        // Calculate scale (cover)
        const scale = Math.max(
            imageAreaWidth / img.width,
            imageAreaHeight / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center
        const offsetX = imageX + (imageAreaWidth - scaledWidth) / 2;
        const offsetY = imageY + (imageAreaHeight - scaledHeight) / 2;
        
        // Rounded corners clip
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imageX, imageY, imageAreaWidth, imageAreaHeight, 12);
        ctx.clip();
        
        // Draw image
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        ctx.restore();
        
        return img;
    } catch (error) {
        console.warn('Image drawing failed:', error);
        return null;
    }
}

/**
 * Create optimized card texture with power-of-two dimensions
 */
export async function createOptimizedCardTexture({ 
    word, 
    translation, 
    imagePath = null, 
    example = null, 
    transcription = null 
}) {
    // Use power-of-two dimensions
    const width = 768; // was 1024 (already power of 2) - reduced for better atlas packing
    const height = 384; // was 512 (already power of 2) - reduced for better atlas packing
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // 1. Background
    drawBackground(ctx, canvas.width, canvas.height);
    
    // 2. Image (if exists)
    if (imagePath) {
        await drawImage(ctx, imagePath, canvas.width, canvas.height);
    }
    
    // 3. Text
    drawText(ctx, word, translation, transcription, example, canvas.width, canvas.height);
    
    // 4. Create Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    
    // Optimize texture filtering
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4; // Enable anisotropic filtering if available
    
    console.log(`✅ Optimized texture created for: "${word}"`);
    
    // ✅ CRITICAL FIX: Do NOT destroy canvas here
    // Canvas must stay alive until TextureAtlasManager finishes packing
    // Cleanup happens in TextureAtlasManager.createAtlas() after drawImage()
    
    return texture;
}

/**
 * Create optimized placeholder texture
 */
export function createOptimizedPlaceholderTexture(word) {
    const width = 512; // power of 2
    const height = 256; // power of 2
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Gray background
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false; // No mipmaps for placeholder
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
}

/**
 * Batch texture loading for better performance
 */
export async function batchCreateOptimizedTextures(cardsData) {
    const batchSize = 5; // Limit concurrent texture creation
    const textures = [];
    
    for (let i = 0; i < cardsData.length; i += batchSize) {
        const batch = cardsData.slice(i, i + batchSize);
        const batchPromises = batch.map(data => createOptimizedCardTexture(data));
        
        const batchTextures = await Promise.all(batchPromises);
        textures.push(...batchTextures);
        
        // Yield to browser to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return textures;
}

/**
 * Creates a texture atlas from multiple images
 * @param {Array} images - Array of image URLs or HTMLImageElement objects
 * @param {number} atlasSize - Size of the atlas texture (default 2048)
 * @returns {Object} Object containing the atlas texture and UV coordinates mapping
 */
async function createTextureAtlas(images, atlasSize = 2048) {
    console.log(`📦 Creating texture atlas for ${images.length} images, size: ${atlasSize}x${atlasSize}`);
    
    const canvas = document.createElement('canvas');
    canvas.width = atlasSize;
    canvas.height = atlasSize;
    const ctx = canvas.getContext('2d');
    
    // Load all images first
    const loadedImages = await Promise.all(
        images.map(async (img) => {
            if (typeof img === 'string') {
                const imagePromise = new Promise((resolve) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = () => resolve(null);
                    image.src = img;
                });
                return await imagePromise;
            } else {
                return img;
            }
        })
    );
    
    // Simple bin packing algorithm
    const atlasData = {
        texture: null,
        uvMap: new Map(), // Maps image index to UV coordinates
        packedImages: []
    };
    
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    
    for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        
        if (!img) continue;
        
        // Ensure image dimensions are power of 2
        const potWidth = nextPowerOfTwo(img.width);
        const potHeight = nextPowerOfTwo(img.height);
        
        // If image doesn't fit in current row, go to next row
        if (x + potWidth > atlasSize) {
            x = 0;
            y += rowHeight;
            rowHeight = 0;
        }
        
        // If image doesn't fit vertically, expand canvas or skip
        if (y + potHeight > atlasSize) {
            console.warn(`⚠️ Image ${i} doesn't fit in atlas, skipping`);
            continue;
        }
        
        // Draw image on atlas with power-of-2 dimensions
        ctx.drawImage(img, x, y, img.width, img.height);
        
        // Calculate UV coordinates
        const u1 = x / atlasSize;
        const v1 = y / atlasSize;
        const u2 = (x + img.width) / atlasSize;
        const v2 = (y + img.height) / atlasSize;
        
        // Store UV mapping
        atlasData.uvMap.set(i, { u1, v1, u2, v2 });
        
        // Track packed images
        atlasData.packedImages.push({
            index: i,
            x, y, width: img.width, height: img.height
        });
        
        // Update positions
        x += potWidth;
        rowHeight = Math.max(rowHeight, potHeight);
    }
    
    // Create Three.js texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.generateMipmaps = true;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    
    atlasData.texture = texture;
    
    console.log(`✅ Texture atlas created with ${atlasData.packedImages.length} images`);
    return atlasData;
}

// Export the function
export { createTextureAtlas };