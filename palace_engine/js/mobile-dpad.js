/**
 * ============================================
 * ADAPTIVE MOBILE D-PAD MODULE v4.1
 * ============================================
 * 
 * Умный адаптивный D-Pad с viewport-relative positioning
 * Автоматическая адаптация под размер экрана
 * 
 * FEATURES:
 * - Адаптивный размер (35% ширины экрана, 120-180px)
 * - Умные отступы (8% высоты / 5% ширины)
 * - Привязка к bottom-left viewport
 * - Auto-resize при повороте экрана
 * - Пропорциональные размеры кнопок
 * 
 * USAGE:
 * Import FIRST in index.html:
 * <script type="module" src="js/mobile-dpad.js"></script>
 */

class MobileDPad {
    constructor() {
        console.log('🎮 MobileDPad v4.1: Constructor called');
        
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.container = null;
        this.buttons = {};
        this.currentLayout = null;
        
        this.init();
    }
    
    init() {
        console.log('🎮 MobileDPad: Initializing...');
        
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        console.log(`📱 Touch device detected: ${isTouchDevice}`);
        console.log(`   - ontouchstart in window: ${'ontouchstart' in window}`);
        console.log(`   - navigator.maxTouchPoints: ${navigator.maxTouchPoints}`);
        console.log(`   - viewport: ${window.innerWidth}×${window.innerHeight}`);
        
        if (!isTouchDevice) {
            console.log('⏭️ Desktop detected, skipping D-Pad creation');
            return;
        }
        
        if (document.readyState === 'loading') {
            console.log('⏳ DOM loading... waiting for DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('✅ DOMContentLoaded fired!');
                this.create();
                this.setupResizeListeners();
            });
        } else {
            console.log('✅ DOM already ready, creating immediately');
            this.create();
            this.setupResizeListeners();
        }
    }
    
    // ============================================
    // 📐 ADAPTIVE POSITIONING SYSTEM
    // ============================================
    
    calculatePosition() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        console.log('📐 Calculating adaptive layout...');
        console.log(`   Viewport: ${viewportWidth}×${viewportHeight}`);
        
        // 📏 РАЗМЕР D-PAD (адаптивный: 35% ширины, 120-180px)
        const dpadSize = Math.min(
            Math.max(viewportWidth * 0.35, 120),
            180
        );
        
        // 📏 РАЗМЕР КНОПОК (33% от D-Pad)
        const buttonSize = Math.round(dpadSize * 0.33);
        
        // 📐 ОТСТУПЫ ОТ КРАЁВ
        const marginBottom = Math.max(
            Math.round(viewportHeight * 0.08),  // 8% от высоты
            80  // минимум 80px
        );
        
        const marginLeft = Math.max(
            Math.round(viewportWidth * 0.05),  // 5% от ширины
            20  // минимум 20px
        );
        
        const layout = {
            size: Math.round(dpadSize),
            buttonSize: buttonSize,
            position: {
                bottom: `${marginBottom}px`,
                left: `${marginLeft}px`,
                top: 'auto',
                right: 'auto'
            },
            margins: {
                bottom: marginBottom,
                left: marginLeft
            }
        };
        
        console.log('✅ Layout calculated:');
        console.log(`   D-Pad size: ${layout.size}×${layout.size}px`);
        console.log(`   Button size: ${layout.buttonSize}×${layout.buttonSize}px`);
        console.log(`   Bottom margin: ${marginBottom}px`);
        console.log(`   Left margin: ${marginLeft}px`);
        
        return layout;
    }
    
    calculateButtonLayout(containerSize, buttonSize) {
        // Расстояние между кнопками (10% от размера кнопки)
        const gap = Math.round(buttonSize * 0.1);
        
        // Центр контейнера
        const center = containerSize / 2;
        
        // Позиции кнопок (относительно центра)
        return [
            { 
                key: 'up', 
                icon: '▲', 
                top: gap, 
                left: Math.round(center - buttonSize / 2)
            },
            { 
                key: 'down', 
                icon: '▼', 
                top: containerSize - buttonSize - gap, 
                left: Math.round(center - buttonSize / 2)
            },
            { 
                key: 'left', 
                icon: '◄', 
                top: Math.round(center - buttonSize / 2), 
                left: gap
            },
            { 
                key: 'right', 
                icon: '►', 
                top: Math.round(center - buttonSize / 2), 
                left: containerSize - buttonSize - gap
            }
        ];
    }
    
    // ============================================
    // 🔨 D-PAD CREATION
    // ============================================
    
    create() {
        console.log('🔨 MobileDPad: Creating DOM elements...');
        console.log('🔍 document.body exists:', !!document.body);
        
        // Удаляем старый
        const old = document.getElementById('mobile-dpad');
        if (old) {
            console.log('♻️ Removing old D-Pad');
            old.remove();
        }
        
        // ✅ РАССЧИТЫВАЕМ АДАПТИВНУЮ ПОЗИЦИЮ
        this.currentLayout = this.calculatePosition();
        const layout = this.currentLayout;
        
        // Создаём контейнер
        this.container = document.createElement('div');
        this.container.id = 'mobile-dpad';
        this.container.setAttribute('data-version', '4.1');
        this.container.setAttribute('data-source', 'mobile-dpad.js');
        this.container.setAttribute('data-adaptive', 'true');
        
        // ✅ ПРИМЕНЯЕМ АДАПТИВНЫЕ СТИЛИ (БЕЗ translateZ!)
        this.container.style.cssText = `
            position: fixed !important;
            bottom: ${layout.position.bottom} !important;
            left: ${layout.position.left} !important;
            top: auto !important;
            right: auto !important;
            width: ${layout.size}px !important;
            height: ${layout.size}px !important;
            z-index: 10000000 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            background: rgba(255, 0, 0, 0.9) !important;
            border: 5px solid red !important;
            border-radius: ${Math.round(layout.size * 0.08)}px !important;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.8) !important;
            isolation: isolate !important;
            transition: width 0.3s, height 0.3s, bottom 0.3s, left 0.3s !important;
        `;
        
        console.log('📦 Container created:', this.container.id);
        
        // ✅ СОЗДАЁМ КНОПКИ С АДАПТИВНЫМИ РАЗМЕРАМИ
        const buttonConfigs = this.calculateButtonLayout(layout.size, layout.buttonSize);
        
        buttonConfigs.forEach(config => {
            const button = this.createButton(config, layout.buttonSize);
            this.container.appendChild(button);
            this.buttons[config.key] = button;
        });
        
        console.log('🔘 All buttons created:', Object.keys(this.buttons));
        
        // Добавляем в DOM
        if (!document.body) {
            console.error('❌ document.body is null! Cannot append D-Pad!');
            return;
        }
        
        document.body.appendChild(this.container);
        
        console.log('✅ MobileDPad: Appended to body!');
        console.log('🔍 Container parent:', this.container.parentElement?.tagName);
        console.log('🔍 Children count:', this.container.children.length);
        
        // Верификация
        setTimeout(() => this.verify(), 100);
        
        // Дополнительная проверка через 1s
        setTimeout(() => {
            console.log('🔄 Re-checking D-Pad after 1 second...');
            const stillExists = document.getElementById('mobile-dpad');
            if (!stillExists) {
                console.error('❌ D-Pad disappeared from DOM!');
            } else {
                console.log('✅ D-Pad still in DOM after 1 second');
                this.forceVisibility();
            }
        }, 1000);
    }
    
    createButton(config, buttonSize) {
        const button = document.createElement('button');
        button.className = 'dpad-button';
        button.dataset.key = config.key;
        button.textContent = config.icon;
        button.setAttribute('aria-label', `Move ${config.key}`);
        
        // ✅ АДАПТИВНЫЕ СТИЛИ КНОПКИ
        button.style.cssText = `
            position: absolute !important;
            top: ${config.top}px !important;
            left: ${config.left}px !important;
            width: ${buttonSize}px !important;
            height: ${buttonSize}px !important;
            background: rgba(255, 255, 255, 0.8) !important;
            border: 2px solid rgba(255, 255, 255, 1) !important;
            border-radius: ${Math.round(buttonSize * 0.16)}px !important;
            color: black !important;
            font-size: ${Math.round(buttonSize * 0.48)}px !important;
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
            transition: background 0.1s, transform 0.1s !important;
        `;
        
        // Touch события
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handlePress(config.key, true);
            button.style.background = 'rgba(255, 214, 10, 0.9) !important';
            button.style.transform = 'translateZ(0) scale(0.95) !important';
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handlePress(config.key, false);
            button.style.background = 'rgba(255, 255, 255, 0.8) !important';
            button.style.transform = 'translateZ(0) scale(1) !important';
        }, { passive: false });
        
        button.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handlePress(config.key, false);
            button.style.background = 'rgba(255, 255, 255, 0.8) !important';
            button.style.transform = 'translateZ(0) scale(1) !important';
        }, { passive: false });
        
        console.log(`✅ Button created: ${config.icon} (${config.key}) ${buttonSize}×${buttonSize}px`);
        return button;
    }
    
    // ============================================
    // 🔄 RESIZE & ORIENTATION HANDLING
    // ============================================
    
    setupResizeListeners() {
        console.log('👂 Setting up resize listeners...');
        
        let resizeTimeout;
        
        // Resize listener
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('📱 Screen resized, recalculating D-Pad...');
                console.log(`   New viewport: ${window.innerWidth}×${window.innerHeight}`);
                this.updatePosition();
            }, 100);
        });
        
        // Orientation change listener
        window.addEventListener('orientationchange', () => {
            console.log('🔄 Orientation changed!');
            setTimeout(() => {
                console.log(`   New viewport: ${window.innerWidth}×${window.innerHeight}`);
                this.updatePosition();
            }, 300);
        });
        
        console.log('✅ Resize listeners active');
    }
    
    updatePosition() {
        if (!this.container) {
            console.warn('⚠️ Cannot update: container not found');
            return;
        }
        
        console.log('🔄 Updating D-Pad position...');
        
        // Пересчитываем layout
        this.currentLayout = this.calculatePosition();
        const layout = this.currentLayout;
        
        // Обновляем контейнер
        this.container.style.bottom = layout.position.bottom;
        this.container.style.left = layout.position.left;
        this.container.style.width = `${layout.size}px`;
        this.container.style.height = `${layout.size}px`;
        this.container.style.borderRadius = `${Math.round(layout.size * 0.08)}px`;
        
        // Пересоздаём кнопки
        this.container.innerHTML = '';
        this.buttons = {};
        
        const buttonConfigs = this.calculateButtonLayout(layout.size, layout.buttonSize);
        buttonConfigs.forEach(config => {
            const button = this.createButton(config, layout.buttonSize);
            this.container.appendChild(button);
            this.buttons[config.key] = button;
        });
        
        console.log('✅ D-Pad updated successfully');
    }
    
    // ============================================
    // 🎮 EVENT HANDLING
    // ============================================
    
    handlePress(key, pressed) {
        this.keys[key] = pressed;
        console.log(`🎮 D-Pad ${key.toUpperCase()}: ${pressed ? 'PRESSED' : 'RELEASED'}`);
        
        // Диспатчим custom event для Camera
        const event = new CustomEvent('dpad-input', {
            detail: { key, pressed },
            bubbles: true,
            cancelable: false
        });
        
        window.dispatchEvent(event);
        console.log(`📡 Event dispatched: dpad-input (${key}=${pressed})`);
    }
    
    // ============================================
    // 🔧 UTILITY METHODS
    // ============================================
    
    forceVisibility() {
        if (!this.container) return;
        
        console.log('🔧 Forcing D-Pad visibility...');
        
        this.container.style.display = 'block';
        this.container.style.visibility = 'visible';
        this.container.style.opacity = '1';
        this.container.style.zIndex = '10000000';
        
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
            return;
        }
        
        console.log('✅ D-Pad element found in DOM');
        
        const styles = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        console.log('📐 COMPUTED STYLES:');
        console.log(`   display: ${styles.display}`);
        console.log(`   visibility: ${styles.visibility}`);
        console.log(`   opacity: ${styles.opacity}`);
        console.log(`   position: ${styles.position}`);
        console.log(`   z-index: ${styles.zIndex}`);
        console.log(`   bottom: ${styles.bottom}`);
        console.log(`   left: ${styles.left}`);
        console.log(`   width: ${styles.width}`);
        console.log(`   height: ${styles.height}`);
        console.log(`   transform: ${styles.transform}`);
        
        console.log('📦 BOUNDING CLIENT RECT:');
        console.log(`   x: ${rect.x}, y: ${rect.y}`);
        console.log(`   width: ${rect.width}, height: ${rect.height}`);
        console.log(`   bottom: ${rect.bottom}, left: ${rect.left}`);
        
        const isVisible = 
            rect.width > 0 && rect.height > 0 &&
            styles.display !== 'none' &&
            styles.visibility !== 'hidden' &&
            parseFloat(styles.opacity) > 0;
        
        console.log(`👁️ IS VISIBLE: ${isVisible ? '✅ YES' : '❌ NO'}`);
        
        console.log('🔍 ========================================');
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    getKeys() {
        return { ...this.keys };
    }
    
    isPressed(key) {
        return this.keys[key] || false;
    }
    
    getLayout() {
        return this.currentLayout;
    }
    
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

console.log('📦 mobile-dpad.js v4.1 loaded (VIEWPORT-FIXED)');
const dpad = new MobileDPad();
console.log('✅ MobileDPad instance created');

// ============================================
// EXPORT
// ============================================

export { dpad as MobileDPad };