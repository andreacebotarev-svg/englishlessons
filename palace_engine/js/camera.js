/* ============================================
   CAMERA CONTROLLER
   Описание: Управление камерой + определение активной карточки
   ============================================ */

const Camera = {
    z: 0,           // Текущая позиция
    speed: 50,      // Скорость движения
    maxZ: 0,        // Граница коридора
    words: [],      // Массив слов
    roomSpacing: 800, // Расстояние между карточками
    startOffset: 2000, // Начальное смещение карточек
    activeThreshold: 400, // Порог активации карточки (в px)
    
    init() {
        // Слушаем колесико мыши
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
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
        
        console.log('📹 Camera event listeners attached');
    },
    
    move(direction) {
        const oldZ = this.z;
        
        // Увеличиваем или уменьшаем Z
        this.z += direction * this.speed;
        
        // Ограничиваем движение
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;
        
        // Применяем к CSS
        document.documentElement.style.setProperty('--depth', `${this.z}px`);
        
        // Отладочный лог (каждое 10-е движение)
        if (Math.floor(oldZ / 100) !== Math.floor(this.z / 100)) {
            console.log(`📹 Camera: ${oldZ}px → ${this.z}px (max: ${this.maxZ}px)`);
        }
        
        // ⚠️ КРИТИЧНО: Обновляем активные карточки
        this.updateActiveRooms();
        
        // Обновляем UI
        this.updateProgress();
        this.updateWordCounter();
    },
    
    /**
     * Определяет ближайшую карточку и добавляет .room--active
     */
    updateActiveRooms() {
        const rooms = document.querySelectorAll('.room');
        
        rooms.forEach(room => {
            // Получаем Z-позицию карточки из data-position
            const roomZ = parseFloat(room.dataset.position || 0);
            
            // Расстояние от камеры до карточки
            const distance = Math.abs(this.z - roomZ);
            
            // Если камера близко к карточке — активируем
            if (distance < this.activeThreshold) {
                if (!room.classList.contains('room--active')) {
                    room.classList.add('room--active');
                    console.log(`✨ Activated room: "${room.dataset.word}" (distance: ${Math.round(distance)}px)`);
                }
            } else {
                room.classList.remove('room--active');
            }
        });
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
            const currentWordIndex = Math.floor((this.z - this.startOffset) / this.roomSpacing);
            const clampedIndex = Math.min(Math.max(0, currentWordIndex), this.words.length - 1);
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
    
    // Устанавливаем параметры
    Camera.roomSpacing = config.corridor.roomSpacing;
    Camera.startOffset = 2000; // должно совпадать с builder.js
    Camera.maxZ = Camera.startOffset + (words.length * Camera.roomSpacing);
    Camera.speed = config.camera.speed || 50;
    Camera.words = words;
    Camera.activeThreshold = 400; // радиус активации
    
    // Инициализируем обработчики событий
    Camera.init();
    
    // Устанавливаем начальное значение --depth
    document.documentElement.style.setProperty('--depth', '0px');
    
    console.log(`📹 Camera configured:`);
    console.log(`   - Words: ${words.length}`);
    console.log(`   - maxZ: ${Camera.maxZ}px`);
    console.log(`   - speed: ${Camera.speed}px/tick`);
    console.log(`   - roomSpacing: ${Camera.roomSpacing}px`);
    console.log(`   - startOffset: ${Camera.startOffset}px`);
    console.log(`   - activeThreshold: ${Camera.activeThreshold}px`);
    console.log(`🚿 Try scrolling or pressing ↑/↓ arrows`);
}

// ES6 экспорты
export { initCamera, Camera };