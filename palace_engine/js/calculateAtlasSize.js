// palace_engine/js/calculateAtlasSize.js
/**
 * 📐 Калькулятор оптимального размера атласа
 * Запустить в консоли: calculateOptimalAtlasSize(25, 768, 384)
 */
window.calculateOptimalAtlasSize = function(cardCount, cardWidth, cardHeight, efficiency = 0.75) {
    const totalArea = cardCount * cardWidth * cardHeight;
    const requiredArea = totalArea / efficiency;
    const sideLength = Math.sqrt(requiredArea);
    
    // Next power of 2
    const nextPOT = Math.pow(2, Math.ceil(Math.log2(sideLength)));
    
    console.log('═══════════════════════════════════════');
    console.log('📐 ATLAS SIZE CALCULATOR');
    console.log('═══════════════════════════════════════');
    console.log(`Cards: ${cardCount} × ${cardWidth}×${cardHeight}`);
    console.log(`Total Area: ${totalArea.toLocaleString()} px²`);
    console.log(`Efficiency: ${(efficiency * 100).toFixed(0)}%`);
    console.log(`Required Area: ${requiredArea.toLocaleString()} px²`);
    console.log(`Side Length: ${sideLength.toFixed(0)}px`);
    console.log(`Recommended Atlas: ${nextPOT}×${nextPOT}`);
    
    // Check if it fits in common sizes
    const sizes = [2048, 4096, 8192, 16384];
    console.log('\n🎯 FIT ANALYSIS:');
    sizes.forEach(size => {
        const capacity = (size * size * efficiency) / (cardWidth * cardHeight);
        const fits = capacity >= cardCount;
        console.log(`${fits ? '✅' : '❌'} ${size}×${size}: Can fit ${Math.floor(capacity)} cards`);
    });
    
    console.log('═══════════════════════════════════════\n');
    
    return nextPOT;
};

// Auto-run для текущих параметров
console.log('💡 TIP: Run calculateOptimalAtlasSize(25, 768, 384) to recalculate');