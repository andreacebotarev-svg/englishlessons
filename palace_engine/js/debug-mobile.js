/**
 * =====================================================
 * ULTRA-DETAILED MOBILE D-PAD DEBUG DIAGNOSTICS v2.0
 * =====================================================
 * 
 * Автоматический анализ D-Pad с визуализацией
 * Показывает ПОЧЕМУ D-Pad не виден
 */

console.log('\n========== 🐛 MOBILE DEBUG START ==========\n');

// ============================================
// 1️⃣ TOUCH DEVICE DETECTION
// ============================================

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

console.log('📱 TOUCH DEVICE DETECTION:');
console.log(`   ontouchstart in window: ${'ontouchstart' in window}`);
console.log(`   navigator.maxTouchPoints: ${navigator.maxTouchPoints}`);
console.log(`   navigator.userAgent: ${navigator.userAgent}`);
console.log(`   ✅ isTouchDevice: ${isTouchDevice}`);

if (!isTouchDevice) {
    console.log('⚠️ Desktop detected, some mobile features may not work');
}

// ============================================
// 2️⃣ MEDIA QUERIES CHECK
// ============================================

console.log('\n📺 MEDIA QUERIES CHECK:');

const mediaQueries = [
    { query: '(hover: hover)', name: 'Hover support' },
    { query: '(hover: none)', name: 'Touch device (no hover)' },
    { query: '(pointer: fine)', name: 'Precise pointer (mouse)' },
    { query: '(pointer: coarse)', name: 'Coarse pointer (touch)' },
    { query: '(max-width: 768px)', name: 'Mobile screen' },
    { query: '(orientation: portrait)', name: 'Portrait orientation' }
];

mediaQueries.forEach(({ query, name }) => {
    const matches = window.matchMedia(query).matches;
    console.log(`   ${matches ? '✅' : '❌'} ${name}: ${query}`);
});

// ============================================
// 3️⃣ VIEWPORT CHECK
// ============================================

console.log('\n📊 VIEWPORT CHECK:');
console.log(`   window.innerWidth: ${window.innerWidth}`);
console.log(`   window.innerHeight: ${window.innerHeight}`);
console.log(`   window.devicePixelRatio: ${window.devicePixelRatio}`);
console.log(`   screen.width: ${screen.width}`);
console.log(`   screen.height: ${screen.height}`);

// ============================================
// 4️⃣ D-PAD DOM CHECK
// ============================================

function checkDPad() {
    console.log('\n🔍 D-PAD DOM CHECK:');
    
    const dpad = document.getElementById('mobile-dpad');
    
    if (!dpad) {
        console.error('❌ #mobile-dpad NOT FOUND in DOM!');
        console.log('   Searching for elements with "dpad" in id/class...');
        const matches = document.querySelectorAll('[id*="dpad"], [class*="dpad"]');
        console.log(`   Found ${matches.length} potential D-Pad elements:`, matches);
        return null;
    }
    
    console.log('✅ #mobile-dpad EXISTS in DOM');
    console.log('   Element:', dpad);
    console.log('   Tag:', dpad.tagName);
    console.log('   ID:', dpad.id);
    console.log('   Class:', dpad.className);
    console.log('   Data attributes:', Object.fromEntries(
        Array.from(dpad.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => [attr.name, attr.value])
    ));
    
    return dpad;
}

// ============================================
// 5️⃣ CSS LOADING CHECK
// ============================================

console.log('\n🎨 CSS LOADING CHECK:');

const cssFiles = [
    'mobile-controls.css',
    'style.css',
    'quiz-mode.css'
];

const stylesheets = Array.from(document.styleSheets);
console.log(`   Total stylesheets: ${stylesheets.length}`);

cssFiles.forEach(file => {
    const loaded = stylesheets.some(sheet => sheet.href?.includes(file));
    console.log(`   ${loaded ? '✅' : '❌'} ${file}: ${loaded ? 'loaded' : 'NOT FOUND'}`);
    
    if (loaded) {
        const sheet = stylesheets.find(s => s.href?.includes(file));
        try {
            const rules = Array.from(sheet.cssRules || []);
            const dpadRules = rules.filter(rule => 
                rule.selectorText?.includes('mobile-dpad') || 
                rule.selectorText?.includes('dpad-button')
            );
            console.log(`      - D-Pad related rules: ${dpadRules.length}`);
            if (dpadRules.length > 0) {
                dpadRules.forEach(rule => {
                    console.log(`        ${rule.selectorText}`);
                });
            }
        } catch (e) {
            console.log(`      - Cannot read rules (CORS): ${e.message}`);
        }
    }
});

