/**
 * ============================================
 * D-PAD DEBUG & EMERGENCY FIX SCRIPT
 * ============================================
 * 
 * Comprehensive diagnostic and correction tool for D-Pad positioning issues
 * Use this when the D-Pad is not visible or positioned incorrectly
 */

console.log('🔧 D-Pad Debug Script Loaded');

function debugDPad() {
    console.log('🔍 ========== D-PAD DIAGNOSTIC SUITE ==========');

    // 1. Проверка существования
    const dpad = document.getElementById('mobile-dpad');
    console.log('1️⃣ D-Pad exists:', !!dpad);

    if (!dpad) {
        console.log('❌ D-PAD NOT FOUND IN DOM!');
        console.log('   Check:');
        console.log('   - Is script loaded?', !!window.dpadInstance);
        console.log('   - Is touch device?', ('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        console.log('   - User agent:', navigator.userAgent);
    } else {
        // 2. Проверка стилей
        const styles = window.getComputedStyle(dpad);
        console.log('2️⃣ Computed styles:');
        console.log('   display:', styles.display);
        console.log('   visibility:', styles.visibility);
        console.log('   opacity:', styles.opacity);
        console.log('   position:', styles.position);
        console.log('   z-index:', styles.zIndex);
        console.log('   bottom:', styles.bottom);
        console.log('   left:', styles.left);
        console.log('   width:', styles.width);
        console.log('   height:', styles.height);
        console.log('   transform:', styles.transform);
        
        // 3. Проверка позиции
        const rect = dpad.getBoundingClientRect();
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        console.log('3️⃣ Position:');
        console.log('   BoundingRect:', rect);
        console.log('   Viewport:', viewport);
        
        const isVisible = 
            rect.width > 0 && rect.height > 0 &&
            styles.display !== 'none' &&
            styles.visibility !== 'hidden' &&
            parseFloat(styles.opacity) > 0;
        console.log('   Is in viewport?', isVisible);
        
        // 4. Проверка родителей
        console.log('4️⃣ Parent chain:');
        let parent = dpad.parentElement;
        let depth = 0;
        while (parent && depth < 10) {
            const pStyles = window.getComputedStyle(parent);
            console.log(`   ${depth}. ${parent.tagName} (${parent.className || 'no class'})`);
            console.log(`      overflow: ${pStyles.overflow}`);
            console.log(`      transform: ${pStyles.transform}`);
            console.log(`      perspective: ${pStyles.perspective}`);
            parent = parent.parentElement;
            depth++;
        }
    }

    console.log('🔍 ==========================================');
}

function fixDPadPosition() {
    console.log('🚑 ========== EMERGENCY D-PAD FIX ==========');
    
    const dpad = document.getElementById('mobile-dpad');
    if (!dpad) {
        console.error('❌ D-Pad element not found!');
        return false;
    }
    
    console.log('✅ D-Pad found, applying emergency fixes...');
    
    // 1. Проверяем родителей на transform
    let parent = dpad.parentElement;
    let hasTransform = false;
    while (parent && parent !== document.body) {
        const parentStyles = window.getComputedStyle(parent);
        if (parentStyles.transform && parentStyles.transform !== 'none') {
            console.warn(`⚠️ Found transform on parent: ${parent.tagName}`);
            console.warn(`   Transform: ${parentStyles.transform}`);
            hasTransform = true;
        }
        parent = parent.parentElement;
    }
    
    // 2. Если найден transform - перемещаем в body
    if (hasTransform) {
        console.log('⚠️ Transform detected in parent chain, moving to body...');
        document.body.appendChild(dpad);
    }
    
    // 3. Принудительно применяем стили
    dpad.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        top: auto !important;
        right: auto !important;
        width: 150px !important;
        height: 150px !important;
        z-index: 2147483647 !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        background: rgba(255, 0, 0, 0.9) !important;
        border: 5px solid red !important;
        border-radius: 12px !important;
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.8) !important;
        isolation: isolate !important;
        transform: none !important;
    `;
    
    // 4. Применяем стили к кнопкам
    const buttons = dpad.querySelectorAll('.dpad-button');
    buttons.forEach(button => {
        button.style.cssText += `
            position: absolute !important;
            pointer-events: auto !important;
            transform: none !important;
            will-change: background !important;
        `;
    });
    
    // 5. Визуальная индикация
    dpad.style.border = '5px solid yellow !important';
    dpad.style.boxShadow = '0 0 50px rgba(255, 255, 0, 1) !important';
    
    setTimeout(() => {
        dpad.style.border = '5px solid red !important';
        dpad.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8) !important';
    }, 500);
    
    console.log('✅ Emergency fixes applied!');
    console.log('🔍 New position:', dpad.getBoundingClientRect());
    console.log('🔧 ==========================================');
    
    return true;
}

function checkAndFixDPad() {
    const dpad = document.getElementById('mobile-dpad');
    if (!dpad) {
        console.log('❌ D-Pad not found, cannot fix');
        return false;
    }
    
    const rect = dpad.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    
    // Проверяем, находится ли элемент в пределах вьюпорта
    const isOutOfBounds = 
        rect.left < -100 || rect.right > viewport.width + 100 ||
        rect.top < -100 || rect.bottom > viewport.height + 100;
    
    if (isOutOfBounds) {
        console.log('⚠️ D-Pad is out of bounds, applying fix...');
        return fixDPadPosition();
    }
    
    console.log('✅ D-Pad is within viewport bounds');
    return true;
}

// Добавляем функции в глобальный объект для удобства
window.dpadDebug = {
    debug: debugDPad,
    fix: fixDPadPosition,
    checkAndFix: checkAndFixDPad,
    instance: window.dpadInstance || null
};

console.log('✅ D-Pad Debug Tools available: window.dpadDebug');

// Запускаем проверку через 1 секунду и затем каждые 5 секунд
setTimeout(() => {
    console.log('🔍 Running initial D-Pad check...');
    checkAndFixDPad();
}, 1000);

setInterval(() => {
    checkAndFixDPad();
}, 5000);

// Слушаем событие загрузки локации
window.addEventListener('location-loaded', () => {
    setTimeout(() => {
        console.log('📍 Location loaded, checking D-Pad...');
        checkAndFixDPad();
    }, 500);
});