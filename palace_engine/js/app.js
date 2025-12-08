/* ============================================
   MEMORY PALACE - MAIN APPLICATION
   Описание: Главный контроллер приложения
   Зависимости: config.js, utils.js, camera.js, builder.js, data-loader.js
   ============================================ */

class MemoryPalaceApp {
    constructor() {
        this.camera = null;
        this.builder = null;
        this.loader = null;
        this.lessonId = null;
        this.lessonData = null;
        
        // DOM элементы
        this.ui = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error-msg'),
            hint: document.getElementById('controls-hint'),
            backBtn: document.getElementById('back-btn')
        };
    }
    
    /**
     * Напечатать диагностику в консоль
     */
    printDiagnostics() {
        console.clear();
        console.log('%c=== MEMORY PALACE DEBUG INFO ===', 'color: #FFD60A; font-size: 16px; font-weight: bold');
        
        // CONFIG
        console.group('%cCONFIG', 'color: #0A84FF; font-weight: bold');
        console.log('camera.minDepth:', CONFIG.camera.minDepth);
        console.log('camera.maxDepth:', CONFIG.camera.maxDepth);
        console.log('camera.speed:', CONFIG.camera.speed);
        console.log('camera.smoothing:', CONFIG.camera.smoothing);
        console.log('cards.spacing:', CONFIG.cards.spacing);
        console.log('cards.offsetLeft:', CONFIG.cards.offsetLeft);
        console.log('cards.offsetRight:', CONFIG.cards.offsetRight);
        console.groupEnd();
        
        // CAMERA STATE
        console.group('%cCAMERA STATE', 'color: #10b981; font-weight: bold');
        console.log('depth:', this.camera.depth);
        console.log('targetDepth:', this.camera.targetDepth);
        console.log('CSS --depth value:', getComputedStyle(document.documentElement).getPropertyValue('--depth'));
        console.groupEnd();
        
        // CARDS
        console.group('%cCARDS INFO', 'color: #BF5AF2; font-weight: bold');
        console.log('Total cards:', this.builder.cards.length);
        console.log('Learned words:', this.builder.learnedWords.size);
        
        // Первые 3 карточки
        if (this.builder.cards.length > 0) {
            console.log('%cFirst 3 cards:', 'font-weight: bold');
            for (let i = 0; i < Math.min(3, this.builder.cards.length); i++) {
                const card = this.builder.cards[i];
                const transform = card.style.transform;
                const z = -CONFIG.cards.spacing * (i + 1);
                console.log(`Card ${i}:`, {
                    word: card.dataset.word,
                    expectedZ: z,
                    transform: transform,
                    visible: card.offsetParent !== null
                });
            }
        }
        console.groupEnd();
        
        // DOM ELEMENTS
        console.group('%cDOM ELEMENTS', 'color: #ff453a; font-weight: bold');
        const scene = document.getElementById('scene');
        const world = document.getElementById('world');
        const progressBar = document.getElementById('progress-bar');
        const wordCounter = document.getElementById('word-counter');
        
        console.log('scene exists:', !!scene);
        console.log('scene overflow:', window.getComputedStyle(scene).overflow);
        console.log('scene perspective:', window.getComputedStyle(scene).perspective);
        
        console.log('world exists:', !!world);
        console.log('world transform-style:', window.getComputedStyle(world).transformStyle);
        console.log('world transform:', window.getComputedStyle(world).transform);
        
        console.log('progressBar exists:', !!progressBar);
        console.log('progressBar width:', progressBar?.style.width || 'N/A');
        
        console.log('wordCounter exists:', !!wordCounter);
        console.log('wordCounter HTML:', wordCounter?.innerHTML || 'N/A');
        console.groupEnd();
        
        // HELP
        console.log('%c\nКОМАНДЫ ДЛЯ ОТЛАДКИ:', 'color: #FFD60A; font-size: 14px; font-weight: bold');
        console.log('app.camera.depth = 500  // Настроить глубину');
        console.log('app.camera.jumpTo(800)  // Мого к первой карточке');
        console.log('app.builder.cards[0]    // Первая карточка');
        console.log('app.printDiagnostics()  // Переснять диагностику');
    }
    
    /**
     * Инициализация приложения
     */
    async init() {
        console.clear();
        console.log('%c=== MEMORY PALACE STARTING ===', 'color: #FFD60A; font-size: 16px; font-weight: bold');
        
        try {
            // Получаем ID урока из URL
            this.lessonId = Utils.getURLParam(CONFIG.data.lessonParam);
            
            if (!this.lessonId) {
                throw new Error('Lesson ID not specified in URL');
            }
            
            console.log('%cLesson ID: ' + this.lessonId, 'color: #10b981; font-weight: bold');
            
            // Сохраняем в window для отладки
            window.app = this;
            
            // Создаём компоненты
            console.log('%cCreating components...', 'color: #0A84FF');
            this.loader = new DataLoader();
            this.builder = new WorldBuilder();
            this.camera = new Camera();
            console.log('%c✅ Components created', 'color: #10b981');
            
            // Загружаем данные
            console.log('%cLoading lesson data...', 'color: #0A84FF');
            this.lessonData = await this.loader.loadLesson(this.lessonId);
            console.log('%c✅ Data loaded:', 'color: #10b981', this.lessonData);
            
            // Строим мир
            console.log('%cBuilding world...', 'color: #0A84FF');
            this.builder.build(this.lessonData);
            console.log('%c✅ World built with', 'color: #10b981', this.builder.cards.length, 'cards');
            
            // Проверяем позиции карточек
            console.log('%cCard positions:', 'color: #BF5AF2; font-weight: bold');
            for (let i = 0; i < Math.min(3, this.builder.cards.length); i++) {
                const card = this.builder.cards[i];
                const transform = card.style.transform;
                console.log(`  Card ${i}: ${card.dataset.word} | Transform: ${transform.substring(0, 50)}...`);
            }
            
            // Загружаем прогресс
            this.builder.loadProgress(this.lessonId);
            
            // Скрываем loading
            setTimeout(() => {
                Utils.hide(this.ui.loading);
                console.log('%c✅ Loading hidden', 'color: #10b981');
            }, CONFIG.ui.loadingDelay);
            
            // Автосохранение прогресса
            setInterval(() => {
                this.builder.saveProgress(this.lessonId);
            }, 10000);
            
            // Напечатаем диагностику
            setTimeout(() => {
                this.printDiagnostics();
            }, 1000);
            
            console.log('%c=== APP READY ===', 'color: #FFD60A; font-size: 14px; font-weight: bold');
            
        } catch (error) {
            this.showError(error.message);
            console.error('%cInitialization failed:', 'color: #ff453a; font-weight: bold', error);
        }
    }
    
    /**
     * Показать ошибку
     * @param {string} message - Текст ошибки
     */
    showError(message) {
        Utils.hide(this.ui.loading);
        Utils.setText(this.ui.error, `Error: ${message}`);
        Utils.show(this.ui.error);
        
        // Автоскрытие ошибки
        setTimeout(() => {
            Utils.hide(this.ui.error);
        }, CONFIG.ui.errorTimeout);
    }
    
    /**
     * Уничтожить приложение (cleanup)
     */
    destroy() {
        if (this.camera) this.camera.destroy();
        if (this.builder) this.builder.saveProgress(this.lessonId);
        if (this.loader) this.loader.clearCache();
        console.log('%cApp destroyed', 'color: #0A84FF');
    }
}

// === ЗАПУСК ПРИЛОЖЕНИЯ ===
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new MemoryPalaceApp();
    app.init();
});

// Cleanup при закрытии страницы
 window.addEventListener('beforeunload', () => {
    if (app) app.destroy();
});

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryPalaceApp;
}