// ============================================
// 6️⃣ COMPUTED STYLES ANALYZER
// ============================================

function analyzeStyles(element) {
    if (!element) return;
    
    console.log('\n📐 COMPUTED STYLES ANALYSIS:');
    
    const styles = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    const criticalProps = [
        'display', 'visibility', 'opacity', 'position', 'zIndex',
        'top', 'bottom', 'left', 'right', 'width', 'height',
        'transform', 'pointerEvents', 'background', 'border',
        'overflow', 'clip', 'clipPath'
    ];
    
    criticalProps.forEach(prop => {
        const value = styles[prop];
        const hasIssue = 
            (prop === 'display' && value === 'none') ||
            (prop === 'visibility' && value === 'hidden') ||
            (prop === 'opacity' && parseFloat(value) === 0) ||
            (prop === 'width' && parseFloat(value) === 0) ||
            (prop === 'height' && parseFloat(value) === 0);
        
        const emoji = hasIssue ? '❌' : '✅';
        console.log(`   ${emoji} ${prop}: ${value}`);
    });
    
    console.log('\n📦 BOUNDING CLIENT RECT:');
    console.log(`   x: ${rect.x}, y: ${rect.y}`);
    console.log(`   width: ${rect.width}, height: ${rect.height}`);
    console.log(`   top: ${rect.top}, bottom: ${rect.bottom}`);
    console.log(`   left: ${rect.left}, right: ${rect.right}`);
    
    const isInViewport = 
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth;
    
    console.log(`   ${isInViewport ? '✅' : '⚠️'} In viewport: ${isInViewport}`);
    
    const isVisible = 
        rect.width > 0 && rect.height > 0 &&
        styles.display !== 'none' &&
        styles.visibility !== 'hidden' &&
        parseFloat(styles.opacity) > 0;
    
    console.log(`   ${isVisible ? '✅' : '❌'} IS VISIBLE: ${isVisible}`);
    
    return { styles, rect, isVisible };
}

// ============================================
// 7️⃣ STACKING CONTEXT ANALYZER
// ============================================

function analyzeStackingContext(element) {
    if (!element) return;
    
    console.log('\n📊 STACKING CONTEXT ANALYSIS:');
    
    let current = element;
    let depth = 0;
    const chain = [];
    
    while (current && current !== document.body) {
        const styles = window.getComputedStyle(current);
        const zIndex = styles.zIndex;
        const transform = styles.transform;
        const position = styles.position;
        
        const createsContext = 
            zIndex !== 'auto' ||
            transform !== 'none' ||
            position === 'fixed' ||
            position === 'sticky';
        
        chain.push({
            tag: current.tagName,
            id: current.id || '(no id)',
            zIndex,
            transform: transform.substring(0, 50),
            position,
            createsContext
        });
        
        current = current.parentElement;
        depth++;
    }
    
    console.log(`   Depth: ${depth} levels to body`);
    chain.forEach((item, i) => {
        const emoji = item.createsContext ? '🔶' : '▫️';
        console.log(`   ${emoji} [${i}] <${item.tag}> #${item.id}`);
        console.log(`       z-index: ${item.zIndex}, position: ${item.position}`);
        if (item.transform !== 'none') {
            console.log(`       transform: ${item.transform}...`);
        }
    });
}

// ============================================
// 8️⃣ OCCLUSION DETECTION
// ============================================

function detectOcclusion(element) {
    if (!element) return;
    
    console.log('\n🔍 OCCLUSION DETECTION:');
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    console.log(`   Checking point: (${Math.round(centerX)}, ${Math.round(centerY)})`);
    
    const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
    console.log(`   Elements at center point: ${elementsAtPoint.length}`);
    
    const dpadIndex = elementsAtPoint.indexOf(element);
    console.log(`   D-Pad position in stack: ${dpadIndex} (0 = topmost)`);
    
    if (dpadIndex > 0) {
        console.log(`   ⚠️ D-Pad is OCCLUDED by ${dpadIndex} element(s):`);
        elementsAtPoint.slice(0, dpadIndex).forEach((el, i) => {
            const styles = window.getComputedStyle(el);
            console.log(`      ${i + 1}. <${el.tagName}> #${el.id || '(no id)'} .${el.className || '(no class)'}`);
            console.log(`         z-index: ${styles.zIndex}, position: ${styles.position}`);
        });
    } else if (dpadIndex === 0) {
        console.log('   ✅ D-Pad is TOPMOST (not occluded)');
    } else {
        console.log('   ❌ D-Pad NOT FOUND at its rect position!');
    }
}

// ============================================
// 9️⃣ VISUAL DEBUG OVERLAY
// ============================================

