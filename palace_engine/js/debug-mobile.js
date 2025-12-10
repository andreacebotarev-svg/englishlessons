// palace_engine/js/debug-mobile.js
// 🐛 ДИАГНОСТИКА МОБИЛЬНЫХ КОНТРОЛОВ

console.log('\n🐛 ========== MOBILE DEBUG START ==========');

// 1️⃣ ПРОВЕРКА TOUCH-УСТРОЙСТВА
console.log('\n1️⃣ TOUCH DEVICE DETECTION:');
console.log('  ontouchstart in window:', 'ontouchstart' in window);
console.log('  navigator.maxTouchPoints:', navigator.maxTouchPoints);
console.log('  navigator.userAgent:', navigator.userAgent);

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
console.log('  ➡️ isTouchDevice:', isTouchDevice ? '✅ TRUE' : '❌ FALSE');

// 2️⃣ ПРОВЕРКА D-PAD В DOM
console.log('\n2️⃣ D-PAD DOM CHECK:');
setTimeout(() => {
    const dpad = document.getElementById('mobile-dpad');
    console.log('  #mobile-dpad exists:', dpad ? '✅ YES' : '❌ NO');
    
    if (dpad) {
        console.log('  D-Pad position:', window.getComputedStyle(dpad).position);
        console.log('  D-Pad display:', window.getComputedStyle(dpad).display);
        console.log('  D-Pad visibility:', window.getComputedStyle(dpad).visibility);
        console.log('  D-Pad z-index:', window.getComputedStyle(dpad).zIndex);
        console.log('  D-Pad bottom:', window.getComputedStyle(dpad).bottom);
        console.log('  D-Pad left:', window.getComputedStyle(dpad).left);
        
        const buttons = dpad.querySelectorAll('.dpad-button');
        console.log('  D-Pad buttons count:', buttons.length);
        
        if (buttons.length > 0) {
            const firstBtn = buttons[0];
            console.log('  Button display:', window.getComputedStyle(firstBtn).display);
            console.log('  Button opacity:', window.getComputedStyle(firstBtn).opacity);
        }
    }
}, 2000); // Ждём 2 сек после инициализации

// 3️⃣ ПРОВЕРКА CSS ЗАГРУЗКИ
console.log('\n3️⃣ CSS LOADING CHECK:');
setTimeout(() => {
    const stylesheets = Array.from(document.styleSheets);
    console.log('  Total stylesheets:', stylesheets.length);
    
    const mobileControlsCSS = stylesheets.find(sheet => 
        sheet.href && sheet.href.includes('mobile-controls.css')
    );
    
    console.log('  mobile-controls.css loaded:', mobileControlsCSS ? '✅ YES' : '❌ NO');
    
    if (mobileControlsCSS) {
        console.log('  mobile-controls.css URL:', mobileControlsCSS.href);
        try {
            console.log('  mobile-controls.css rules:', mobileControlsCSS.cssRules?.length || 0);
        } catch(e) {
            console.log('  mobile-controls.css rules: CORS blocked');
        }
    }
    
    // Проверяем style.css
    const styleCSS = stylesheets.find(sheet => 
        sheet.href && sheet.href.includes('style.css')
    );
    console.log('  style.css loaded:', styleCSS ? '✅ YES' : '❌ NO');
}, 1000);

// 4️⃣ ПРОВЕРКА MEDIA QUERIES
console.log('\n4️⃣ MEDIA QUERIES CHECK:');
const hasHover = window.matchMedia('(hover: hover)').matches;
const hasPointerFine = window.matchMedia('(pointer: fine)').matches;
console.log('  (hover: hover):', hasHover ? '✅ TRUE (desktop)' : '❌ FALSE (touch)');
console.log('  (pointer: fine):', hasPointerFine ? '✅ TRUE (mouse)' : '❌ FALSE (touch)');

if (hasHover && hasPointerFine) {
    console.warn('  ⚠️ WARNING: Desktop detected! D-Pad will be hidden by CSS!');
}

// 5️⃣ ПРОВЕРКА VIEWPORT
console.log('\n5️⃣ VIEWPORT CHECK:');
console.log('  window.innerWidth:', window.innerWidth);
console.log('  window.innerHeight:', window.innerHeight);
console.log('  devicePixelRatio:', window.devicePixelRatio);
console.log('  screen.width:', screen.width);
console.log('  screen.height:', screen.height);

// 6️⃣ СОЗДАНИЕ ТЕСТОВОГО D-PAD (ПРИНУДИТЕЛЬНО)
console.log('\n6️⃣ FORCE CREATE TEST D-PAD:');
setTimeout(() => {
    // Удаляем старый, если есть
    const oldDpad = document.getElementById('test-dpad');
    if (oldDpad) oldDpad.remove();
    
    const testDpad = document.createElement('div');
    testDpad.id = 'test-dpad';
    testDpad.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 100px;
        height: 100px;
        background: red;
        border: 3px solid yellow;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
        text-align: center;
        pointer-events: auto;
    `;
    testDpad.textContent = 'TEST D-PAD (should be visible)';
    document.body.appendChild(testDpad);
    
    console.log('  ✅ Test D-Pad created (red box, bottom-right)');
    console.log('  If you see RED BOX → DOM/CSS works');
    console.log('  If you DON\'T see RED BOX → rendering issue');
}, 3000);

// 7️⃣ CAMERA INIT LOG
console.log('\n7️⃣ CAMERA INITIALIZATION:');
setTimeout(() => {
    // Проверяем, был ли вызов Camera.init()
    const logEntries = console.log.toString();
    console.log('  Check console for "Camera init" message');
    console.log('  Check console for "Mobile D-Pad created" message');
}, 2500);

console.log('\n🐛 ========== MOBILE DEBUG END ==========\n');

// 8️⃣ ВИЗУАЛЬНЫЙ ИНДИКАТОР
setTimeout(() => {
    const indicator = document.createElement('div');
    indicator.id = 'debug-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: #0f0;
        padding: 10px;
        border: 2px solid #0f0;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 100000;
        pointer-events: none;
    `;
    
    const dpadExists = !!document.getElementById('mobile-dpad');
    const cssLoaded = !!Array.from(document.styleSheets).find(s => s.href?.includes('mobile-controls.css'));
    
    indicator.innerHTML = `
        <div>🐛 DEBUG INFO:</div>
        <div>Touch: ${isTouchDevice ? '✅' : '❌'}</div>
        <div>D-Pad: ${dpadExists ? '✅' : '❌'}</div>
        <div>CSS: ${cssLoaded ? '✅' : '❌'}</div>
        <div>Hover: ${hasHover ? '❌' : '✅'}</div>
    `;
    
    document.body.appendChild(indicator);
}, 3500);

export {}; // ES module