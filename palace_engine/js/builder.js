/* ============================================
   WORLD BUILDER
   Описание: Создание 3D объектов (пол, стены, карточки)
   Зависимости: config.js, utils.js
   ============================================ */

class WorldBuilder {
    constructor() {
        this.world = document.getElementById('world');
        this.cards = [];
        this.learnedWords = new Set(); // Множество изученных слов
    }
    
    /**
     * Построить весь мир
     * @param {Object} lessonData - Данные урока из JSON
     */
    build(lessonData) {
        Utils.log('Building world...', 'info');
        
        // Очистка существующего контента
        this.clear();
        
        // Создаём базовые объекты
        this.createFloor();
        this.createWalls();
        this.createLights();
        
        // Создаём карточки слов
        if (lessonData.content.vocabulary.words) {
            this.createCards(lessonData.content.vocabulary.words);
        }
        
        // Обновляем счётчик слов
        this.updateWordCounter(lessonData.content.vocabulary.words.length);
        
        Utils.log(`World built: ${this.cards.length} cards created`, 'success');
    }
    
    /**
     * Очистить мир
     */
    clear() {
        if (this.world) {
            this.world.innerHTML = '';
            this.cards = [];
        }
    }
    
    /**
     * Создать пол
     */
    createFloor() {
        const floor = document.createElement('div');
        floor.className = 'floor';
        this.world.appendChild(floor);
    }
    
    /**
     * Создать стены
     */
    createWalls() {
        const wallLeft = document.createElement('div');
        wallLeft.className = 'wall-left';
        this.world.appendChild(wallLeft);
        
        const wallRight = document.createElement('div');
        wallRight.className = 'wall-right';
        this.world.appendChild(wallRight);
    }
    
    /**
     * Создать источники света вдоль коридора
     * 
     * НОВАЯ СИСТЕМА КООРДИНАТ (положительные Z):
     * - Источники света размещаются вдоль коридора
     * - Z координаты положительные: 0, 1600, 3200, 4800...
     * - Каждая вторая карточка (spacing * 2)
     */
    createLights() {
        const lightCount = 30; // Количество пар ламп
        const spacing = CONFIG.cards.spacing * 2; // 1600px (каждая вторая карточка)
        
        for (let i = 0; i < lightCount; i++) {
            // Левая лампа
            const lightLeft = document.createElement('div');
            lightLeft.className = 'light-source light-left';
            lightLeft.style.transform = `
                translateX(-500px)
                translateY(-200px)
                translateZ(${spacing * i}px)
            `;
            // ✅ Положительные Z: 0, 1600, 3200, 4800...
            this.world.appendChild(lightLeft);
            
            // Правая лампа
            const lightRight = document.createElement('div');
            lightRight.className = 'light-source light-right';
            lightRight.style.transform = `
                translateX(500px)
                translateY(-200px)
                translateZ(${spacing * i}px)
            `;
            // ✅ Положительные Z: 0, 1600, 3200, 4800...
            this.world.appendChild(lightRight);
        }
    }
    
    /**
     * Создать карточки слов
     * @param {Array} words - Массив слов из JSON
     */
    createCards(words) {
        words.forEach((word, index) => {
            const card = this.createCard(word, index);
            this.world.appendChild(card);
            this.cards.push(card);
        });
    }
    
