/* ============================================
   CAMERA CONTROLLER
   Описание: Управление камерой с принципом направления
   ============================================ */

const Camera = {
    z: 0,           // Текущая позиция
    speed: 50,      // Скорость движения
    maxZ: 0,        // Граница коридора (установится через initCamera)
    words: [],      // Массив слов для отслеживания
    
    init() {
        // Слушаем колесико мыши
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            // e.deltaY > 0 это скролл вниз (идем вперед)
            const direction = e.deltaY > 0 ? 1 : -1;
            this.move(direction);
        }, { passive: false });
        
        // Слушаем клавиатуру (стрелки)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.move(1); // Вперед
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.move(-1); // Назад
            }
        });
        
        console.log('📹 Camera initialized');
    },
    
    move(direction) {
        // Увеличиваем или уменьшаем Z
        this.z += direction * this.speed;
        
        // Ограничиваем движение
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;
        
        // Применяем к CSS
        document.documentElement.style.setProperty('--depth', `${this.z}px`);
        
        // Обновляем прогресс-бар и счётчик
        this.updateProgress();
        this.updateWordCounter();
    },
    
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar && this.maxZ > 0) {
            const progress = (this.z / this.maxZ) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    },
    
    updateWordCounter() {
        const counter = document.getElementById('word-counter');
        if (counter && this.words.length > 0) {
            // Вычисляем текущее слово по позиции
            const currentWordIndex = Math.floor(this.z / (this.maxZ / this.words.length));
            const clampedIndex = Math.min(currentWordIndex, this.words.length - 1);
            counter.textContent = `${clampedIndex + 1} / ${this.words.length}`;
        }
    }
};

/**
 * Инициализирует камеру с параметрами урока
 * @param {Array} words - Массив слов из урока
 * @param {Object} config - Конфигурация (CONFIG)
 */
function initCamera(words, config) {
    if (!words || words.length === 0) {
        console.warn('⚠️ No words provided to camera');
        return;
    }
    
    // Устанавливаем границы коридора
    Camera.maxZ = words.length * config.corridor.roomSpacing;
    Camera.speed = config.camera.speed || 50;
    Camera.words = words;
    
    // Инициализируем обработчики событий
    Camera.init();
    
    console.log(`📹 Camera configured: ${words.length} words, maxZ = ${Camera.maxZ}px`);
}

// ES6 экспорты
export { initCamera, Camera };