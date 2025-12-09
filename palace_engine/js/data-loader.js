/* ============================================
   DATA LOADER
   Описание: Загрузка JSON данных уроков
   Зависимости: config.js, utils.js
   ============================================ */

class DataLoader {
    constructor() {
        this.cache = new Map(); // Кэш загруженных уроков
    }
    
    /**
     * Загрузить данные урока
     * @param {string} lessonId - ID урока
     * @returns {Promise<Object>} - Данные урока
     */
    async loadLesson(lessonId) {
        Utils.log(`Loading lesson: ${lessonId}`, 'info');
        
        // Проверка кэша
        if (this.cache.has(lessonId)) {
            Utils.log('Using cached data', 'info');
            return this.cache.get(lessonId);
        }
        
        const jsonPath = Utils.buildJSONPath(lessonId);
        Utils.log(`Fetching: ${jsonPath}`, 'info');
        
        try {
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Валидация данных
            if (!Utils.validateLessonData(data)) {
                throw new Error('Invalid lesson data structure');
            }
            
            // Сохранение в кэш
            this.cache.set(lessonId, data);
            
            Utils.log('Lesson loaded successfully', 'success');
            return data;
            
        } catch (error) {
            Utils.log(`Failed to load lesson: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * Предзагрузка нескольких уроков
     * @param {Array<string>} lessonIds - Массив ID уроков
     */
    async preloadLessons(lessonIds) {
        Utils.log(`Preloading ${lessonIds.length} lessons...`, 'info');
        const promises = lessonIds.map(id => this.loadLesson(id).catch(() => null));
        await Promise.all(promises);
        Utils.log('Preloading complete', 'success');
    }
    
    /**
     * Очистить кэш
     */
    clearCache() {
        this.cache.clear();
        Utils.log('Cache cleared', 'info');
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
}
