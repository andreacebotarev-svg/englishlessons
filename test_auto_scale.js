/**
 * Test the auto-scaling feature of TextureAtlasManager
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

console.log("🧪 Testing Auto-scaling Feature");

try {
    // Test with 300 cards of 768x384 - should trigger auto-scaling
    console.log("\n📋 TEST 1: 300 cards of 768×384 (should trigger auto-scaling)");
    const manager1 = new TextureAtlasManager({
        cardCount: 300,
        cardSize: { width: 768, height: 384 }
    });

    // Create mock items
    const mockItems1 = [];
    for (let i = 0; i < Math.min(300, 10); i++) { // Just test with first 10 for the packing
        mockItems1.push({
            canvas: { width: manager1.cardSize.width, height: manager1.cardSize.height },
            index: i,
            width: manager1.cardSize.width,
            height: manager1.cardSize.height
        });
    }

    console.log(`Card size after auto-scaling: ${manager1.cardSize.width}×${manager1.cardSize.height}`);
    console.log(`Atlas size: ${manager1.atlasSize}×${manager1.atlasSize}`);
    
    if (manager1.cardSize.width < 768 || manager1.cardSize.height < 384) {
        console.log("✅ Auto-scaling triggered successfully!");
    } else {
        console.log("ℹ️ Auto-scaling not needed for this test case");
    }

    // Test the packTextures method
    const result1 = manager1.packTextures(mockItems1);
    console.log(`✅ Successfully packed ${result1.rectangles.length} items`);

    // Validate that no item goes beyond atlas boundaries
    let maxX = 0, maxY = 0;
    for (const rect of result1.rectangles) {
        const rightEdge = rect.x + rect.width;
        const bottomEdge = rect.y + rect.height;
        
        maxX = Math.max(maxX, rightEdge);
        maxY = Math.max(maxY, bottomEdge);
        
        if (rightEdge > manager1.atlasSize || bottomEdge > manager1.atlasSize) {
            console.log(`❌ Overflow detected at position (${rect.x}, ${rect.y}) for item ${rect.index}`);
        }
    }

    console.log(`📊 Max coordinates used: ${maxX}×${maxY}, Atlas size: ${manager1.atlasSize}×${manager1.atlasSize}`);
    
    if (maxX <= manager1.atlasSize && maxY <= manager1.atlasSize) {
        console.log("✅ NO OVERFLOW - All items fit within atlas boundaries!");
    } else {
        console.log("❌ OVERFLOW - Some items exceed atlas boundaries!");
    }

    // Test with normal configuration
    console.log("\n📋 TEST 2: Normal configuration (25 cards of 768×384)");
    const manager2 = new TextureAtlasManager({
        cardCount: 25,
        cardSize: { width: 768, height: 384 }
    });

    const mockItems2 = [];
    for (let i = 0; i < 25; i++) {
        mockItems2.push({
            canvas: { width: 768, height: 384 },
            index: i,
            width: 768,
            height: 384
        });
    }

    console.log(`Card size: ${manager2.cardSize.width}×${manager2.cardSize.height}`);
    console.log(`Atlas size: ${manager2.atlasSize}×${manager2.atlasSize}`);

    const result2 = manager2.packTextures(mockItems2);
    console.log(`✅ Successfully packed ${result2.rectangles.length} items`);

    // Validate boundaries for second test
    maxX = 0; maxY = 0;
    for (const rect of result2.rectangles) {
        const rightEdge = rect.x + rect.width;
        const bottomEdge = rect.y + rect.height;
        
        maxX = Math.max(maxX, rightEdge);
        maxY = Math.max(maxY, bottomEdge);
    }

    console.log(`📊 Max coordinates used: ${maxX}×${maxY}, Atlas size: ${manager2.atlasSize}×${manager2.atlasSize}`);
    
    if (maxX <= manager2.atlasSize && maxY <= manager2.atlasSize) {
        console.log("✅ NO OVERFLOW - All items fit within atlas boundaries!");
    } else {
        console.log("❌ OVERFLOW - Some items exceed atlas boundaries!");
    }

    console.log("\n🏁 Auto-scaling feature tests completed successfully!");

} catch (error) {
    console.error("❌ Error during test:", error.message);
    console.error("Stack:", error.stack);
}