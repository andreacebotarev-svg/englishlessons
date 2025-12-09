/* ============================================
   CONFIGURATION & CONSTANTS
   Описание: Все настройки приложения
   ============================================ */

const CONFIG = {
    // === CAMERA SETTINGS ===
    camera: {
        speed: 50,              // Скорость движения (px за tick)
        minDepth: 0,            // Минимальная глубина (начало)
        maxDepth: 50000,        // Максимальная глубина (конец коридора)
        smoothing: 0.1,         // Плавность движения (0-1)
    },
    
    // === CORRIDOR SETTINGS ===
    corridor: {
        width: 800,
        height: 300,
        roomSpacing: 800        // ✅ ИЗМЕНЕНО: 400 → 800 (больше пространства между карточками)
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
    
    // === COLORS ===
    colors: {
        floor: '#1a1a2e',
        wall: '#16213e',
        accent: '#0f4c75'
    },
    
    // === AUDIO (для будущего) ===
    audio: {
        enabled: false,
        volume: 0.5,
    }
};

// ES6 экспорт
export { CONFIG };