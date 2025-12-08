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
     */
    createCard(wordData, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.word = wordData.en;
        
        // Определяем позицию карточки
        const position = this.calculateCardPosition(index);
        
        // Применяем позиционирование через left/top (для absolute)
        card.style.left = `calc(50% + ${position.x}px)`;
        card.style.top = `calc(50% + ${position.y}px)`;
        
        // Применяем 3D трансформацию (БЕЗ translate -50%, -50%!)
        card.style.transform = `
            translateZ(${position.z}px)
            ${position.side === 'left' ? 'rotateY(25deg)' : 'rotateY(-25deg)'}
        `;
        
        // Содержимое карточки
        card.innerHTML = `
            <h2>${wordData.en}</h2>
            <p>${wordData.ru}</p>
            <span class="transcription">${wordData.transcription || ''}</span>
            <p class="example">${wordData.example || ''}</p>
        `;
        
        // События
        card.addEventListener('click', () => this.onCardClick(card, wordData));
        card.addEventListener('mouseenter', () => this.onCardHover(card, wordData));
        
        // Accessibility
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Word: ${wordData.en}, translation: ${wordData.ru}`);
        
        return card;
    }
    
    /**
     * Рассчитать позицию карточки в 3D пространстве
     * @param {number} index - Индекс карточки
     * @returns {Object} - Координаты {x, y, z, side}
     */
    calculateCardPosition(index) {
        const spacing = CONFIG.cards.spacing;
        const alternateWalls = CONFIG.cards.alternateWalls;
        
        // Глубина (Z) - карточки идут "в даль"
        const z = -spacing * (index + 1);
        
        // Чередование стен
        const side = alternateWalls 
            ? (index % 2 === 0 ? 'left' : 'right')
            : 'left';
        
        // Смещение по X (влево или вправо)
        const x = side === 'left' 
            ? CONFIG.cards.offsetLeft 
            : CONFIG.cards.offsetRight;
        
        // Смещение по Y (высота)
        const y = CONFIG.cards.offsetY;
        
        return { x, y, z, side };
    }
    
    /**
     * Обработка клика по карточке
     * @param {HTMLElement} card - DOM элемент карточки
     * @param {Object} wordData - Данные слова
     */
    onCardClick(card, wordData) {
        Utils.log(`Card clicked: ${wordData.en}`, 'info');
        
        // Переключаем статус "изучено"
        const word = wordData.en;
        if (this.learnedWords.has(word)) {
            this.learnedWords.delete(word);
            card.classList.remove('learned');
        } else {
            this.learnedWords.add(word);
            card.classList.add('learned');
        }
        
        // Обновляем счётчик
        this.updateWordCounter(this.cards.length);
        
        // Озвучка слова (будущая функция)
        // this.speakWord(wordData.en);
    }
    
    /**
     * Обработка наведения на карточку
     * @param {HTMLElement} card - DOM элемент карточки
     * @param {Object} wordData - Данные слова
     */
    onCardHover(card, wordData) {
        // Можно добавить дополнительные эффекты
        // Например, предзагрузку аудио
    }
    
    /**
     * Обновить счётчик слов
     * @param {number} total - Всего слов
     */
    updateWordCounter(total) {
        const counter = document.getElementById('word-counter');
        if (counter) {
            const learned = this.learnedWords.size;
            counter.innerHTML = `<span>${learned}</span> / ${total}`;
        }
    }
    
    /**
     * Получить все карточки
     * @returns {Array}
     */
    getCards() {
        return this.cards;
    }
    
    /**
     * Получить изученные слова
     * @returns {Set}
     */
    getLearnedWords() {
        return this.learnedWords;
    }
    
    /**
     * Сохранить прогресс (в localStorage)
     * @param {string} lessonId - ID урока
     */
    saveProgress(lessonId) {
        const progress = {
            lessonId,
            learned: Array.from(this.learnedWords),
            timestamp: Date.now()
        };
        localStorage.setItem(`lesson_${lessonId}`, JSON.stringify(progress));
        Utils.log('Progress saved', 'success');
    }
    
    /**
     * Загрузить прогресс (из localStorage)
     * @param {string} lessonId - ID урока
     */
    loadProgress(lessonId) {
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
            
            Utils.log('Progress loaded', 'success');
        }
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldBuilder;
}
