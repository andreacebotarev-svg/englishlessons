/* ============================================
   UTILITY FUNCTIONS
   Описание: Переиспользуемые хелперы
   Зависимости: config.js
   ============================================ */

const Utils = {
    /**
     * Получить параметр из URL
     * @param {string} name - Имя параметра
     * @returns {string|null} - Значение параметра или null
     */
    getURLParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },
    
    /**
     * Построить путь к JSON файлу
     * @param {string} lessonId - ID урока
     * @returns {string} - Полный путь к файлу
     */
    buildJSONPath(lessonId) {
        const origin = window.location.origin;
        const basePath = CONFIG.data.basePath;
        return `${origin}${basePath}${lessonId}.json`;
    },
    
    /**
     * Показать элемент
     * @param {HTMLElement} element - DOM элемент
     */
    show(element) {
        if (element) element.style.display = 'block';
    },
    
    /**
     * Скрыть элемент
     * @param {HTMLElement} element - DOM элемент
     */
    hide(element) {
        if (element) element.style.display = 'none';
    },
    
    /**
     * Установить текст элемента
     * @param {HTMLElement} element - DOM элемент
     * @param {string} text - Текст
     */
    setText(element, text) {
        if (element) element.textContent = text;
    },
    
    /**
     * Логирование с меткой времени
     * @param {string} message - Сообщение
     * @param {string} type - Тип (info/warn/error)
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const emoji = {
            info: '📘',
            warn: '⚠️',
            error: '❌',
            success: '✅'
        };
        console[type === 'error' ? 'error' : 'log'](
            `${emoji[type]} [${timestamp}] ${message}`
        );
    },
    
    /**
     * Debounce функция (для оптимизации событий)
     * @param {Function} func - Функция для debounce
     * @param {number} delay - Задержка (ms)
     * @returns {Function}
     */
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    /**
     * Проверка валидности JSON данных урока
     * @param {Object} data - Данные из JSON
     * @returns {boolean}
     */
    validateLessonData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.content || !data.content.vocabulary) return false;
        if (!Array.isArray(data.content.vocabulary.words)) return false;
        return data.content.vocabulary.words.length > 0;
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
