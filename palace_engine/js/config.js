/* ============================================
   CONFIGURATION & CONSTANTS
   Описание: Все настройки приложения
   Last update: 2025-12-11 (Perspective formula fix)
   ============================================ */

const CONFIG = {
    // === CAMERA SETTINGS ===
    camera: {
        // === 🆕 КРИТИЧЕСКИЕ ПАРАМЕТРЫ ПЕРСПЕКТИВЫ (по формуле эталона) ===
        basePerspective: 1,         // 🆕 Базовая величина perspective
        cameraSpeed: 200,           // 🆕 Множитель скорости (perspective = 1 × 200 = 200px)
        itemZ: 3,                   // 🆕 Интервал между карточками (spacing = 3 × 200 = 600px)
        
        // === ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ===
        // Формула: perspective = basePerspective × cameraSpeed
        fov: 200,                   // ✅ CRITICAL: 1 × 200 = 200px (was 2400)
        
        // Формула: maxDepth = spacing × numberOfCards
        // Будет рассчитан динамически в runtime
        maxDepth: 0,                // ✅ Dynamic calculation
        minDepth: 0,                // Минимальная глубина (начало)
        
        // Движение (WASD)
        speed: 8,                   // 🎮 Базовая скорость ходьбы (units/frame)
        sprintMultiplier: 1.5,      // 🎮 Множитель скорости при спринте
        acceleration: 0.5,          // 🎮 Ускорение (0-1, чем больше - резче старт)
        deceleration: 0.3,          // 🎮 Замедление (0-1, чем больше - резче стоп)
        
        // Управление мышью
        mouseSensitivity: 0.002,    // 🎮 Чувствительность мыши (радианы на пиксель)
        invertY: false,             // 🎮 Инвертировать вертикальную ось
        
        // Ограничения
        minPitch: -Math.PI / 3,     // 🎮 Минимальный угол наклона вверх (-60°)
        maxPitch: Math.PI / 3,      // 🎮 Максимальный угол наклона вниз (60°)
        
        // 🆕 ГРАВИТАЦИЯ И ПОЛ
        gravity: 0.5,               // 🆕 Сила гравитации (units/frame²)
        groundLevel: 150,           // 🆕 Уровень пола по Y (высота глаз персонажа)
        terminalVelocity: 20,       // 🆕 Максимальная скорость падения
    },
    
    // === CORRIDOR SETTINGS ===
    corridor: {
        width: 800,
        height: 300,
        
        // === 🆕 ФОРМУЛА SPACING ===
        // spacing = itemZ × cameraSpeed = 3 × 200 = 600px
        roomSpacing: 600,           // ✅ CRITICAL: Updated to 600px (was 500)
        
        // 🏛️ СИСТЕМА КОМНАТ-БОКСОВ (временно отключена)
        roomBox: {
            enabled: false,         // 🔴 ОТКЛЮЧЕНО для линейного коридора
            wordsPerRoom: 5,
            roomDepth: 2000,
            roomWidth: 1500,
            roomHeight: 1200,
            doorHeight: 500,
            doorWidth: 300
        },
        
        // 📍 Позиционирование карточек внутри комнат (для roomBox режима)
        cardPositions: [
            { x: -600, y: 0, z: 0, rotY: 90, wall: 'left' },
            { x: 600, y: 0, z: 0, rotY: -90, wall: 'right' },
            { x: -300, y: 100, z: -900, rotY: 0, wall: 'back' },
            { x: 300, y: 100, z: -900, rotY: 0, wall: 'back' },
            { x: 0, y: -100, z: -900, rotY: 0, wall: 'back' }
        ]
    },
    
    // === CARD LAYOUT ===
    cards: {
        // === 🆕 ФОРМУЛА SPACING ===
        spacing: 600,               // ✅ CRITICAL: 3 × 200 = 600px (was 500)
        offsetLeft: -250,           // Смещение левой стены (px)
        offsetRight: 250,           // Смещение правой стены (px)
        offsetY: 0,                 // Смещение по высоте (px)
        alternateWalls: true,       // Чередовать стены (true/false)
    },
    
    // === DATA SOURCE ===
    data: {
        basePath: '/data/',
        lessonParam: 'lesson',
    },
    
    // === UI SETTINGS ===
    ui: {
        loadingDelay: 500,
        errorTimeout: 5000,
        hintFadeDelay: 3000,
    },
    
    // === COLORS ===
    colors: {
        floor: '#1a1a2e',
        wall: '#16213e',
        accent: '#0f4c75'
    },
    
    // === AUDIO ===
    audio: {
        enabled: false,
        volume: 0.5,
    }
};

// === 🆕 HELPER FUNCTIONS ===

/**
 * Рассчитывает perspective по формуле эталона
 * @returns {number} Perspective в пикселях
 */
CONFIG.getPerspective = function() {
    return this.camera.basePerspective * this.camera.cameraSpeed;
};

/**
 * Рассчитывает spacing между карточками
 * @returns {number} Spacing в пикселях
 */
CONFIG.getSpacing = function() {
    return this.camera.itemZ * this.camera.cameraSpeed;
};

/**
 * Рассчитывает Z-позицию карточки по индексу
 * @param {number} index - Индекс карточки (0-based)
 * @returns {number} Z-позиция в пикселях (отрицательная)
 */
CONFIG.getCardZPosition = function(index) {
    const spacing = this.getSpacing();
    return spacing * index * -1;
};

/**
 * Рассчитывает глубину сцены для viewport
 * @param {number} numberOfCards - Количество карточек
 * @returns {number} Глубина сцены в пикселях
 */
CONFIG.calculateSceneDepth = function(numberOfCards) {
    const perspective = this.getPerspective();
    const spacing = this.getSpacing();
    
    // Формула из эталона:
    // depth = windowHeight + perspective + (spacing × numberOfCards)
    return window.innerHeight + perspective + (spacing * numberOfCards);
};

// ES6 экспорт
export { CONFIG };