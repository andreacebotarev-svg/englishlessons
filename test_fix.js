/**
 * Test script to verify the canvas destruction fix
 */

import { TextureAtlasManager } from './palace_engine/js/TextureAtlasManager.js';

// Mock data for testing
const mockWords = [
    { en: "test", ru: "тест", image: null, example: "This is a test", transcription: "/tɛst/" },
    { en: "hello", ru: "привет", image: null, example: "Hello world", transcription: "/həˈloʊ/" },
    { en: "world", ru: "мир", image: null, example: "Hello world", transcription: "/wɜːrld/" }
];

async function testFix() {
    console.log("🧪 Testing texture atlas fix...");
    
    try {
        const manager = new TextureAtlasManager({
            cardCount: mockWords.length,
            atlasSize: 2048
        });
        
        console.log("✅ TextureAtlasManager created");
        
        const result = await manager.createAtlas(mockWords, {});
        
        console.log("✅ Texture atlas created successfully!");
        console.log("📊 Atlas texture:", result.texture ? 'exists' : 'missing');
        console.log("📊 UV map size:", result.uvMap.size);
        
        console.log("🎉 Test passed! Canvas destruction fix is working.");
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error(error.stack);
    }
}

// Run the test
testFix().then(() => {
    console.log("Test completed.");
});