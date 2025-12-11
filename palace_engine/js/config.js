const CONFIG = {
    camera: {
        speed: 8,
        sprintMultiplier: 1.5,
        acceleration: 0.5,
        deceleration: 0.3,
        mouseSensitivity: 0.002,
        invertY: false,
        minPitch: -Math.PI / 2.5,
        maxPitch: Math.PI / 2.5,
        gravity: 0.5,
        groundLevel: 150,
        terminalVelocity: 20,
        fov: 800,
        minDepth: 0,
        maxDepth: 50000,
    },
    corridor: {
        width: 800,
        height: 300,
        roomSpacing: 800,
        roomBox: {
            enabled: false,
            wordsPerRoom: 5,
            roomDepth: 2000,
            roomWidth: 1500,
            roomHeight: 1200,
            doorHeight: 500,
            doorWidth: 300
        },
        cardPositions: [
            { x: -600, y: 0, z: 0, rotY: 90, wall: 'left' },
            { x: 600, y: 0, z: 0, rotY: -90, wall: 'right' },
            { x: -300, y: 100, z: -900, rotY: 0, wall: 'back' },
            { x: 300, y: 100, z: -900, rotY: 0, wall: 'back' },
            { x: 0, y: -100, z: -900, rotY: 0, wall: 'back' }
        ]
    },
    cards: {
        spacing: 800,
        offsetLeft: -250,
        offsetRight: 250,
        offsetY: 0,
        alternateWalls: true,
    },
    data: {
        basePath: '/data/',
        lessonParam: 'lesson',
    },
    ui: {
        loadingDelay: 500,
        errorTimeout: 5000,
        hintFadeDelay: 3000,
    },
    colors: {
        floor: '#1a1a2e',
        wall: '#16213e',
        accent: '#0f4c75'
    },
    audio: {
        enabled: false,
        volume: 0.5,
    }
};

export { CONFIG };