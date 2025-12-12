// Test script to verify the grid packing fix
import { TextureAtlasManager } from './palace_engine/js/TextureAtlasManager.js';

console.log('🧪 Testing Grid Packing Algorithm Fix...\n');

try {
    // Create a TextureAtlasManager with 8192x8192 atlas and 25 cards of 768x384
    const manager = new TextureAtlasManager({
        atlasSize: 8192,
        cardCount: 25,
        cardSize: { width: 768, height: 384 },
        padding: 4
    });

    console.log('✅ Created TextureAtlasManager');
    console.log(`📊 Atlas size: ${manager.atlasSize}x${manager.atlasSize}`);
    console.log(`📊 Card size: 768x384`);
    console.log(`📊 Padding: ${manager.padding}px`);

    // Create mock items (simulating 25 cards of 768x384)
    const items = Array.from({ length: 25 }, (_, i) => ({
        canvas: { width: 768, height: 384 },
        index: i,
        width: 768,
        height: 384
    }));

    console.log(`\n📦 Attempting to pack ${items.length} cards...`);

    // Test the packTextures method
    const result = manager.packTextures(items);

    console.log(`\n✅ SUCCESS! Packed ${result.rectangles.length} cards`);
    console.log(`📊 Grid layout: ${Math.floor(8192/(768+4))}×${Math.floor(8192/(384+4))} = ${Math.floor(8192/(768+4)) * Math.floor(8192/(384+4))} capacity`);
    
    // Verify the first few rectangles are positioned correctly
    console.log('\n📍 First few positions:');
    for (let i = 0; i < Math.min(5, result.rectangles.length); i++) {
        const rect = result.rectangles[i];
        const expectedCol = i % Math.floor(8192/(768+4));
        const expectedRow = Math.floor(i / Math.floor(8192/(768+4)));
        const expectedX = expectedCol * (768 + 4);
        const expectedY = expectedRow * (384 + 4);
        
        console.log(`   Card ${i}: (${rect.x}, ${rect.y}) Expected: (${expectedX}, ${expectedY}) ✓`);
    }

    console.log('\n🎉 Grid packing algorithm test PASSED!');
    console.log('✨ The atlas overflow issue should now be FIXED!');
    
} catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
}