/* ============================================
   MINECRAFT-STYLE CAMERA CONTROLLER
   Описание: FPS-контроллер с гравитацией
   ============================================ */

import { CONFIG } from './config.js';

const Camera = {
    // === ПОЗИЦИЯ ===
    x: 0,
    y: 150,
    z: 0,
    
    // === ОРИЕНТАЦИЯ (Эйлеровы углы) ===
    yaw: 0,
    pitch: 0,
    
    // === СКОРОСТЬ ДВИЖЕНИЯ ===
    velocity: {
        x: 0,
        y: 0,
        z: 0
    },
    
    // === НАСТРОЙКИ ===
    speed: 8,
    sprintMultiplier: 1.5,
    acceleration: 0.5,
    deceleration: 0.3,
    mouseSensitivity: 0.002,
    
    // 🆕 ГРАВИТАЦИЯ
    gravity: 0.5,
    groundLevel: 150,
    terminalVelocity: 20,
    isOnGround: true,
    
    // === ГРАНИЦЫ ===
    maxZ: 0,
    words: [],
    roomSpacing: 800,
    startOffset: 2000,
    activeThreshold: 400,
    
    // === СОСТОЯНИЕ КЛАВИШ ===
    keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
    },
    
    isPointerLocked: false,
    roomsCache: null,
    lastActiveRoom: -1,
    
    init() {
        console.log('🎮 Initializing Minecraft-style camera with gravity...');
        
        this.speed = CONFIG.camera.speed;
        this.sprintMultiplier = CONFIG.camera.sprintMultiplier;
        this.acceleration = CONFIG.camera.acceleration;
        this.deceleration = CONFIG.camera.deceleration;
        this.mouseSensitivity = CONFIG.camera.mouseSensitivity;
        
        this.gravity = CONFIG.camera.gravity;
        this.groundLevel = CONFIG.camera.groundLevel;
        this.terminalVelocity = CONFIG.camera.terminalVelocity;
        this.y = this.groundLevel;
        
        console.log(`📍 Camera start position: x=${this.x}, y=${this.y}, z=${this.z}`);
        console.log(`📐 Camera orientation: yaw=${this.yaw}rad, pitch=${this.pitch}rad`);
        
        this.setupKeyboard();
        this.setupMouse();
        this.setupTouchControls();
        this.startGameLoop();
        
        setTimeout(() => this.cacheRooms(), 100);
        
        console.log('🎮 Camera initialized with gravity');
        console.log(`   - Ground level: ${this.groundLevel}px`);
        console.log(`   - Gravity: ${this.gravity} units/frame²`);
        console.log(`   - Terminal velocity: ${this.terminalVelocity}`);
    },
    
    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    e.preventDefault();
                    this.keys.forward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    e.preventDefault();
                    this.keys.backward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    e.preventDefault();
                    this.keys.left = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    e.preventDefault();
                    this.keys.right = true;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    e.preventDefault();
                    this.keys.sprint = true;
                    break;
                
                case 'Space':
                    e.preventDefault();
                    this.jumpToNextRoom();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.jumpToStart();
                    break;
                case 'End':
                    e.preventDefault();
                    this.jumpToEnd();
                    break;
            }
            
            this.updateWASDHints();
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.keys.forward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.keys.backward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.keys.sprint = false;
                    break;
            }
            
            this.updateWASDHints();
        });
    },
    
    setupMouse() {
        const scene = document.querySelector('#scene');
        if (!scene) return;
        
        scene.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                scene.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === scene;
            
            if (this.isPointerLocked) {
                console.log('🎮 Cursor locked - use mouse to look around');
                this.showLockMessage(false);
            } else {
                console.log('🎮 Cursor unlocked - click to lock again');
                this.showLockMessage(true);
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked) return;
            
            this.yaw -= e.movementX * this.mouseSensitivity;
            this.pitch -= e.movementY * this.mouseSensitivity * (CONFIG.camera.invertY ? -1 : 1);
            
            this.pitch = Math.max(CONFIG.camera.minPitch, Math.min(CONFIG.camera.maxPitch, this.pitch));
            
            const twoPi = Math.PI * 2;
            if (this.yaw > twoPi) this.yaw -= twoPi;
            if (this.yaw < 0) this.yaw += twoPi;
        });
        
        this.showLockMessage(true);
    },
    
    showLockMessage(show) {
        let msg = document.getElementById('pointer-lock-message');
        
        if (!msg) {
            msg = document.createElement('div');
            msg.id = 'pointer-lock-message';
            msg.innerHTML = '🖱️ Click to look around (ESC to exit)';
            msg.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: #FFD60A;
                padding: 20px 40px;
                border-radius: 12px;
                border: 2px solid #FFD60A;
                font-size: 18px;
                font-weight: 600;
                z-index: 10000;
                pointer-events: none;
                transition: opacity 0.3s;
            `;
            document.body.appendChild(msg);
        }
        
        msg.style.opacity = show ? '1' : '0';
    },
    
    startGameLoop() {
        const update = () => {
            this.updateMovement();
            this.applyTransform();
            this.updateActiveRooms();
            this.updateProgress();
            this.updateWordCounter();
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    },
    
    /**
     * 🐛 FIX: Исправлено движение WASD
     */
    updateMovement() {
        // === ГОРИЗОНТАЛЬНОЕ ДВИЖЕНИЕ (X, Z) ===
        let inputX = 0;
        let inputZ = 0;
        
        if (this.keys.forward) inputZ += 1;   // W — вперёд
        if (this.keys.backward) inputZ -= 1;  // S — назад
        if (this.keys.left) inputX -= 1;      // A — влево
        if (this.keys.right) inputX += 1;     // D — вправо
        
        // Нормализация диагонального движения
        const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
        if (length > 0) {
            inputX /= length;
            inputZ /= length;
        }
        
        const sin = Math.sin(this.yaw);
        const cos = Math.cos(this.yaw);
        
        const baseSpeed = this.speed * (this.keys.sprint ? this.sprintMultiplier : 1);
        
        // 🐛 FIX: Правильная формула для FPS-движения
        // Инвертирован знак Z для правильного направления
        const targetVelocityX = (inputZ * sin + inputX * cos) * baseSpeed;
        const targetVelocityZ = -(inputZ * cos - inputX * sin) * baseSpeed;  // 🐛 ИНВЕРТИРОВАНО
        
        if (inputX !== 0 || inputZ !== 0) {
            this.velocity.x += (targetVelocityX - this.velocity.x) * this.acceleration;
            this.velocity.z += (targetVelocityZ - this.velocity.z) * this.acceleration;
        } else {
            this.velocity.x *= (1 - this.deceleration);
            this.velocity.z *= (1 - this.deceleration);
            
            if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
            if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0;
        }
        
        const oldX = this.x;
        const oldZ = this.z;
        
        this.x += this.velocity.x;
        this.z += this.velocity.z;
        
        // Логирование движения (каждые 50px)
        if (Math.abs(this.z - oldZ) > 0.1 && Math.floor(this.z / 50) !== Math.floor(oldZ / 50)) {
            console.log(`🚶 Moving: Z=${Math.round(this.z)}px, X=${Math.round(this.x)}px, Yaw=${Math.round(this.yaw * 180 / Math.PI)}°`);
        }
        
        // === ВЕРТИКАЛЬНОЕ ДВИЖЕНИЕ (Y) - ГРАВИТАЦИЯ ===
        this.velocity.y -= this.gravity;
        
        if (this.velocity.y < -this.terminalVelocity) {
            this.velocity.y = -this.terminalVelocity;
        }
        
        this.y += this.velocity.y;
        
        // КОЛЛИЗИЯ С ПОЛОМ
        if (this.y <= this.groundLevel) {
            this.y = this.groundLevel;
            this.velocity.y = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        
        // === ОГРАНИЧЕНИЯ ПО X И Z ===
        if (this.z < 0) {
            this.z = 0;
            this.velocity.z = 0;
        }
        if (this.z > this.maxZ) {
            this.z = this.maxZ;
            this.velocity.z = 0;
        }
        
        const maxX = 2000;
        if (this.x < -maxX) {
            this.x = -maxX;
            this.velocity.x = 0;
        }
        if (this.x > maxX) {
            this.x = maxX;
            this.velocity.x = 0;
        }
    },
    
    applyTransform() {
        const corridor = document.querySelector('#corridor');
        if (!corridor) return;
        
        document.documentElement.style.setProperty('--fov', `${CONFIG.camera.fov}px`);
        
        corridor.style.transform = `
            translateZ(${CONFIG.camera.fov}px)
            rotateX(${this.pitch}rad)
            rotateY(${this.yaw}rad)
            translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px)
        `;
    },
    
    updateWASDHints() {
        const map = [
            ['w', this.keys.forward],
            ['a', this.keys.left],
            ['s', this.keys.backward],
            ['d', this.keys.right],
        ];
        
        map.forEach(([key, active]) => {
            const el = document.querySelector(`.wasd-key[data-key="${key}"]`);
            if (el) {
                el.classList.toggle('wasd-key--active', active);
            }
        });
    },
    
    setupTouchControls() {
        let touchStartY = 0;
        let touchStartX = 0;
        let isSwiping = false;
        
        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('.room-card')) return;
            
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            if (e.cancelable) e.preventDefault();
            
            const deltaY = touchStartY - e.touches[0].clientY;
            const deltaX = touchStartX - e.touches[0].clientX;
            
            if (Math.abs(deltaY) > 5) {
                const direction = deltaY > 0 ? 1 : -1;
                this.velocity.z += direction * this.speed * 0.1;
                touchStartY = e.touches[0].clientY;
            }
            
            if (Math.abs(deltaX) > 5) {
                this.yaw -= deltaX * 0.01;
                touchStartX = e.touches[0].clientX;
            }
        }, { passive: false });
        
        window.addEventListener('touchend', () => {
            isSwiping = false;
        }, { passive: true });
    },
    
    cacheRooms() {
        this.roomsCache = Array.from(document.querySelectorAll('.room'));
        const roomBoxes = document.querySelectorAll('.room-box');
        const roomCards = document.querySelectorAll('.room-card');
        
        console.log(`💾 Cached rooms:`);
        console.log(`   - Linear rooms: ${this.roomsCache.length}`);
        console.log(`   - Room boxes: ${roomBoxes.length}`);
        console.log(`   - Room cards: ${roomCards.length}`);
    },
    
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
    
    jumpToStart() {
        this.animateTo(0, 1000);
        this.x = 0;
        this.y = this.groundLevel;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        console.log('⏪ Jump to start');
    },
    
    jumpToEnd() {
        this.animateTo(this.maxZ, 1000);
        console.log('⏩ Jump to end');
    },
    
    animateTo(targetZ, duration = 800) {
        const startZ = this.z;
        const distance = targetZ - startZ;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
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
    
    updateActiveRooms() {
        if (CONFIG.corridor.roomBox.enabled) {
            this.updateActiveRoomBoxes();
        } else {
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
                        room.classList.add('room--active');
                    } else {
                        room.classList.remove('room--active');
                    }
                }
            });
        }
    },
    
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
            
            roomBox.style.visibility = distance > roomDepth * 3 ? 'hidden' : 'visible';
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
                
                const yawDeg = Math.round((this.yaw * 180 / Math.PI) % 360);
                const pitchDeg = Math.round(this.pitch * 180 / Math.PI);
                
                counter.innerHTML = `
                    <div>Комната ${clampedRoomIndex + 1}/${totalRooms}</div>
                    <div style="font-size: 10px; color: #666;">
                        Yaw: ${yawDeg}° | Pitch: ${pitchDeg}°
                        ${this.keys.sprint ? ' 🏃 SPRINT' : ''}
                        ${this.isOnGround ? ' 🟢' : ' 🔴'}
                    </div>
                `;
            } else {
                const currentWordIndex = Math.floor((this.z - this.startOffset) / this.roomSpacing);
                const clampedIndex = Math.min(Math.max(0, currentWordIndex), this.words.length - 1);
                
                const yawDeg = Math.round((this.yaw * 180 / Math.PI) % 360);
                
                counter.innerHTML = `
                    <div>${clampedIndex + 1} / ${this.words.length}</div>
                    <div style="font-size: 10px; color: #666;">
                        Yaw: ${yawDeg}° ${this.isOnGround ? '🟢' : '🔴'}
                    </div>
                `;
            }
        }
    }
};

function initCamera(words, config) {
    if (!words || words.length === 0) {
        console.warn('⚠️ No words provided');
        return;
    }
    
    Camera.roomSpacing = config.corridor.roomSpacing;
    Camera.startOffset = 2000;
    Camera.maxZ = Camera.startOffset + (words.length * Camera.roomSpacing);
    Camera.words = words;
    Camera.activeThreshold = 400;
    
    Camera.init();
    
    console.log('🎮 Minecraft Camera with gravity configured:', {
        speed: Camera.speed,
        gravity: Camera.gravity,
        groundLevel: Camera.groundLevel,
        words: words.length,
        maxZ: Camera.maxZ
    });
}

export { initCamera, Camera };