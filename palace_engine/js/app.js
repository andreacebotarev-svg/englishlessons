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
     * Инициализация приложения
     */
    async init() {
        Utils.log('=== MEMORY PALACE STARTING ===', 'info');
        
        try {
            // Получаем ID урока из URL
            this.lessonId = Utils.getURLParam(CONFIG.data.lessonParam);
            
            if (!this.lessonId) {
                throw new Error('Lesson ID not specified in URL');
            }
            
            Utils.log(`Lesson ID: ${this.lessonId}`, 'info');
            
            // Создаём компоненты
            this.loader = new DataLoader();
            this.builder = new WorldBuilder();
            this.camera = new Camera();
            
            // Загружаем данные
            this.lessonData = await this.loader.loadLesson(this.lessonId);
            
            // Строим мир
            this.builder.build(this.lessonData);
            
            // Загружаем прогресс
            this.builder.loadProgress(this.lessonId);
            
            // Скрываем loading
            setTimeout(() => {
                Utils.hide(this.ui.loading);
            }, CONFIG.ui.loadingDelay);
            
            // Автосохранение прогресса каждые 10 секунд
            setInterval(() => {
                this.builder.saveProgress(this.lessonId);
            }, 10000);
            
            Utils.log('=== APP READY ===', 'success');
            
        } catch (error) {
            this.showError(error.message);
            Utils.log(`Initialization failed: ${error.message}`, 'error');
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
        Utils.log('App destroyed', 'info');
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
