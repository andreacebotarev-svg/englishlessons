/* ============================================
   CAMERA CONTROLLER
   Описание: Управление движением камеры в 3D пространстве
   Зависимости: config.js, utils.js
   ============================================ */

class Camera {
    constructor() {
        this.depth = CONFIG.camera.minDepth;
        this.targetDepth = this.depth;
        this.isMoving = false;
        this.animationFrame = null;
        
        // Привязка контекста
        this.update = this.update.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        this.init();
    }
    
    /**
     * Инициализация камеры
     */
    init() {
        this.updateCSS();
        this.bindEvents();
        this.startLoop();
        Utils.log('Camera initialized', 'success');
    }
    
    /**
     * Привязка событий управления
     */
    bindEvents() {
        // Колесико мыши
        window.addEventListener('wheel', this.handleWheel, { passive: false });
        
        // Клавиатура
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        // Touch для мобильных
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            const touchEndY = e.touches[0].clientY;
            const delta = touchStartY - touchEndY;
            this.move(delta * 2);
            touchStartY = touchEndY;
        }, { passive: true });
    }
    
    /**
     * Обработка колесика мыши
     */
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY;
        this.move(delta);
    }
    
    /**
     * Обработка нажатия клавиш
     */
    handleKeyDown(e) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            e.preventDefault();
            this.isMoving = true;
            this.moveForward();
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            e.preventDefault();
            this.isMoving = true;
            this.moveBackward();
        }
    }
    
    /**
     * Обработка отпускания клавиш
     */
    handleKeyUp(e) {
        if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
            this.isMoving = false;
        }
    }
    
    /**
     * Движение вперёд (к карточкам, непрерывное при зажатой клавише)
     */
    moveForward() {
        if (this.isMoving) {
            // ✅ ПРОСТО: положительный delta = движение вперёд
            this.move(CONFIG.camera.speed);
            requestAnimationFrame(() => this.moveForward());
        }
    }
    
    /**
     * Движение назад (от карточек, непрерывное при зажатой клавише)
     */
    moveBackward() {
        if (this.isMoving) {
            // ✅ ПРОСТО: отрицательный delta = движение назад
            this.move(-CONFIG.camera.speed);
            requestAnimationFrame(() => this.moveBackward());
        }
    }
    
    /**
     * Изменить целевую позицию камеры
     * @param {number} delta - Изменение позиции
     * 
     * НОВАЯ ЛОГИКА (ПОЛОЖИТЕЛЬНЫЕ КООРДИНАТЫ):
     * - Карточки имеют положительные координаты Z: 800, 1600, 2400...
     * - minDepth = 0 (начальная позиция)
     * - maxDepth = 50000 (конечная позиция)
     * 
     * НАПРАВЛЕНИЕ:
     * - Движение ВПЕРЁД (К карточкам): depth УВЕЛИЧИВАЕТСЯ (0 → 500 → 1000)
     * - Движение НАЗАД (ОТ карточек): depth УМЕНЬШАЕТСЯ (1000 → 500 → 0)
     * 
     * КОЛЕСИКО МЫШИ:
     * - Прокрутка ВНИЗ: deltaY > 0 (положительный) → движение ВПЕРЁД ✅
     * - Прокрутка ВВЕРХ: deltaY < 0 (отрицательный) → движение НАЗАД ✅
     * 
     * ФОРМУЛА:
     * - targetDepth += delta (всё интуитивно!)
     * - Положительный delta → depth увеличивается → движение ВПЕРЁД ✅
     * - Отрицательный delta → depth уменьшается → движение НАЗАД ✅
     * 
     * ПРИМЕРЫ:
     * 1. Прокрутка вниз: delta = +100
     *    targetDepth = 0 + 100 = 100 (движение вперёд ✅)
     * 
     * 2. Прокрутка вверх: delta = -100
     *    targetDepth = 100 + (-100) = 0 (движение назад ✅)
     * 
     * 3. Клавиша ↑ (вперёд): delta = +50
     *    targetDepth = 0 + 50 = 50 (движение вперёд ✅)
     * 
     * 4. Клавиша ↓ (назад): delta = -50
     *    targetDepth = 50 + (-50) = 0 (движение назад ✅)
     */
    move(delta) {
        // ✅ ПРОСТО И ПОНЯТНО: прибавляем delta
        this.targetDepth += delta;
        
        // Ограничения глубины: 0 <= targetDepth <= 50000
        this.targetDepth = Math.max(
            CONFIG.camera.minDepth,   // 0 (минимальное значение, начало)
            Math.min(CONFIG.camera.maxDepth, this.targetDepth)  // 50000 (максимальное значение, конец)
        );
    }
    
    /**
     * Плавное обновление позиции камеры
     */
    update() {
        // Линейная интерполяция (lerp) для плавности
        this.depth += (this.targetDepth - this.depth) * CONFIG.camera.smoothing;
        
        // Обновляем CSS переменную
        this.updateCSS();
        
        // Обновляем прогресс-бар
        this.updateProgress();
    }
    
    /**
     * Обновить CSS переменную --depth
     * ✅ ВАЖНО: Инвертируем знак для CSS translateZ()
     */
    updateCSS() {
        // CSS translateZ работает наоборот: отрицательные значения = объекты дальше
        // Поэтому инвертируем: depth=100 → CSS=-100px
        document.documentElement.style.setProperty('--depth', `${-this.depth}px`);
    }
    
    /**
     * Обновить прогресс-бар
     * 
     * ЛОГИКА РАСЧЁТА ПРОГРЕССА:
     * - В начале (depth = 0): progress = 0%
     * - В середине (depth = 25000): progress = 50%
     * - В конце (depth = 50000): progress = 100%
     * 
     * ФОРМУЛА (теперь без Math.abs):
     * progress = (depth - minDepth) / (maxDepth - minDepth) * 100
     * progress = (25000 - 0) / (50000 - 0) * 100 = 50%
     */
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            // ✅ ПРОСТО: без Math.abs
            const progress = (
                (this.depth - CONFIG.camera.minDepth) / 
                (CONFIG.camera.maxDepth - CONFIG.camera.minDepth)
            ) * 100;
            
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }
    
    /**
     * Запустить цикл обновления
     */
    startLoop() {
        const loop = () => {
            this.update();
            this.animationFrame = requestAnimationFrame(loop);
        };
        loop();
    }
    
    /**
     * Остановить цикл обновления
     */
    stopLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    /**
     * Получить текущую глубину
     */
    getDepth() {
        return this.depth;
    }
    
    /**
     * Телепортироваться на определённую позицию
     * @param {number} depth - Целевая глубина
     */
    jumpTo(depth) {
        this.depth = depth;
        this.targetDepth = depth;
        this.updateCSS();
    }
    
    /**
     * Уничтожить камеру (cleanup)
     */
    destroy() {
        this.stopLoop();
        window.removeEventListener('wheel', this.handleWheel);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        Utils.log('Camera destroyed', 'info');
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Camera;
}
