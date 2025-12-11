/* ============================================
   CONFIGURATION & CONSTANTS
   Описание: Все настройки приложения
   Last update: 2025-12-11 (WASD mode restored)
   ============================================ */

const CONFIG = {
    // === CAMERA SETTINGS (MINECRAFT-STYLE) ===
    camera: {
        // Движение
        speed: 8,                   // 🎮 Базовая скорость ходьбы (units/frame)
        sprintMultiplier: 1.5,      // 🎮 Множитель скорости при спринте
        acceleration: 0.5,          // 🎮 Ускорение (0-1, чем больше - резче старт)
        deceleration: 0.3,          // 🎮 Замедление (0-1, чем больше - резче стоп)
        
        // Управление мышью
        mouseSensitivity: 0.002,    // 🎮 Чувствительность мыши (радианы на пиксель)
        invertY: false,             // 🎮 Инвертировать вертикальную ось
        
        // Ограничения
        minPitch: -Math.PI / 2.5,   // 🎮 Минимальный угол наклона вверх (-72°)
        maxPitch: Math.PI / 2.5,    // 🎮 Максимальный угол наклона вниз (72°)
        
        // 🆕 ГРАВИТАЦИЯ И ПОЛ
        gravity: 0.5,               // 🆕 Сила гравитации (units/frame²)
        groundLevel: 150,           // 🆕 Уровень пола по Y (высота глаз персонажа)
        terminalVelocity: 20,       // 🆕 Максимальная скорость падения
        
        // 3D
        fov: 800,                   // ✅ Synced to 800px to match scene-3d.css perspective
        minDepth: 0,                // Минимальная глубина (начало)
        maxDepth: 12000,            // ✅ OPTIMIZED: For 24 cards × 500px spacing
    },
    
    // === CORRIDOR SETTINGS ===
    corridor: {
        width: 800,
        height: 300,
        roomSpacing: 500,       // ✅ RESTORED: 500px spacing (was changed to 600 by Qwen)
        
        // 🏛️ СИСТЕМА КОМНАТ-БОКСОВ
        roomBox: {
            enabled: false,      // 🔴 ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ОТЛАДКИ
            wordsPerRoom: 5,
            roomDepth: 2000,
            roomWidth: 1500,
            roomHeight: 1200,
            doorHeight: 500,
            doorWidth: 300
        },
        
        // 📍 Позиционирование карточек внутри комнат
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
        spacing: 500,           // ✅ RESTORED: 500px (matches corridor.roomSpacing)
        offsetLeft: -250,       // Смещение левой стены (px)
        offsetRight: 250,       // Смещение правой стены (px)
        offsetY: 0,             // Смещение по высоте (px)
        alternateWalls: true,   // Чередовать стены (true/false)
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

export { CONFIG };