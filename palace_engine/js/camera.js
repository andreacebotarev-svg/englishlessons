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
            this.move(delta * 2); // Прокрутка вниз = вперёд
            touchStartY = touchEndY;
        }, { passive: true });
    }
    
    /**
     * Обработка колесика мыши
     */
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY;
        // Положительный deltaY (прокрутка вниз) = движение вперёд
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
     * Движение вперёд (непрерывное при зажатой клавише)
     */
    moveForward() {
        if (this.isMoving) {
            this.move(CONFIG.camera.speed); // + = движение вперёд
            requestAnimationFrame(() => this.moveForward());
        }
    }
    
    /**
     * Движение назад (непрерывное при зажатой клавише)
     */
    moveBackward() {
        if (this.isMoving) {
            this.move(-CONFIG.camera.speed); // - = движение назад
            requestAnimationFrame(() => this.moveBackward());
        }
    }
    
    /**
     * Изменить целевую позицию камеры
     * @param {number} delta - Изменение позиции (положительное = вперёд)
     */
    move(delta) {
        // Положительный delta уменьшает targetDepth (двигает в отрицательную сторону)
        // Например: -100 - 50 = -150 (движение к карточкам)
        this.targetDepth -= delta;
        
        // Ограничения глубины
        this.targetDepth = Math.max(
            CONFIG.camera.maxDepth,  // -50000 (минимум)
            Math.min(CONFIG.camera.minDepth, this.targetDepth)  // -100 (максимум)
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
     */
    updateCSS() {
        document.documentElement.style.setProperty('--depth', `${this.depth}px`);
    }
    
    /**
     * Обновить прогресс-бар
     */
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = Math.abs(
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
     * Телепортироваться на опредёлённую позицию
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
