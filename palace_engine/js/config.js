/* ============================================
   CONFIGURATION & CONSTANTS
   Описание: Все настройки приложения
   ============================================ */

const CONFIG = {
    // === CAMERA SETTINGS ===
    camera: {
        speed: 50,              // Скорость движения (px за tick)
        minDepth: 0,            // ✅ ИЗМЕНЕНО: Минимальная глубина (начало)
        maxDepth: 50000,        // ✅ ИЗМЕНЕНО: Максимальная глубина (конец коридора)
        smoothing: 0.1,         // Плавность движения (0-1)
    },
    
    // === CARD LAYOUT ===
    cards: {
        spacing: 800,           // Расстояние между карточками (px)
        offsetLeft: -250,       // Смещение левой стены (px)
        offsetRight: 250,       // Смещение правой стены (px)
        offsetY: 0,             // Смещение по высоте (px)
        alternateWalls: true,   // Чередовать стены (true/false)
    },
    
    // === DATA SOURCE ===
    data: {
        basePath: '/data/',     // Базовый путь к JSON файлам
        lessonParam: 'lesson',  // URL параметр для ID урока
    },
    
    // === UI SETTINGS ===
    ui: {
        loadingDelay: 500,      // Задержка перед скрытием загрузки (ms)
        errorTimeout: 5000,     // Время показа ошибки (ms)
        hintFadeDelay: 3000,    // Задержка перед исчезновением подсказки (ms)
    },
    
    // === AUDIO (для будущего) ===
    audio: {
        enabled: false,
        volume: 0.5,
    }
};

// Экспорт для других модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