function createVisualOverlay(element) {
    if (!element) return;
    
    console.log('\n📍 CREATING VISUAL DEBUG OVERLAY...');
    
    // Remove old overlay
    const oldOverlay = document.getElementById('debug-overlay');
    if (oldOverlay) oldOverlay.remove();
    
    const rect = element.getBoundingClientRect();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'debug-overlay';
    overlay.style.cssText = `
        position: fixed !important;
        top: ${rect.top}px !important;
        left: ${rect.left}px !important;
        width: ${rect.width}px !important;
        height: ${rect.height}px !important;
        border: 5px dashed lime !important;
        background: rgba(0, 255, 0, 0.1) !important;
        pointer-events: none !important;
        z-index: 99999999 !important;
        animation: pulse 1s infinite !important;
    `;
    
    // Add label
    const label = document.createElement('div');
    label.textContent = 'D-PAD RECT';
    label.style.cssText = `
        position: absolute !important;
        top: -30px !important;
        left: 0 !important;
        background: lime !important;
        color: black !important;
        padding: 5px 10px !important;
        font-weight: bold !important;
        font-size: 12px !important;
        border-radius: 4px !important;
    `;
    overlay.appendChild(label);
    
    document.body.appendChild(overlay);
    
    console.log('✅ Visual overlay created (GREEN DASHED BOX)');
    console.log('   If you see green box but NO red D-Pad → rendering issue!');
    console.log('   If you see NEITHER → positioning issue!');
}

// ============================================
// 🔟 MAIN DEBUG ROUTINE
// ============================================

function runFullDiagnostics() {
    console.log('\n🔍 ========== RUNNING FULL DIAGNOSTICS ==========\n');
    
    const dpad = checkDPad();
    
    if (dpad) {
        const analysis = analyzeStyles(dpad);
        analyzeStackingContext(dpad);
        detectOcclusion(dpad);
        createVisualOverlay(dpad);
        
        // Check buttons
        console.log('\n🔘 BUTTON CHECK:');
        const buttons = dpad.querySelectorAll('.dpad-button, button');
        console.log(`   Found ${buttons.length} buttons`);
        buttons.forEach((btn, i) => {
            const btnStyles = window.getComputedStyle(btn);
            const btnRect = btn.getBoundingClientRect();
            console.log(`   Button ${i + 1}: ${btn.textContent || btn.dataset.key}`);
            console.log(`      display: ${btnStyles.display}, visibility: ${btnStyles.visibility}`);
            console.log(`      rect: ${Math.round(btnRect.width)}x${Math.round(btnRect.height)}`);
        });
        
        // Summary
        console.log('\n📊 DIAGNOSTIC SUMMARY:');
        console.log(`   Touch Device: ${isTouchDevice ? '✅ YES' : '❌ NO'}`);
        console.log(`   D-Pad in DOM: ${dpad ? '✅ YES' : '❌ NO'}`);
        console.log(`   D-Pad visible: ${analysis?.isVisible ? '✅ YES' : '❌ NO'}`);
        console.log(`   Buttons count: ${buttons.length}`);
        
        if (!analysis?.isVisible) {
            console.log('\n⚠️ ISSUE DETECTED: D-Pad exists but not visible!');
            console.log('   Possible causes:');
            console.log('   1. Stacking context issue (check transform chain)');
            console.log('   2. Occluded by other elements (check z-index)');
            console.log('   3. CSS rendering bug (check backdrop-filter)');
            console.log('   4. Position outside viewport (check rect)');
        }
    } else {
        console.log('\n❌ CRITICAL: D-Pad element not found!');
        console.log('   Check if mobile-dpad.js loaded correctly');
    }
    
    console.log('\n🔍 ========== DIAGNOSTICS COMPLETE ==========\n');
}

// ============================================
// AUTO-RUN WITH DELAYS
// ============================================

// Run immediately
setTimeout(() => {
    console.log('\n🔥 DIAGNOSTICS RUN #1 (after 500ms)\n');
    runFullDiagnostics();
}, 500);

// Run again after 2 seconds (after Camera init)
setTimeout(() => {
    console.log('\n🔄 DIAGNOSTICS RUN #2 (after 2s)\n');
    runFullDiagnostics();
}, 2000);

// Add CSS animation for pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(style);

console.log('✅ Debug script loaded');
console.log('   Will run diagnostics at 500ms and 2000ms');
console.log('   Watch for GREEN DASHED BOX on screen!');

// Export for manual testing
window.debugDPad = runFullDiagnostics;
console.log('\n🛠️ Manual debug available: window.debugDPad()');

export {}; // ES module
