/* ============================================
   CAMERA CONTROLLER (WASD Navigation)
   Описание: Игровое управление камерой с WASD
   ============================================ */

import { CONFIG } from './config.js';

const Camera = {
    // === ПОЗИЦИЯ И ОРИЕНТАЦИЯ ===
    x: 0,                    // Позиция по X (лево/право)
    y: 0,                    // Позиция по Y (вверх/вниз) - не используется пока
    z: 0,                    // Позиция по Z (вперёд/назад)
    rotation: 0,             // 🎮 Угол поворота камеры (градусы)
    
    // === НАСТРОЙКИ ===
    speed: 50,               // Скорость движения
    rotationSpeed: 2,        // Скорость поворота
    strafeSpeed: 30,         // Скорость стрейфа
    smoothing: 0.15,         // Сглаживание
    fov: 1000,               // Перспектива
    
    // === ГРАНИЦЫ И ДАННЫЕ ===
    maxZ: 0,
    words: [],
    roomSpacing: 800,
    startOffset: 2000,
    activeThreshold: 400,
    
    // === ОПТИМИЗАЦИЯ ===
    roomsCache: null,
    isTicking: false,
    lastActiveRoom: -1,
    
    // === 🎮 СОСТОЯНИЕ КЛАВИШ ===
    keys: {
        forward: false,      // W
        backward: false,     // S
        left: false,         // A
        right: false,        // D
        strafeLeft: false,   // Q
        strafeRight: false,  // E
    },
    
    // === 🎮 ЦЕЛЕВЫЕ ЗНАЧЕНИЯ ДЛЯ СГЛАЖИВАНИЯ ===
    targetRotation: 0,
    
    init() {
        console.log('🎮 Initializing WASD camera controls...');
        
        // === КЛАВИАТУРА (WASD) ===
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        window.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
        
        // === КОЛЕСИКО МЫШИ (опционально, для совместимости) ===
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            this.moveForward(direction);
        }, { passive: false });
        
        // === МОБИЛЬНЫЕ СВАЙПЫ (опционально) ===
        this.setupTouchControls();
        
        // === ИГРОВОЙ ЦИКЛ ===
        this.startGameLoop();
        
        // === КЭШИРОВАНИЕ DOM ===
        setTimeout(() => {
            this.cacheRooms();
        }, 100);
        
        console.log('🎮 WASD camera initialized');
        console.log('   W/S - Move forward/backward');
        console.log('   A/D - Rotate left/right');
        console.log('   Q/E - Strafe left/right (optional)');
    },
    
    /**
     * 🎮 Обработчик нажатия клавиш
     */
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Подсветка клавиши
        const keyElement = document.querySelector(`.wasd-key[data-key="${key}"]`);
        if (keyElement) {
            keyElement.classList.add('wasd-key--active');
        }
        
        switch(key) {
            case 'w':
            case 'arrowup':
                e.preventDefault();
                this.keys.forward = true;
                break;
            case 's':
            case 'arrowdown':
                e.preventDefault();
                this.keys.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                e.preventDefault();
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                e.preventDefault();
                this.keys.right = true;
                break;
            case 'q':
                e.preventDefault();
                this.keys.strafeLeft = true;
                break;
            case 'e':
                e.preventDefault();
                this.keys.strafeRight = true;
                break;
            
            // === ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ ===
            case ' ':
                e.preventDefault();
                this.jumpToNextRoom();
                break;
            case 'home':
                e.preventDefault();
                this.jumpToStart();
                break;
            case 'end':
                e.preventDefault();
                this.jumpToEnd();
                break;
        }
    },
    
    /**
     * 🎮 Обработчик отпускания клавиш
     */
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        
        // Убираем подсветку
        const keyElement = document.querySelector(`.wasd-key[data-key="${key}"]`);
        if (keyElement) {
            keyElement.classList.remove('wasd-key--active');
        }
        
        switch(key) {
            case 'w':
            case 'arrowup':
                this.keys.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
            case 'q':
                this.keys.strafeLeft = false;
                break;
            case 'e':
                this.keys.strafeRight = false;
                break;
        }
    },
    
    /**
     * 🎮 Игровой цикл (60 FPS)
     */
    startGameLoop() {
        const update = () => {
            // Обновляем движение на основе нажатых клавиш
            this.updateMovement();
            
            // Применяем изменения к DOM
            this.applyTransform();
            
            // Обновляем активные комнаты и UI
            this.updateActiveRooms();
            this.updateProgress();
            this.updateWordCounter();
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    },
    
    /**
     * 🎮 Обновление движения и поворота
     */
    updateMovement() {
        let moved = false;
        
        // === ДВИЖЕНИЕ ВПЕРЁД/НАЗАД ===
        if (this.keys.forward) {
            this.moveForward(1);
            moved = true;
        }
        if (this.keys.backward) {
            this.moveForward(-1);
            moved = true;
        }
        
        // === ПОВОРОТ ВЛЕВО/ВПРАВО ===
        if (this.keys.left) {
            this.targetRotation += this.rotationSpeed;
            moved = true;
        }
        if (this.keys.right) {
            this.targetRotation -= this.rotationSpeed;
            moved = true;
        }
        
        // === СТРЕЙФ ВЛЕВО/ВПРАВО (опционально) ===
        if (this.keys.strafeLeft) {
            this.strafe(-1);
            moved = true;
        }
        if (this.keys.strafeRight) {
            this.strafe(1);
            moved = true;
        }
        
        // === СГЛАЖИВАНИЕ ПОВОРОТА ===
        const rotationDiff = this.targetRotation - this.rotation;
        this.rotation += rotationDiff * this.smoothing;
        
        // Нормализация угла (0-360)
        if (this.rotation > 360) this.rotation -= 360;
        if (this.rotation < 0) this.rotation += 360;
        
        // Лог движения (каждые 100px)
        if (moved && Math.floor(this.z / 100) !== Math.floor((this.z - this.speed) / 100)) {
            console.log(`🎮 Camera: Z=${Math.round(this.z)}px, Rot=${Math.round(this.rotation)}°, X=${Math.round(this.x)}px`);
        }
    },
    
    /**
     * 🎮 Движение вперёд/назад (с учётом поворота)
     */
    moveForward(direction) {
        // Конвертируем угол в радианы
        const rad = (this.rotation * Math.PI) / 180;
        
        // Движение по Z (вперёд/назад)
        this.z += direction * this.speed * Math.cos(rad);
        
        // Движение по X (из-за поворота)
        this.x += direction * this.speed * Math.sin(rad);
        
        // Ограничения по Z
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;
        
        // Ограничения по X (чтобы не уйти далеко в сторону)
        const maxX = 2000; // Максимальное смещение влево/вправо
        if (this.x < -maxX) this.x = -maxX;
        if (this.x > maxX) this.x = maxX;
    },
    
    /**
     * 🎮 Стрейф (движение влево/вправо без поворота)
     */
    strafe(direction) {
        // Конвертируем угол в радианы
        const rad = (this.rotation * Math.PI) / 180;
        
        // Движение перпендикулярно направлению взгляда
        this.x += direction * this.strafeSpeed * Math.cos(rad);
        this.z -= direction * this.strafeSpeed * Math.sin(rad);
        
        // Ограничения
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;
        
        const maxX = 2000;
        if (this.x < -maxX) this.x = -maxX;
        if (this.x > maxX) this.x = maxX;
    },
    
    /**
     * 🎮 Применение трансформации к 3D-сцене
     */
    applyTransform() {
        const scene = document.querySelector('#corridor');  // 🐛 FIX: Изменено с .corridor на #corridor
        if (!scene) return;
        
        // Применяем перспективу к корневому элементу
        document.documentElement.style.setProperty('--fov', `${this.fov}px`);
        
        // Применяем трансформацию к коридору
        scene.style.transform = `
            translateZ(${this.fov}px)
            rotateY(${this.rotation}deg)
            translate3d(${-this.x}px, 0px, ${-this.z}px)
        `;
    },
    
    /**
     * Прыжок к следующей комнате (Space)
     */
    jumpToNextRoom() {
        if (!CONFIG.corridor.roomBox.enabled) return;
        
        const { roomDepth } = CONFIG.corridor.roomBox;
        const currentRoom = Math.floor((this.z - 2000) / roomDepth);
        const nextRoom = currentRoom + 1;
        const totalRooms = Math.ceil(this.words.length / CONFIG.corridor.roomBox.wordsPerRoom);
        
        if (nextRoom < totalRooms) {
            const targetZ = 2000 + (nextRoom * roomDepth);
            this.animateTo(targetZ, 800);
            console.log(`⏩ Jump to room ${nextRoom}`);
        }
    },
    
    /**
     * Прыжок в начало (Home)
     */
    jumpToStart() {
        this.animateTo(0, 1000);
        this.x = 0;
        this.rotation = 0;
        this.targetRotation = 0;
        console.log('⏪ Jump to start');
    },
    
    /**
     * Прыжок в конец (End)
     */
    jumpToEnd() {
        this.animateTo(this.maxZ, 1000);
        console.log('⏩ Jump to end');
    },
    
    /**
     * Плавная анимация к целевой Z-позиции
     */
    animateTo(targetZ, duration = 800) {
        const startZ = this.z;
        const distance = targetZ - startZ;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing: ease-in-out
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            this.z = startZ + (distance * easeProgress);
            
            if (this.z < 0) this.z = 0;
            if (this.z > this.maxZ) this.z = this.maxZ;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Настройка touch-контролов для мобильных (опционально)
     */
    setupTouchControls() {
        let touchStartY = 0;
        let touchStartX = 0;
        let isSwiping = false;
        
        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('.room-card') || e.target.closest('.control-button')) {
                return;
            }
            
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            
            if (e.cancelable) {
                e.preventDefault();
            }
            
            const touchEndY = e.touches[0].clientY;
            const touchEndX = e.touches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = touchStartX - touchEndX;
            
            // Вертикальный свайп - движение вперёд/назад
            if (Math.abs(deltaY) > 5) {
                const direction = deltaY > 0 ? 1 : -1;
                this.moveForward(direction * 0.3);
                touchStartY = touchEndY;
            }
            
            // Горизонтальный свайп - поворот
            if (Math.abs(deltaX) > 5) {
                this.targetRotation -= deltaX * 0.1;
                touchStartX = touchEndX;
            }
        }, { passive: false });
        
        window.addEventListener('touchend', () => {
            isSwiping = false;
        }, { passive: true });
    },
    
    /**
     * Кэширование комнат
     */
    cacheRooms() {
        this.roomsCache = Array.from(document.querySelectorAll('.room'));
        console.log(`💾 Cached ${this.roomsCache.length} rooms`);
    },
    
    /**
     * Обновление активных комнат
     */
    updateActiveRooms() {
        if (CONFIG.corridor.roomBox.enabled) {
            this.updateActiveRoomBoxes();
        } else {
            // Линейный режим (существующая логика)
            if (!this.roomsCache) {
                this.roomsCache = Array.from(document.querySelectorAll('.room'));
            }
            
            const visibilityThreshold = (this.roomSpacing * 5) + this.activeThreshold;
            
            this.roomsCache.forEach(room => {
                const roomZ = parseFloat(room.dataset.position || 0);
                const distance = Math.abs(this.z - roomZ);
                
                if (distance > visibilityThreshold) {
                    room.style.visibility = 'hidden';
                } else {
                    room.style.visibility = 'visible';
                    
                    if (distance < this.activeThreshold) {
                        if (!room.classList.contains('room--active')) {
                            room.classList.add('room--active');
                        }
                    } else {
                        room.classList.remove('room--active');
                    }
                }
            });
        }
    },
    
    /**
     * Обновление активных комнат-боксов
     */
    updateActiveRoomBoxes() {
        const roomBoxes = document.querySelectorAll('.room-box');
        const { roomDepth } = CONFIG.corridor.roomBox;
        
        let activeRoomIndex = -1;
        let minDistance = Infinity;
        
        roomBoxes.forEach((roomBox, index) => {
            const roomZ = parseFloat(roomBox.style.transform.match(/translateZ\(-?(\d+)px\)/)?.[1] || 0);
            const distance = Math.abs(this.z - roomZ);
            
            if (distance < minDistance) {
                minDistance = distance;
                activeRoomIndex = index;
            }
            
            if (distance > roomDepth * 3) {
                roomBox.style.visibility = 'hidden';
            } else {
                roomBox.style.visibility = 'visible';
            }
        });
        
        roomBoxes.forEach((roomBox, index) => {
            const cards = roomBox.querySelectorAll('.room-card');
            
            if (index === activeRoomIndex) {
                roomBox.classList.add('room-box--active');
                cards.forEach(card => card.classList.add('room-card--active'));
                
                if (this.lastActiveRoom !== activeRoomIndex) {
                    console.log(`✨ Entered room ${activeRoomIndex}`);
                    this.lastActiveRoom = activeRoomIndex;
                }
            } else {
                roomBox.classList.remove('room-box--active');
                cards.forEach(card => card.classList.remove('room-card--active'));
            }
        });
    },
    
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar && this.maxZ > 0) {
            const progress = (this.z / this.maxZ) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    },
    
    updateWordCounter() {
        const counter = document.getElementById('word-counter');
        if (counter && this.words.length > 0) {
            if (CONFIG.corridor.roomBox.enabled) {
                const { roomDepth, wordsPerRoom } = CONFIG.corridor.roomBox;
                const currentRoomIndex = Math.floor((this.z - 2000) / roomDepth);
                const totalRooms = Math.ceil(this.words.length / wordsPerRoom);
                const clampedRoomIndex = Math.min(Math.max(0, currentRoomIndex), totalRooms - 1);
                
                counter.innerHTML = `
                    <div>Комната ${clampedRoomIndex + 1}/${totalRooms}</div>
                    <div style="font-size: 12px; color: #888;">Угол: ${Math.round(this.rotation)}°</div>
                `;
            } else {
                const currentWordIndex = Math.floor((this.z - this.startOffset) / this.roomSpacing);
                const clampedIndex = Math.min(Math.max(0, currentWordIndex), this.words.length - 1);
                counter.textContent = `${clampedIndex + 1} / ${this.words.length}`;
            }
        }
    }
};

/**
 * Инициализация камеры
 */
function initCamera(words, config) {
    if (!words || words.length === 0) {
        console.warn('⚠️ No words provided');
        return;
    }
    
    // Применяем настройки из конфига
    Camera.speed = config.camera.speed || 50;
    Camera.rotationSpeed = config.camera.rotationSpeed || 2;
    Camera.strafeSpeed = config.camera.strafeSpeed || 30;
    Camera.smoothing = config.camera.smoothing || 0.15;
    Camera.fov = config.camera.fov || 1000;
    
    Camera.roomSpacing = config.corridor.roomSpacing;
    Camera.startOffset = 2000;
    Camera.maxZ = Camera.startOffset + (words.length * Camera.roomSpacing);
    Camera.words = words;
    Camera.activeThreshold = 400;
    
    Camera.init();
    
    console.log(`🎮 WASD Camera configured:`);
    console.log(`   - Speed: ${Camera.speed}px/tick`);
    console.log(`   - Rotation: ${Camera.rotationSpeed}°/tick`);
    console.log(`   - Strafe: ${Camera.strafeSpeed}px/tick`);
    console.log(`   - FOV: ${Camera.fov}px`);
    console.log(`   - Words: ${words.length}`);
}

export { initCamera, Camera };