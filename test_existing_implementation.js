/**
 * Test the existing TextureAtlasManager implementation
 */
import { TextureAtlasManager } from './palace_engine/js/TextureAtlasManager.js';

// Mock canvas and context for testing
global.HTMLCanvasElement = class {
    constructor() {
        this.width = 0;
        this.height = 0;
    }
    getContext() {
        return {
            clearRect: () => {},
            drawImage: () => {},
            fillStyle: '',
            fillRect: () => {}
        };
    }
};

global.document = {
    createElement: (tag) => {
        if (tag === 'canvas') {
            return new HTMLCanvasElement();
        }
        return {};
    }
};

console.log("🧪 Testing Existing TextureAtlasManager Implementation");

try {
    // Test configuration similar to what would cause the original issue
    const manager = new TextureAtlasManager({
        atlasSize: 8192,
        padding: 4,
        cardCount: 25,
        cardSize: { width: 768, height: 384 }
    });

    // Create mock items (simulating card textures)
    const mockItems = [];
    for (let i = 0; i < 25; i++) {
        mockItems.push({
            canvas: { width: 768, height: 384 },
            index: i,
            width: 768,
            height: 384
        });
    }

    console.log(`Atlas size: ${manager.atlasSize}×${manager.atlasSize}`);
    console.log(`Padding: ${manager.padding}`);
    console.log(`Number of items to pack: ${mockItems.length}`);

    // Test the packTextures method
    const result = manager.packTextures(mockItems);

    console.log(`✅ Successfully packed ${result.rectangles.length} items`);
    
    // Validate that no item goes beyond atlas boundaries
    let maxX = 0, maxY = 0;
    for (const rect of result.rectangles) {
        const rightEdge = rect.x + rect.width;
        const bottomEdge = rect.y + rect.height;
        
        maxX = Math.max(maxX, rightEdge);
        maxY = Math.max(maxY, bottomEdge);
        
        if (rightEdge > manager.atlasSize || bottomEdge > manager.atlasSize) {
            console.log(`❌ Overflow detected at position (${rect.x}, ${rect.y}) for item ${rect.index}`);
            console.log(`   Dimensions: ${rect.width}×${rect.height}`);
            console.log(`   Right edge: ${rightEdge}, Bottom edge: ${bottomEdge}`);
            console.log(`   Atlas limit: ${manager.atlasSize}`);
        }
    }

    console.log(`📊 Max coordinates used: ${maxX}×${maxY}, Atlas size: ${manager.atlasSize}×${manager.atlasSize}`);
    
    if (maxX <= manager.atlasSize && maxY <= manager.atlasSize) {
        console.log("✅ NO OVERFLOW - All items fit within atlas boundaries!");
    } else {
        console.log("❌ OVERFLOW - Some items exceed atlas boundaries!");
    }
    
} catch (error) {
    console.error("❌ Error during test:", error.message);
}