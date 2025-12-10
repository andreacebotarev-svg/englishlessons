/* ============================================
   MINECRAFT-STYLE CAMERA CONTROLLER
   Описание: FPS-контроллер с гравитацией
   ============================================ */

import { CONFIG } from './config.js';

/* 
 * === КООРДИНАТНАЯ СИСТЕМА ===
 * 
 * В CSS 3D:
 * - Z+ идёт К ЗРИТЕЛЮ (из экрана)
 * - Z- идёт ОТ ЗРИТЕЛЯ (в глубину экрана)
 * 
 * В нашей системе:
 * - Камера смотрит в направлении -Z (вглубь)
 * - Карточки размещены в negative Z: -800, -1600, -2400...
 * - Camera.z увеличивается при движении вперёд (W)
 * 
 * Расстояние от камеры до объекта:
 * distance = objectWorldZ - Camera.z
 * 
 * Пример:
 * - Card at Z=-800, Camera at Z=0   → distance = -800 (карточка впереди на 800px)
 * - Card at Z=-800, Camera at Z=700 → distance = -1500 (карточка впереди на 1500px)
 * - Card at Z=-800, Camera at Z=-800 → distance = 0 (на карточке)
 * 
 * Transform применяется как:
 * translate3d(-Camera.x, -Camera.y, -Camera.z)
 * 
 * Это значит: когда Camera.z=-800, мир сдвигается на +800px по Z,
 * и карточка на Z=-800 оказывается в позиции -800+800 = 0 (на камере)
 */

