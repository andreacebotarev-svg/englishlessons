/**
 * ============================================
 * STANDALONE MOBILE D-PAD MODULE
 * ============================================
 * 
 * Независимый модуль для мобильных контролов
 * Загружается ПЕРВЫМ, работает автономно
 * 
 * FEATURES:
 * - Автоматическое создание на touch-устройствах
 * - Event-driven интеграция (CustomEvent)
 * - Детальная диагностика
 * - Принудительные inline стили
 * 
 * USAGE:
 * 1. Import FIRST in index.html:
 *    <script type="module" src="js/mobile-dpad.js"></script>
 * 
 * 2. Listen to events in Camera:
 *    window.addEventListener('dpad-input', (e) => {
 *      const { key, pressed } = e.detail;
 *      // handle input
 *    });
 */

class MobileDPad {
    constructor() {
        console.log('🎮 MobileDPad: Constructor called');
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.container = null;
        this.buttons = {};
        
        // ✅ Создаём СРАЗУ при инстанцировании
        this.init();
    }
    
    init() {
        console.log('🎮 MobileDPad: Initializing...');
        
        // ✅ Проверка touch устройства
        const isTouchDevice = ('ontouchstart' in window) || 
                             (navigator.maxTouchPoints > 0);
        
        console.log(`📱 Touch device detected: ${isTouchDevice}`);
        console.log(`   - ontouchstart in window: ${'ontouchstart' in window}`);
        console.log(`   - navigator.maxTouchPoints: ${navigator.maxTouchPoints}`);
        
        if (!isTouchDevice) {
            console.log('⏭️ Desktop detected, skipping D-Pad creation');
            return;
        }
        
        // ✅ Ждём загрузку DOM
        if (document.readyState === 'loading') {
            console.log('⏳ DOM loading... waiting for DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('✅ DOMContentLoaded fired!');
                this.create();
            });
        } else {
            console.log('✅ DOM already ready, creating immediately');
            this.create();
        }
    }
    
    create() {
        console.log('🔨 MobileDPad: Creating DOM elements...');
        console.log('🔍 document.body exists:', !!document.body);
        
        // ✅ Удаляем старый (если есть)
        const old = document.getElementById('mobile-dpad');
        if (old) {
            console.log('♻️ Removing old D-Pad');
            old.remove();
        }
        
        // ✅ Создаём контейнер
        this.container = document.createElement('div');
        this.container.id = 'mobile-dpad';
        this.container.setAttribute('data-version', '3.0');
        this.container.setAttribute('data-source', 'mobile-dpad.js');
        
        // ✅ ПРИНУДИТЕЛЬНЫЕ INLINE СТИЛИ (FIXED VERSION)
        this.container.style.cssText = `
            position: fixed !important;
            bottom: 120px !important;
            left: 30px !important;
            width: 150px !important;
            height: 150px !important;
            z-index: 10000000 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            background: rgba(255, 0, 0, 0.9) !important;
            border: 5px solid red !important;
            border-radius: 12px !important;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.8) !important;
            transform: translateZ(10000px) !important;
            will-change: transform !important;
            isolation: isolate !important;
        `;
        
        console.log('📦 Container created:', this.container.id);
        
        // ✅ Создаём кнопки
        const buttonConfigs = [
            { key: 'up', icon: '▲', top: 0, left: 50 },
            { key: 'down', icon: '▼', top: 100, left: 50 },
            { key: 'left', icon: '◄', top: 50, left: 0 },
            { key: 'right', icon: '►', top: 50, left: 100 }
        ];
        
        buttonConfigs.forEach(config => {
            const button = this.createButton(config);
            this.container.appendChild(button);
            this.buttons[config.key] = button;
        });
        
        console.log('🔘 All buttons created:', Object.keys(this.buttons));
        
        // ✅ Добавляем в DOM
        if (!document.body) {
            console.error('❌ document.body is null! Cannot append D-Pad!');
            return;
        }
        
        document.body.appendChild(this.container);
        
        console.log('✅ MobileDPad: Appended to body!');
        console.log('🔍 Container parent:', this.container.parentElement?.tagName);
        console.log('🔍 Children count:', this.container.children.length);
        
        // ✅ Верификация через 100ms
        setTimeout(() => this.verify(), 100);
        
        // ✅ Дополнительная проверка через 1s
        setTimeout(() => {
            console.log('🔄 Re-checking D-Pad after 1 second...');
            const stillExists = document.getElementById('mobile-dpad');
            if (!stillExists) {
                console.error('❌ D-Pad disappeared from DOM!');
            } else {
                console.log('✅ D-Pad still in DOM after 1 second');
                this.forceVisibility(); // Принудительная видимость
            }
        }, 1000);
    }
    
    createButton({ key, icon, top, left }) {
        const button = document.createElement('button');
        button.className = 'dpad-button';
        button.dataset.key = key;
        button.textContent = icon;
        button.setAttribute('aria-label', `Move ${key}`);
        
        // ✅ ПРИНУДИТЕЛЬНЫЕ INLINE СТИЛИ (БЕЗ BACKDROP-FILTER!)
        button.style.cssText = `
            position: absolute !important;
            top: ${top}px !important;
            left: ${left}px !important;
            width: 50px !important;
            height: 50px !important;
            background: rgba(255, 255, 255, 0.8) !important;
            border: 2px solid rgba(255, 255, 255, 1) !important;
            border-radius: 8px !important;
            color: black !important;
            font-size: 24px !important;
            font-weight: bold !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: auto !important;
            touch-action: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            cursor: pointer !important;
            z-index: 10000001 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
            transform: translateZ(0) !important;
            will-change: transform, background !important;
        `;
        
        // ✅ Touch события
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handlePress(key, true);
            button.style.background = 'rgba(255, 214, 10, 0.9) !important';
            button.style.transform = 'translateZ(0) scale(0.95) !important';
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handlePress(key, false);
            button.style.background = 'rgba(255, 255, 255, 0.8) !important';
            button.style.transform = 'translateZ(0) scale(1) !important';
        }, { passive: false });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handlePress(key, false);
            button.style.background = 'rgba(255, 255, 255, 0.8) !important';
            button.style.transform = 'translateZ(0) scale(1) !important';
        }, { passive: false });
        
        console.log(`✅ Button created: ${icon} (${key})`);
        return button;
    }
    
    handlePress(key, pressed) {
        this.keys[key] = pressed;
        console.log(`🎮 D-Pad ${key.toUpperCase()}: ${pressed ? 'PRESSED' : 'RELEASED'}`);
        
        // ✅ Диспатчим custom event для Camera
        const event = new CustomEvent('dpad-input', {
            detail: { key, pressed },
            bubbles: true,
            cancelable: false
        });
        
        window.dispatchEvent(event);
        console.log(`📡 Event dispatched: dpad-input (${key}=${pressed})`);
    }
    
    forceVisibility() {
        if (!this.container) return;
        
        console.log('🔧 Forcing D-Pad visibility...');
        
        // Принудительное применение стилей
        this.container.style.display = 'block';
        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
        this.container.style.zIndex = '10000000';
        this.container.style.transform = 'translateZ(10000px)';
        
        // Применить к кнопкам
        Object.values(this.buttons).forEach(btn => {
            btn.style.display = 'flex';
            btn.style.visibility = 'visible';
            btn.style.opacity = '1';
        });
        
        console.log('✅ Force visibility applied');
    }
    
    verify() {
        console.log('🔍 ========== D-PAD VERIFICATION ==========');
        
        const element = document.getElementById('mobile-dpad');
        
        if (!element) {
            console.error('❌ VERIFICATION FAILED: D-Pad not found in DOM!');
            console.log('🔍 Checking all elements with id:');
            const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
            console.log('   Available IDs:', allIds);
            return;
        }
        
        console.log('✅ D-Pad element found in DOM');
        
        const styles = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        console.log('📐 COMPUTED STYLES:');
        console.log('   - display:', styles.display);
        console.log('   - visibility:', styles.visibility);
        console.log('   - opacity:', styles.opacity);
        console.log('   - position:', styles.position);
        console.log('   - z-index:', styles.zIndex);
        console.log('   - bottom:', styles.bottom);
        console.log('   - left:', styles.left);
        console.log('   - width:', styles.width);
        console.log('   - height:', styles.height);
        console.log('   - background:', styles.background);
        console.log('   - border:', styles.border);
        console.log('   - transform:', styles.transform);
        
        console.log('📦 BOUNDING CLIENT RECT:');
        console.log('   - x:', rect.x);
        console.log('   - y:', rect.y);
        console.log('   - width:', rect.width);
        console.log('   - height:', rect.height);
        console.log('   - top:', rect.top);
        console.log('   - bottom:', rect.bottom);
        console.log('   - left:', rect.left);
        console.log('   - right:', rect.right);
        
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         styles.display !== 'none' && 
                         styles.visibility !== 'hidden' &&
                         parseFloat(styles.opacity) > 0;
        
        console.log('👁️ IS VISIBLE:', isVisible ? '✅ YES' : '❌ NO');
        
        if (!isVisible) {
            console.error('❌ D-Pad is NOT VISIBLE!');
            console.log('🔧 Troubleshooting:');
            if (rect.width === 0 || rect.height === 0) console.log('   - Element has zero dimensions');
            if (styles.display === 'none') console.log('   - display is "none"');
            if (styles.visibility === 'hidden') console.log('   - visibility is "hidden"');
            if (parseFloat(styles.opacity) === 0) console.log('   - opacity is 0');
        } else {
            console.log('✅ VERIFICATION SUCCESS! D-Pad is visible!');
        }
        
        console.log('🔍 ========================================');
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    /**
     * Получить текущее состояние всех клавиш
     * @returns {Object} { up, down, left, right }
     */
    getKeys() {
        return { ...this.keys };
    }
    
    /**
     * Проверить, нажата ли конкретная клавиша
     * @param {string} key - 'up', 'down', 'left', 'right'
     * @returns {boolean}
     */
    isPressed(key) {
        return this.keys[key] || false;
    }
    
    /**
     * Уничтожить D-Pad (для cleanup)
     */
    destroy() {
        if (this.container && this.container.parentElement) {
            this.container.remove();
            console.log('🗑️ D-Pad destroyed');
        }
    }
}

// ============================================
// AUTO-INIT
// ============================================

console.log('📦 mobile-dpad.js loaded');
const dpad = new MobileDPad();
console.log('✅ MobileDPad instance created');

// ============================================
// EXPORT
// ============================================

export { dpad as MobileDPad };