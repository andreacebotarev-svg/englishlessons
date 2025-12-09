/* ============================================
   CAMERA CONTROLLER
   Описание: Управление камерой + определение активной карточки
   Поддержка: Desktop (mouse/keyboard) + Mobile (touch/swipe)
   Оптимизации: DOM caching, requestAnimationFrame, visibility culling
   ============================================ */

const Camera = {
    z: 0,           // Текущая позиция
    speed: 50,      // Скорость движения
    maxZ: 0,        // Граница коридора
    words: [],      // Массив слов
    roomSpacing: 800, // Расстояние между карточками
    startOffset: 2000, // Начальное смещение карточек
    activeThreshold: 400, // Порог активации карточки (в px)
    
    // 🚀 ОПТИМИЗАЦИЯ: Кэширование DOM-элементов
    roomsCache: null,  // Кэш DOM-элементов .room для избежания повторных querySelectorAll
    isTicking: false, // Флаг для requestAnimationFrame
    
    init() {
        // === DESKTOP CONTROLS ===
        
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
        
        // === MOBILE TOUCH CONTROLS ===
        
        let touchStartY = 0;
        let touchEndY = 0;
        let isSwiping = false;
        
        window.addEventListener('touchstart', (e) => {
            // Если тапнули на карточку или кнопку — не двигать камеру
            if (e.target.closest('.room') || e.target.closest('.room-speaker')) {
                return;
            }
            
            touchStartY = e.touches[0].clientY;
            isSwiping = true;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            // Блокируем скролл страницы только во время свайпа
            if (e.cancelable) {
                e.preventDefault();
            }
            
            touchEndY = e.touches[0].clientY;
            const delta = touchStartY - touchEndY;
            
            // Порог чувствительности 5px
            if (Math.abs(delta) > 5) {
                const direction = delta > 0 ? 1 : -1;
                this.move(direction * 0.3); // Меньше скорость для плавности на тач
                touchStartY = touchEndY; // Обновляем позицию для continuous swipe
            }
        }, { passive: false });
        
        window.addEventListener('touchend', () => {
            isSwiping = false;
        }, { passive: true });
        
        // 🚀 Кэшируем комнаты один раз после инициализации
        // Задержка 100ms даёт builder.js время создать все DOM-элементы
        setTimeout(() => {
            this.cacheRooms();
        }, 100);
        
        console.log('📹 Camera initialized (Desktop + Mobile)');
    },
    
    /**
     * 🚀 ОПТИМИЗАЦИЯ: Кэширует список комнат в памяти
     * Вызывается автоматически при инициализации
     * Можно вызвать вручную после динамического добавления комнат
     */
    cacheRooms() {
        this.roomsCache = Array.from(document.querySelectorAll('.room'));
        console.log(`💾 Cached ${this.roomsCache.length} rooms for performance`);
    },
    
    move(direction) {
        const oldZ = this.z;
        
        // Увеличиваем или уменьшаем Z
        this.z += direction * this.speed;
        
        // Ограничиваем движение
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;
        
        // 🚀 ОПТИМИЗАЦИЯ: Обновляем DOM только перед отрисовкой кадра
        // Связываем обновления с частотой обновления экрана (60/120 FPS)
        if (!this.isTicking) {
            window.requestAnimationFrame(() => {
                // Применяем к CSS
                document.documentElement.style.setProperty('--depth', `${this.z}px`);
                
                // ☑️ КРИТИЧНО: Обновляем активные карточки
                this.updateActiveRooms();
                
                // Обновляем UI
                this.updateProgress();
                this.updateWordCounter();
                
                this.isTicking = false;
            });
            this.isTicking = true;
        }
        
        // Отладочный лог (каждое 10-е движение)
        if (Math.floor(oldZ / 100) !== Math.floor(this.z / 100)) {
            console.log(`📹 Camera: ${oldZ}px → ${this.z}px (max: ${this.maxZ}px)`);
        }
    },
    
    /**
     * 🚀 ОПТИМИЗАЦИЯ: Определяет ближайшую карточку и управляет видимостью
     * Использует кэш вместо querySelectorAll для повышения производительности
     * Скрывает далекие карточки (>4000px) для экономии GPU
     */
    updateActiveRooms() {
        // 🚀 Используем кэш вместо querySelectorAll
        // Fallback на случай, если кэш ещё не готов (первый вызов)
        if (!this.roomsCache) {
            this.roomsCache = Array.from(document.querySelectorAll('.room'));
            console.warn('⚠️ Cache not ready, fallback to querySelectorAll');
        }
        
        this.roomsCache.forEach(room => {
            // Получаем Z-позицию карточки из data-position
            const roomZ = parseFloat(room.dataset.position || 0);
            
            // Расстояние от камеры до карточки
            const distance = Math.abs(this.z - roomZ);
            
            // 🚀 ОПТИМИЗАЦИЯ: Виртуализация - скрываем далекие карточки
            // Пороговое значение 4000px подобрано эмпирически
            if (distance > 4000) {
                if (room.style.visibility !== 'hidden') {
                    room.style.visibility = 'hidden';
                }
                return; // Пропускаем дальнейшие проверки для скрытых карточек
            } else {
                if (room.style.visibility === 'hidden') {
                    room.style.visibility = 'visible';
                }
            }
            
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
    console.log(`🐿 Desktop: Scroll or ↑/↓ | Mobile: Swipe up/down`);
}

// ES6 экспорты
export { initCamera, Camera };