const Camera = {
    // === ПОЗИЦИЯ ===
    x: 0,
    y: 150,
    z: 0,  // Будет установлена в init()
    
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
    minZ: 0,  // Будет рассчитан в init()
    maxZ: 0,  // Будет рассчитан в init()
    words: [],
    roomSpacing: 800,
    startOffset: 2000,
    activeThreshold: 400,
    
    // 🎯 RAYCAST СИСТЕМА
    targetedCard: null,        // Текущая карточка под прицелом
    rayCastDistance: 2000,     // Максимальная дистанция raycast
    lastRaycastLog: 0,         // Для ограничения debug-логов
    
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
        
        // Стартуем НА РАССТОЯНИИ от первой карточки
        const firstCardWorldZ = -CONFIG.cards.spacing;  // -800
        const safeViewDistance = 1500;
        this.z = firstCardWorldZ + safeViewDistance;  // -800 + 1500 = 700
        
        // Правильные границы движения
        this.minZ = -(CONFIG.cards.spacing * this.words.length) - 500;
        this.maxZ = this.z + 300;  // 700 + 300 = 1000
        
        console.log('📍 Camera start position:');
        console.log(`   x=${this.x}, y=${this.y}, z=${this.z}`);
        console.log(`🎯 First card at world Z=${firstCardWorldZ}px`);
        console.log(`📏 Distance to first card: ${Math.abs(firstCardWorldZ - this.z)}px`);
        console.log(`🚧 Boundaries: minZ=${this.minZ}px, maxZ=${this.maxZ}px`);
        console.log(`💡 Move forward (W) to approach cards`);
        
        this.setupKeyboard();
        this.setupMouse();
        this.setupRaycast();  // 🎯 НОВАЯ СИСТЕМА
        this.setupTouchControls();
        this.startGameLoop();
        
        setTimeout(() => this.cacheRooms(), 100);
        
        console.log('🎮 Camera initialized with gravity');
        console.log(`   - Ground level: ${this.groundLevel}px`);
        console.log(`   - Gravity: ${this.gravity} units/frame²`);
        console.log(`   - Terminal velocity: ${this.terminalVelocity}`);
        console.log('🎯 Raycast system initialized');
    },
    
    /**
     * 🎯 Настройка системы raycast и кликов
     */
    setupRaycast() {
        // ЛКМ - озвучить слово
        window.addEventListener('click', (e) => {
            if (!this.isPointerLocked) return;
            
            console.log('👁️ LMB Click - targetedCard:', this.targetedCard ? this.targetedCard.dataset.word : 'null');
            
            if (this.targetedCard) {
                const word = this.targetedCard.dataset.word;
                this.speakWord(word);
                
                // Визуальный фидбек
                this.targetedCard.classList.add('room-card--clicked');
                setTimeout(() => {
                    this.targetedCard?.classList.remove('room-card--clicked');
                }, 200);
                
                console.log(`🔊 Speaking: "${word}"`);
            }
        });
        
        // ПКМ - показать/скрыть перевод
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!this.isPointerLocked) return;
            
            console.log('👁️ RMB Click - targetedCard:', this.targetedCard ? this.targetedCard.dataset.word : 'null');
            
            if (this.targetedCard) {
                this.toggleCardTranslation(this.targetedCard);
            }
        });
    },
    
    /**
     * 🎯 Raycast каждый кадр - находит карточку под прицелом
     */
    updateRaycast() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;
        
        // Центр экрана
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // 🐛 DEBUG: Логирование каждую секунду
        const now = Date.now();
        const shouldLog = (now - this.lastRaycastLog) > 1000;
        if (shouldLog) {
            this.lastRaycastLog = now;
            console.log(`🎯 Raycast check at (${Math.round(centerX)}, ${Math.round(centerY)})`);
        }
        
        // Получаем все элементы под курсором
        const elementsUnderCrosshair = document.elementsFromPoint(centerX, centerY);
        
        if (shouldLog) {
            console.log(`   Found ${elementsUnderCrosshair.length} elements:`, 
                elementsUnderCrosshair.map(el => el.className || el.tagName).slice(0, 5));
        }
        
        // Ищем первую карточку
        const targetCard = elementsUnderCrosshair.find(el => 
            el.classList.contains('room') && 
            el.style.visibility !== 'hidden'
        );
        
        if (shouldLog && targetCard) {
            console.log(`   🎯 Found .room: "${targetCard.dataset.word}"`);
        }
        
        // Проверяем расстояние
        if (targetCard) {
            const cardPositionPositive = parseFloat(targetCard.dataset.position || 0);
            const cardZ = -cardPositionPositive;
            const distance = Math.abs(cardZ - this.z);
            
            if (shouldLog) {
                console.log(`   Distance: ${Math.round(distance)}px (max: ${this.rayCastDistance}px)`);
            }
            
            if (distance > this.rayCastDistance) {
                // Слишком далеко
                if (shouldLog) {
                    console.log(`   ❌ Too far away!`);
                }
                if (this.targetedCard) {
                    this.targetedCard.classList.remove('room-card--targeted');
                    this.targetedCard = null;
                    crosshair.classList.remove('crosshair--targeting');
                }
                return;
            }
        }
        
        // Обновляем targetedCard
        if (targetCard !== this.targetedCard) {
            if (this.targetedCard) {
                this.targetedCard.classList.remove('room-card--targeted');
            }
            
            if (targetCard) {
                const cardPositionPositive = parseFloat(targetCard.dataset.position || 0);
                const cardZ = -cardPositionPositive;
                const distance = Math.abs(cardZ - this.z);
                
                targetCard.classList.add('room-card--targeted');
                crosshair.classList.add('crosshair--targeting');
                console.log(`🎯 Targeting: "${targetCard.dataset.word}" (${Math.round(distance)}px away)`);
            } else {
                crosshair.classList.remove('crosshair--targeting');
                if (shouldLog) {
                    console.log(`   ❌ No card under crosshair`);
                }
            }
            
            this.targetedCard = targetCard;
        }
    },
    
    /**
     * 🔊 Озвучка слова (без звука клика)
     */
    speakWord(text) {
        // Останавливаем предыдущее воспроизведение
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        speechSynthesis.speak(utterance);
    },
    
    /**
     * 🔄 Переключение перевода карточки
     */
    toggleCardTranslation(card) {
        const currentState = card.dataset.state || 'example';
        const exampleEl = card.querySelector('.room-example');
        const translationEl = card.querySelector('.room-translation');
        
        if (currentState === 'example') {
            if (exampleEl) exampleEl.style.display = 'none';
            if (translationEl) translationEl.style.display = 'block';
            card.dataset.state = 'translation';
            console.log(`📖 Showing translation for "${card.dataset.word}"`);
        } else {
            if (exampleEl) exampleEl.style.display = 'block';
            if (translationEl) translationEl.style.display = 'none';
            card.dataset.state = 'example';
            console.log(`📝 Showing example for "${card.dataset.word}"`);
        }
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
            
            this.yaw += e.movementX * this.mouseSensitivity;
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
            this.updateRaycast();         // 🎯 ДОБАВЛЕНО
            this.updateActiveRooms();
            this.updateProgress();
            this.updateWordCounter();
            
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    },
    
    updateMovement() {
        // === ГОРИЗОНТАЛЬНОЕ ДВИЖЕНИЕ (X, Z) ===
        let inputX = 0;
        let inputZ = 0;
        
        if (this.keys.forward) inputZ += 1;
        if (this.keys.backward) inputZ -= 1;
        if (this.keys.left) inputX -= 1;
        if (this.keys.right) inputX += 1;
        
        const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
        if (length > 0) {
            inputX /= length;
            inputZ /= length;
        }
        
        const sin = Math.sin(this.yaw);
        const cos = Math.cos(this.yaw);
        
        const baseSpeed = this.speed * (this.keys.sprint ? this.sprintMultiplier : 1);
        
        const targetVelocityX = (inputZ * sin + inputX * cos) * baseSpeed;
        const targetVelocityZ = -(inputZ * cos - inputX * sin) * baseSpeed;
        
        if (inputX !== 0 || inputZ !== 0) {
            this.velocity.x += (targetVelocityX - this.velocity.x) * this.acceleration;
            this.velocity.z += (targetVelocityZ - this.velocity.z) * this.acceleration;
        } else {
            this.velocity.x *= (1 - this.deceleration);
            this.velocity.z *= (1 - this.deceleration);
            
            if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
            if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0;
        }
        
        const oldZ = this.z;
        
        this.x += this.velocity.x;
        this.z += this.velocity.z;
        
        if (Math.abs(this.z - oldZ) > 0.1 && Math.floor(this.z / 100) !== Math.floor(oldZ / 100)) {
            const nearestCardIndex = Math.max(0, Math.round(Math.abs(this.z) / CONFIG.cards.spacing));
            const nearestCardZ = -nearestCardIndex * CONFIG.cards.spacing;
            const distanceToNearest = nearestCardZ - this.z;
            
            console.log(`🚶 Camera Z=${Math.round(this.z)}px | Card #${nearestCardIndex} at ${nearestCardZ}px (${Math.round(Math.abs(distanceToNearest))}px away)`);
        }
        
        // === ВЕРТИКАЛЬНОЕ ДВИЖЕНИЕ (Y) - ГРАВИТАЦИЯ ===
        this.velocity.y -= this.gravity;
        
        if (this.velocity.y < -this.terminalVelocity) {
            this.velocity.y = -this.terminalVelocity;
        }
        
        this.y += this.velocity.y;
        
        if (this.y <= this.groundLevel) {
            this.y = this.groundLevel;
            this.velocity.y = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        
        // === ОГРАНИЧЕНИЯ ПО Z ===
        if (this.z < this.minZ) {
            this.z = this.minZ;
            this.velocity.z = 0;
            console.log(`⚠️ Reached minimum boundary: Z=${this.minZ}px`);
        }
        if (this.z > this.maxZ) {
            this.z = this.maxZ;
            this.velocity.z = 0;
            console.log(`⚠️ Reached maximum boundary: Z=${this.maxZ}px`);
        }
        
        // === ОГРАНИЧЕНИЯ ПО X ===
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
                this.yaw += deltaX * 0.01;
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
        
        if (this.roomsCache.length > 0) {
            const firstRoom = this.roomsCache[0];
            const lastRoom = this.roomsCache[this.roomsCache.length - 1];
            console.log(`📦 First room: "${firstRoom.dataset.word}" at position=${firstRoom.dataset.position}`);
            console.log(`📦 Last room: "${lastRoom.dataset.word}" at position=${lastRoom.dataset.position}`);
        }
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
        const firstCardWorldZ = -CONFIG.cards.spacing;
        const safeViewDistance = 1500;
        const startZ = firstCardWorldZ + safeViewDistance;
        
        this.animateTo(startZ, 1000);
        this.x = 0;
        this.y = this.groundLevel;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        console.log('⏪ Jump to start');
    },
    
    jumpToEnd() {
        const lastCardZ = -CONFIG.cards.spacing * this.words.length;
        this.animateTo(lastCardZ, 1000);
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
            
            if (this.z < this.minZ) this.z = this.minZ;
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
            
            const visibilityThreshold = this.roomSpacing * 3;
            
            this.roomsCache.forEach(room => {
                const roomPositionPositive = parseFloat(room.dataset.position || 0);
                const roomZ = -roomPositionPositive;
                const distance = Math.abs(roomZ - this.z);
                
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
        if (progressBar) {
            const totalDistance = this.maxZ - this.minZ;
            const currentDistance = this.maxZ - this.z;
            const progress = (currentDistance / totalDistance) * 100;
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
                const nearestCardIndex = Math.max(0, Math.min(
                    this.words.length - 1,
                    Math.round(Math.abs(this.z) / CONFIG.cards.spacing)
                ));
                
                const yawDeg = Math.round((this.yaw * 180 / Math.PI) % 360);
                
                counter.innerHTML = `
                    <div>${nearestCardIndex + 1} / ${this.words.length}</div>
                    <div style="font-size: 10px; color: #666;">
                        Z: ${Math.round(this.z)}px | Yaw: ${yawDeg}° ${this.isOnGround ? '🟢' : '🔴'}
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
    
    Camera.words = words;
    Camera.roomSpacing = config.corridor.roomSpacing;
    Camera.startOffset = 2000;
    Camera.activeThreshold = 400;
    
    Camera.init();
    
    console.log('🎮 Minecraft Camera with gravity configured:', {
        speed: Camera.speed,
        gravity: Camera.gravity,
        groundLevel: Camera.groundLevel,
        words: words.length,
        minZ: Camera.minZ,
        maxZ: Camera.maxZ
    });
}

export { initCamera, Camera };