    /**
     * Создать одну карточку
     * @param {Object} wordData - Данные слова
     * @param {number} index - Индекс карточки
     * @returns {HTMLElement}
     * 
     * СТРУКТУРА КАРТОЧКИ:
     * <div class="card" data-index="0" data-word="hello">
     *   <h2>hello</h2>
     *   <p>привет</p>
     *   <span class="transcription">[həˈləʊ]</span>
     *   <p class="example">Hello, how are you?</p>
     * </div>
     */
    createCard(wordData, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.word = wordData.en;
        
        // Определяем позицию карточки
        const position = this.calculateCardPosition(index);
        
        // Применяем позиционирование через left/top (для absolute)
        // calc(50% + offsetX) центрирует карточку и сдвигает её влево/вправо
        card.style.left = `calc(50% + ${position.x}px)`;
        card.style.top = `calc(50% + ${position.y}px)`;
        
        // Применяем 3D трансформацию
        // translateZ - глубина в пространстве
        // rotateY - поворот карточки к центру коридора
        card.style.transform = `
            translateZ(${position.z}px)
            ${position.side === 'left' ? 'rotateY(25deg)' : 'rotateY(-25deg)'}
        `;
        
        // Содержимое карточки
        card.innerHTML = `
            <h2>${wordData.en}</h2>
            <p>${wordData.ru}</p>
            ${wordData.transcription ? `<span class="transcription">${wordData.transcription}</span>` : ''}
            ${wordData.example ? `<p class="example">${wordData.example}</p>` : ''}
        `;
        
        // События
        card.addEventListener('click', () => this.onCardClick(card, wordData));
        card.addEventListener('mouseenter', () => this.onCardHover(card, wordData));
        
        // Accessibility (для клавиатурной навигации и скринридеров)
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Word: ${wordData.en}, translation: ${wordData.ru}`);
        
        // Обработка Enter/Space для accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.onCardClick(card, wordData);
            }
        });
        
        return card;
    }
    
    /**
     * Рассчитать позицию карточки в 3D пространстве
     * @param {number} index - Индекс карточки (0, 1, 2, 3...)
     * @returns {Object} - Координаты {x, y, z, side}
     * 
     * НОВАЯ СИСТЕМА КООРДИНАТ (положительные Z):
     * - Карточки размещаются вдоль оси Z с положительными значениями
     * - Первая карточка (index=0): z = 800
     * - Вторая карточка (index=1): z = 1600
     * - Третья карточка (index=2): z = 2400
     * - И так далее...
     * 
     * ПРИМЕРЫ:
     * index=0: z = 800 * (0 + 1) = 800
     * index=1: z = 800 * (1 + 1) = 1600
     * index=2: z = 800 * (2 + 1) = 2400
     * index=24: z = 800 * (24 + 1) = 20000
     * 
     * ЧЕРЕДОВАНИЕ СТЕН:
     * - Чётные индексы (0, 2, 4...) → левая стена (x = -250)
     * - Нечётные индексы (1, 3, 5...) → правая стена (x = 250)
     */
    calculateCardPosition(index) {
        const spacing = CONFIG.cards.spacing; // 800px
        const alternateWalls = CONFIG.cards.alternateWalls; // true
        
        // ✅ ИЗМЕНЕНО: Положительная глубина (Z)
        // Карточки идут "в даль" с положительными значениями
        const z = spacing * (index + 1);
        
        // Чередование стен (левая/правая)
        const side = alternateWalls 
            ? (index % 2 === 0 ? 'left' : 'right')
            : 'left';
        
        // Смещение по X (горизонтальное положение)
        // Отрицательное = левая стена, положительное = правая стена
        const x = side === 'left' 
            ? CONFIG.cards.offsetLeft   // -250
            : CONFIG.cards.offsetRight; // 250
        
        // Смещение по Y (вертикальное положение)
        const y = CONFIG.cards.offsetY; // 0 (по центру)
        
        return { x, y, z, side };
    }
    
    /**
     * Обработка клика по карточке
     * @param {HTMLElement} card - DOM элемент карточки
     * @param {Object} wordData - Данные слова
     * 
     * ФУНКЦИОНАЛ:
     * - Переключает статус "изучено/не изучено"
     * - Добавляет/убирает CSS класс .learned
     * - Обновляет счётчик изученных слов
     * - Сохраняет прогресс в localStorage
     */
    onCardClick(card, wordData) {
        Utils.log(`Card clicked: ${wordData.en}`, 'info');
        
        const word = wordData.en;
        
        // Переключаем статус "изучено"
        if (this.learnedWords.has(word)) {
            // Если слово уже изучено - снимаем отметку
            this.learnedWords.delete(word);
            card.classList.remove('learned');
            Utils.log(`Word unmarked: ${word}`, 'info');
        } else {
            // Если слово не изучено - отмечаем как изученное
            this.learnedWords.add(word);
            card.classList.add('learned');
            Utils.log(`Word learned: ${word}`, 'success');
        }
        
        // Обновляем счётчик
        this.updateWordCounter(this.cards.length);
        
        // Сохраняем прогресс
        const lessonId = new URLSearchParams(window.location.search).get(CONFIG.data.lessonParam);
        if (lessonId) {
            this.saveProgress(lessonId);
        }
        
        // Озвучка слова (будущая функция)
        // this.speakWord(wordData.en);
    }
    
    /**
     * Обработка наведения на карточку
     * @param {HTMLElement} card - DOM элемент карточки
     * @param {Object} wordData - Данные слова
     * 
     * ФУНКЦИОНАЛ:
     * - Можно добавить предзагрузку аудио
     * - Можно показать дополнительную информацию
     * - Можно добавить анимации
     */
    onCardHover(card, wordData) {
        // Предзагрузка аудио (будущая функция)
        // this.preloadAudio(wordData.en);
        
        // Дополнительные эффекты при наведении
        // (базовые эффекты уже есть в CSS)
    }
    
    /**
     * Обновить счётчик слов
     * @param {number} total - Всего слов в уроке
     * 
     * ФОРМАТ: "5 / 25" (изучено / всего)
     */
    updateWordCounter(total) {
        const counter = document.getElementById('word-counter');
        if (counter) {
            const learned = this.learnedWords.size;
            counter.innerHTML = `<span>${learned}</span> / ${total}`;
            
            // Если все слова изучены - показываем сообщение
            if (learned === total && total > 0) {
                Utils.log('All words learned! 🎉', 'success');
                // Можно добавить анимацию или модальное окно
            }
        }
    }
    
    /**
     * Получить все карточки
     * @returns {Array} - Массив DOM элементов карточек
     */
    getCards() {
        return this.cards;
    }
    
    /**
     * Получить изученные слова
     * @returns {Set} - Множество изученных слов
     */
    getLearnedWords() {
        return this.learnedWords;
    }
    
    /**
     * Сохранить прогресс в localStorage
     * @param {string} lessonId - ID урока
     * 
     * СТРУКТУРА ДАННЫХ:
     * {
     *   lessonId: "263",
     *   learned: ["hello", "world", "thank"],
     *   timestamp: 1701993600000
     * }
     */
    saveProgress(lessonId) {
        const progress = {
            lessonId,
            learned: Array.from(this.learnedWords),
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(`lesson_${lessonId}`, JSON.stringify(progress));
            Utils.log('Progress saved', 'success');
        } catch (e) {
            Utils.log('Failed to save progress: ' + e.message, 'error');
        }
    }
    
    /**
     * Загрузить прогресс из localStorage
     * @param {string} lessonId - ID урока
     * 
     * ВОССТАНАВЛИВАЕТ:
     * - Множество изученных слов
     * - CSS класс .learned на соответствующих карточках
     * - Счётчик прогресса
     */
    loadProgress(lessonId) {
        try {
            const saved = localStorage.getItem(`lesson_${lessonId}`);
            
            if (saved) {
                const progress = JSON.parse(saved);
                this.learnedWords = new Set(progress.learned);
                
                // Применяем класс .learned к соответствующим карточкам
                this.cards.forEach(card => {
                    if (this.learnedWords.has(card.dataset.word)) {
                        card.classList.add('learned');
                    }
                });
                
                // Обновляем счётчик
                this.updateWordCounter(this.cards.length);
                
                Utils.log(`Progress loaded: ${this.learnedWords.size} words learned`, 'success');
            }
        } catch (e) {
            Utils.log('Failed to load progress: ' + e.message, 'error');
        }
    }
    
    /**
     * Очистить прогресс урока
     * @param {string} lessonId - ID урока
     */
    clearProgress(lessonId) {
        try {
            localStorage.removeItem(`lesson_${lessonId}`);
            this.learnedWords.clear();
            
            // Убираем класс .learned со всех карточек
            this.cards.forEach(card => {
                card.classList.remove('learned');
            });
            
            // Обновляем счётчик
            this.updateWordCounter(this.cards.length);
            
            Utils.log('Progress cleared', 'info');
        } catch (e) {
            Utils.log('Failed to clear progress: ' + e.message, 'error');
        }
    }
    
    /**
     * Получить статистику урока
     * @returns {Object} - Статистика
     */
    getStats() {
        const total = this.cards.length;
        const learned = this.learnedWords.size;
        const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
        
        return {
            total,
            learned,
            remaining: total - learned,
            percentage
        };
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldBuilder;
}
