/**
 * Test script to verify the grid packing algorithm works correctly
 */

// Simulate the TextureAtlasManager logic
class TestTextureAtlasManager {
    constructor(atlasSize = 8192, padding = 4) {
        this.atlasSize = atlasSize;
        this.padding = padding;
    }

    testPacking(cardWidth, cardHeight, numCards) {
        // Calculate grid dimensions
        const cols = Math.floor(this.atlasSize / (cardWidth + this.padding));
        const rows = Math.floor(this.atlasSize / (cardHeight + this.padding));
        const capacity = cols * rows;
        
        console.log(`Card size: ${cardWidth}×${cardHeight}`);
        console.log(`Atlas size: ${this.atlasSize}×${this.atlasSize}`);
        console.log(`Padding: ${this.padding}`);
        console.log(`Grid: ${cols}×${rows} = ${capacity} capacity`);
        console.log(`Cards to pack: ${numCards}`);
        
        if (numCards > capacity) {
            console.log(`❌ OVERFLOW! Cards don't fit in atlas`);
            return false;
        }
        
        console.log(`✅ Cards fit in atlas!`);
        
        // Simulate placing cards in grid
        const items = [];
        for (let i = 0; i < numCards; i++) {
            items.push({
                canvas: null,
                index: i,
                width: cardWidth,
                height: cardHeight
            });
        }
        
        // Place cards in grid
        const rectangles = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            const x = col * (cardWidth + this.padding);
            const y = row * (cardHeight + this.padding);
            
            // Check bounds
            if (x + cardWidth > this.atlasSize || y + cardHeight > this.atlasSize) {
                console.log(`❌ Card ${i} out of bounds: (${x}, ${y})`);
                continue;
            }
            
            rectangles.push({
                canvas: item.canvas,
                index: item.index,
                x,
                y,
                width: item.width,
                height: item.height
            });
        }
        
        // Calculate stats
        const usedRows = Math.min(rows, Math.ceil(items.length / cols));
        const usedCols = Math.min(cols, Math.ceil(items.length / usedRows));
        const efficiency = ((items.length / capacity) * 100).toFixed(1);
        
        console.log(`✅ Packed ${rectangles.length}/${items.length} cards`);
        console.log(`   Grid used: ${usedCols}×${usedRows} of ${cols}×${rows}`);
        console.log(`   Efficiency: ${efficiency}%`);
        
        // Find max coordinates to verify no overflow
        let maxX = 0, maxY = 0;
        for (const rect of rectangles) {
            maxX = Math.max(maxX, rect.x + rect.width);
            maxY = Math.max(maxY, rect.y + rect.height);
        }
        
        console.log(`📊 Max X coordinate used: ${maxX} (limit: ${this.atlasSize})`);
        console.log(`📊 Max Y coordinate used: ${maxY} (limit: ${this.atlasSize})`);
        
        if (maxX > this.atlasSize || maxY > this.atlasSize) {
            console.log(`❌ OVERFLOW DETECTED!`);
            console.log(`   X overflow: ${maxX - this.atlasSize}px`);
            console.log(`   Y overflow: ${maxY - this.atlasSize}px`);
            return false;
        }
        
        console.log(`✅ NO OVERFLOW! All cards fit safely in atlas.`);
        return true;
    }
}

// Run tests
console.log("🧪 Testing Texture Atlas Packing Algorithm");
console.log("=".repeat(50));

const manager = new TestTextureAtlasManager();

console.log("\n📋 TEST 1: Current configuration (768×384 cards)");
const result1 = manager.testPacking(768, 384, 25);

console.log("\n📋 TEST 2: Alternative configuration (512×256 cards)");
const result2 = manager.testPacking(512, 256, 25);

console.log("\n📋 TEST 3: Maximum possible cards (768×384)");
// Calculate max possible cards that fit
const cols = Math.floor(8192 / (768 + 4));
const rows = Math.floor(8192 / (384 + 4));
const maxCards = cols * rows;
console.log(`Max possible cards: ${maxCards}`);
const result3 = manager.testPacking(768, 384, maxCards);

console.log("\n🏁 Test Results Summary:");
console.log(`Test 1 (768×384, 25 cards): ${result1 ? 'PASS' : 'FAIL'}`);
console.log(`Test 2 (512×256, 25 cards): ${result2 ? 'PASS' : 'FAIL'}`);
console.log(`Test 3 (768×384, ${maxCards} cards): ${result3 ? 'PASS' : 'FAIL'}`);