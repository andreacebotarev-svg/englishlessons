/* ============================================
   MINECRAFT-STYLE CAMERA CONTROLLER
   ============================================ */

import { CONFIG } from './config.js';
import { QuizManager, SoundEffects } from './quiz-manager.js';

// ════════════════════════════════════════════════════════════
// 📊 STATE MACHINE:
// IDLE → (LMB) → QUIZ_MODE → (correct) → TRANSITION_MODE → (1.5s) → IDLE
//                     ↑ WASD blocked           ↑ WASD allowed!
// ════════════════════════════════════════════════════════════
export const CameraState = {
    mode: 'IDLE',  // IDLE | QUIZ_MODE | TRANSITION_MODE
    activeInput: null,
    activeCard: null
};

const Camera = {
    x: 0, y: 150, z: 0,
    yaw: 0, pitch: 0,
    velocity: { x: 0, y: 0, z: 0 },
    speed: 8,
    sprintMultiplier: 1.5,
    acceleration: 0.5,
    deceleration: 0.3,
    mouseSensitivity: 0.002,
    gravity: 0.5,
    groundLevel: 150,
    terminalVelocity: 20,
    isOnGround: true,
    minZ: 0, maxZ: 0,
    words: [],
    roomSpacing: 800,
    startOffset: 2000,
    activeThreshold: 400,
    targetedCard: null,
    rayCastDistance: 3000,
    quizManager: null,
    keys: { forward: false, backward: false, left: false, right: false, sprint: false },
    isPointerLocked: false,
    roomsCache: null,
    roomUpdateCounter: 0,
    isTouchDevice: false,
    
    init() {
        console.log('🎮 Camera init...');
        this.speed = CONFIG.camera.speed;
        this.sprintMultiplier = CONFIG.camera.sprintMultiplier;
        this.acceleration = CONFIG.camera.acceleration;
        this.deceleration = CONFIG.camera.deceleration;
        this.mouseSensitivity = CONFIG.camera.mouseSensitivity;
        this.gravity = CONFIG.camera.gravity;
        this.groundLevel = CONFIG.camera.groundLevel;
        this.terminalVelocity = CONFIG.camera.terminalVelocity;
        this.y = this.groundLevel;
        const firstCardWorldZ = -CONFIG.cards.spacing;
        const safeViewDistance = 1500;
        this.z = firstCardWorldZ + safeViewDistance;
        this.minZ = -(CONFIG.cards.spacing * this.words.length) - 500;
        this.maxZ = this.z + 300;
        
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        this.setupKeyboard();
        this.setupMouse();
        this.setupRaycast();
        this.setupTouchControls();
        
        if (this.isTouchDevice) {
            this.setupDPadEventListener();  // ✅ Listen to mobile-dpad.js events
            this.setupMobileCardInteractions();
        }
        
        this.startGameLoop();
        setTimeout(() => this.cacheRooms(), 100);
        console.log('✅ Camera ready with', this.isTouchDevice ? 'Mobile D-Pad + Card Interactions' : 'Desktop controls');
    },
    
    // ════════════════════════════════════════════════════════════
    // 📱 D-PAD EVENT LISTENER (from mobile-dpad.js)
    // ════════════════════════════════════════════════════════════
    setupDPadEventListener() {
        console.log('📡 Camera: Setting up D-Pad event listener...');
        
        window.addEventListener('dpad-input', (e) => {
            const { key, pressed } = e.detail;
            
            // Map D-Pad keys to Camera keys
            switch(key) {
                case 'up':
                    this.keys.forward = pressed;
                    break;
                case 'down':
                    this.keys.backward = pressed;
                    break;
                case 'left':
                    this.keys.left = pressed;
                    break;
                case 'right':
                    this.keys.right = pressed;
                    break;
            }
            
            // Update visual hints
            this.updateWASDHints();
            
            console.log(`📡 Camera received: ${key}=${pressed}`);
        });
        
        console.log('✅ D-Pad event listener ready');
    },
    
    setupRaycast() {
        this.quizManager = new QuizManager(this);
        let rightClickCount = 0;
        let rightClickTimer = null;
        
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0 && this.isPointerLocked && this.targetedCard) {
                const state = this.targetedCard.dataset.state || 'idle';
                if (state === 'idle') {
                    this.quizManager.initQuiz(this.targetedCard);
                    SoundEffects.playClick();
                }
            }
            
            if (e.button === 2) {
                let targetCard = null;
                if (CameraState.mode === 'QUIZ_MODE') {
                    targetCard = CameraState.activeCard;
                } else {
                    targetCard = this.targetedCard;
                }
                
                if (!targetCard) return;
                
                rightClickCount++;
                
                if (rightClickCount === 1) {
                    const word = targetCard.dataset.word;
                    this.quizManager.speakWord(word);
                    this.animateClick(targetCard);
                    const currentState = targetCard.dataset.state || 'idle';
                    if (currentState === 'revealed') {
                        this.showDoubleClickHint('hide');
                    } else {
                        this.showDoubleClickHint('reveal');
                    }
                    clearTimeout(rightClickTimer);
                    rightClickTimer = setTimeout(() => {
                        rightClickCount = 0;
                        this.hideDoubleClickHint();
                    }, 500);
                } else if (rightClickCount === 2) {
                    clearTimeout(rightClickTimer);
                    rightClickCount = 0;
                    const currentState = targetCard.dataset.state || 'idle';
                    if (currentState === 'revealed') {
                        console.log('🔒 Hiding translation (toggle)');
                        this.quizManager.hideTranslation(targetCard);
                    } else {
                        console.log('👁️ Revealing translation (toggle)');
                        this.quizManager.revealTranslation(targetCard);
                    }
                    this.hideDoubleClickHint();
                }
            }
        });
        
        window.addEventListener('contextmenu', (e) => { e.preventDefault(); });
    },
    
    // ════════════════════════════════════════════════════════════
    // 📱 MOBILE CARD INTERACTIONS (Tap/Long-press/Double-tap)
    // ════════════════════════════════════════════════════════════
    setupMobileCardInteractions() {
        console.log('📱 Setting up mobile card interactions...');
        
        let longPressTimer = null;
        let longPressCard = null;
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        let lastTapTime = 0;
        let lastTapCard = null;
        
        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('#mobile-dpad, .quiz-stats, .wasd-keys, #back-btn')) return;
            
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const card = element?.closest('.room');
            
            if (!card) return;
            
            touchStartTime = Date.now();
            touchStartPos = { x: touch.clientX, y: touch.clientY };
            longPressCard = card;
            
            longPressTimer = setTimeout(() => {
                const distance = this.getDistanceToCard(card);
                const word = card.dataset.word;
                this.quizManager.speakWord(word);
                this.animateClick(card);
                
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                this.showToast(`🔊 Speaking: "${word}"`, 1500);
                console.log(`📱 Long-press: Speaking "${word}" (distance: ${Math.round(distance)}px)`);
                longPressCard = null;
            }, 500);
            
        }, { passive: true });
        
        window.addEventListener('touchend', (e) => {
            clearTimeout(longPressTimer);
            
            if (!longPressCard) return;
            
            const touch = e.changedTouches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const card = element?.closest('.room');
            
            if (!card || card !== longPressCard) {
                longPressCard = null;
                return;
            }
            
            const touchDuration = Date.now() - touchStartTime;
            const touchMoveDistance = Math.sqrt(
                Math.pow(touch.clientX - touchStartPos.x, 2) + 
                Math.pow(touch.clientY - touchStartPos.y, 2)
            );
            
            if (touchMoveDistance > 10 || touchDuration >= 500) {
                longPressCard = null;
                return;
            }
            
            const distance = this.getDistanceToCard(card);
            const now = Date.now();
            const timeSinceLastTap = now - lastTapTime;
            
            // Double-tap
            if (lastTapCard === card && timeSinceLastTap < 300) {
                e.preventDefault();
                
                const currentState = card.dataset.state || 'idle';
                if (currentState === 'revealed') {
                    this.quizManager.hideTranslation(card);
                    this.showToast('🔒 Translation hidden', 1500);
                } else {
                    this.quizManager.revealTranslation(card);
                    this.showToast('👁️ Translation revealed!', 1500);
                }
                
                console.log(`📱 Double-tap: Toggle translation (distance: ${Math.round(distance)}px)`);
                
                lastTapTime = 0;
                lastTapCard = null;
                longPressCard = null;
                return;
            }
            
            // Single tap
            const state = card.dataset.state || 'idle';
            if (state === 'idle') {
                if (distance > 2000) {
                    this.showToast(`⚠️ Too far! Distance: ${Math.round(distance)}px\n🚶 Move closer using D-Pad`, 2500);
                    console.log(`📱 Tap rejected: Too far (${Math.round(distance)}px)`);
                } else {
                    e.preventDefault();
                    this.quizManager.initQuiz(card);
                    SoundEffects.playClick();
                    console.log(`📱 Tap: Open quiz for "${card.dataset.word}" (distance: ${Math.round(distance)}px)`);
                }
            }
            
            lastTapTime = now;
            lastTapCard = card;
            longPressCard = null;
            
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            if (longPressCard) {
                const touch = e.changedTouches[0];
                const moveDistance = Math.sqrt(
                    Math.pow(touch.clientX - touchStartPos.x, 2) + 
                    Math.pow(touch.clientY - touchStartPos.y, 2)
                );
                
                if (moveDistance > 10) {
                    clearTimeout(longPressTimer);
                    longPressCard = null;
                }
            }
        }, { passive: true });
        
        console.log('✅ Mobile card interactions initialized');
    },
    
    showToast(message, duration = 2000) {
        let toast = document.getElementById('mobile-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'mobile-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 200px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 24px;
                border-radius: 24px;
                border: 2px solid rgba(255, 214, 10, 0.5);
                font-size: 14px;
                font-weight: 600;
                z-index: 100000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s;
                text-align: center;
                max-width: 80%;
                white-space: pre-line;
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, duration);
    },
    
    updateRaycast() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;
        if (CameraState.mode === 'QUIZ_MODE' && CameraState.activeCard) {
            const distance = this.getDistanceToCard(CameraState.activeCard);
            if (distance > 2500) {
                this.quizManager.closeQuiz(CameraState.activeCard);
            }
        }
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const elementsUnderCrosshair = document.elementsFromPoint(centerX, centerY);
        let targetCard = elementsUnderCrosshair.find(el => el.classList.contains('room') && el.style.visibility !== 'hidden');
        if (!targetCard) {
            const rooms = Array.from(document.querySelectorAll('.room')).filter(room => room.style.visibility !== 'hidden');
            rooms.forEach(room => {
                const rect = room.getBoundingClientRect();
                if (centerX >= rect.left && centerX <= rect.right && centerY >= rect.top && centerY <= rect.bottom) targetCard = room;
            });
        }
        if (targetCard) {
            const distance = this.getDistanceToCard(targetCard);
            if (distance > this.rayCastDistance) {
                if (this.targetedCard) {
                    this.targetedCard.classList.remove('room-card--targeted');
                    this.targetedCard = null;
                    crosshair.classList.remove('crosshair--targeting');
                }
                return;
            }
        }
        if (targetCard !== this.targetedCard) {
            if (this.targetedCard) this.targetedCard.classList.remove('room-card--targeted');
            if (targetCard) {
                targetCard.classList.add('room-card--targeted');
                crosshair.classList.add('crosshair--targeting');
            } else {
                crosshair.classList.remove('crosshair--targeting');
            }
            this.targetedCard = targetCard;
        }
    },
    
    getDistanceToCard(card) {
        const cardZ = -parseFloat(card.dataset.position || 0);
        return Math.abs(cardZ - this.z);
    },
    
    showDoubleClickHint(action = 'reveal') {
        let hint = document.getElementById('double-click-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'double-click-hint';
            hint.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(255,214,10,0.9);color:black;padding:10px 20px;border-radius:8px;font-weight:bold;font-size:14px;z-index:9999;animation:fadeInUp 0.2s;`;
            document.body.appendChild(hint);
        }
        if (action === 'hide') {
            hint.textContent = '👉 RMB again to hide';
        } else {
            hint.textContent = '👉 RMB again to reveal';
        }
        hint.style.display = 'block';
    },
    
    hideDoubleClickHint() {
        const hint = document.getElementById('double-click-hint');
        if (hint) hint.style.display = 'none';
    },
    
    animateClick(card) {
        card.classList.add('room-card--clicked');
        setTimeout(() => card.classList.remove('room-card--clicked'), 200);
    },
    
    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && CameraState.mode === 'QUIZ_MODE') {
                e.preventDefault();
                if (CameraState.activeCard) this.quizManager.closeQuiz(CameraState.activeCard);
                return;
            }
            
            if (CameraState.mode === 'QUIZ_MODE') return;
            
            switch(e.code) {
                case 'KeyW': case 'ArrowUp': e.preventDefault(); this.keys.forward = true; break;
                case 'KeyS': case 'ArrowDown': e.preventDefault(); this.keys.backward = true; break;
                case 'KeyA': case 'ArrowLeft': e.preventDefault(); this.keys.left = true; break;
                case 'KeyD': case 'ArrowRight': e.preventDefault(); this.keys.right = true; break;
                case 'ShiftLeft': case 'ShiftRight': e.preventDefault(); this.keys.sprint = true; break;
                case 'Space': e.preventDefault(); this.jumpToNextRoom(); break;
                case 'Home': e.preventDefault(); this.jumpToStart(); break;
                case 'End': e.preventDefault(); this.jumpToEnd(); break;
            }
            this.updateWASDHints();
        });
        
        window.addEventListener('keyup', (e) => {
            if (CameraState.mode === 'QUIZ_MODE') return;
            
            switch(e.code) {
                case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
                case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
                case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
                case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
                case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
            }
            this.updateWASDHints();
        });
    },
    
    setupMouse() {
        const scene = document.querySelector('#scene');
        if (!scene) return;
        scene.addEventListener('click', () => { if (!this.isPointerLocked) scene.requestPointerLock(); });
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === scene;
            this.showLockMessage(!this.isPointerLocked);
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
            msg.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:#FFD60A;padding:20px 40px;border-radius:12px;border:2px solid #FFD60A;font-size:18px;font-weight:600;z-index:10000;pointer-events:none;transition:opacity 0.3s;`;
            document.body.appendChild(msg);
        }
        msg.style.opacity = show ? '1' : '0';
    },
    
    startGameLoop() {
        const update = () => {
            this.updateMovement();
            this.applyTransform();
            this.updateRaycast();
            this.roomUpdateCounter++;
            if (this.roomUpdateCounter % 3 === 0) {
                this.updateActiveRooms();
            }
            this.updateProgress();
            this.updateWordCounter();
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    },
    
    updateMovement() {
        let inputX = 0, inputZ = 0;
        if (this.keys.forward) inputZ += 1;
        if (this.keys.backward) inputZ -= 1;
        if (this.keys.left) inputX -= 1;
        if (this.keys.right) inputX += 1;
        const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
        if (length > 0) { inputX /= length; inputZ /= length; }
        const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
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
        this.x += this.velocity.x; this.z += this.velocity.z;
        this.velocity.y -= this.gravity;
        if (this.velocity.y < -this.terminalVelocity) this.velocity.y = -this.terminalVelocity;
        this.y += this.velocity.y;
        if (this.y <= this.groundLevel) { this.y = this.groundLevel; this.velocity.y = 0; this.isOnGround = true; } else { this.isOnGround = false; }
        if (this.z < this.minZ) { this.z = this.minZ; this.velocity.z = 0; }
        if (this.z > this.maxZ) { this.z = this.maxZ; this.velocity.z = 0; }
        const maxX = 2000;
        if (this.x < -maxX) { this.x = -maxX; this.velocity.x = 0; }
        if (this.x > maxX) { this.x = maxX; this.velocity.x = 0; }
    },
    
    applyTransform() {
        const corridor = document.querySelector('#corridor');
        if (!corridor) return;
        
        // ✅ ПРАВИЛЬНАЯ ТРАНСФОРМАЦИЯ (как в Minecraft/FPS):
        corridor.style.transform = `
            translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px)
            rotateY(${-this.yaw}rad)
            rotateX(${-this.pitch}rad)
        `.trim();
        
        // ❌ УБРАНО: translateZ(fov) - создавало вид от 3-го лица
        // document.documentElement.style.setProperty('--fov', `${CONFIG.camera.fov}px`);
    },
    
    updateWASDHints() {
        [['w', this.keys.forward], ['a', this.keys.left], ['s', this.keys.backward], ['d', this.keys.right]].forEach(([key, active]) => {
            const el = document.querySelector(`.wasd-key[data-key="${key}"]`);
            if (el) el.classList.toggle('wasd-key--active', active);
        });
    },
    
    setupTouchControls() {
        const screenWidth = window.innerWidth;
        const cameraZoneStart = screenWidth * 0.4;
        
        let cameraTouchId = null;
        let lastCameraX = 0;
        let lastCameraY = 0;
        
        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('#mobile-dpad, .room-card, .quiz-stats, .wasd-keys')) return;
            
            Array.from(e.changedTouches).forEach(touch => {
                const x = touch.clientX;
                const y = touch.clientY;
                
                if (x >= cameraZoneStart && cameraTouchId === null) {
                    cameraTouchId = touch.identifier;
                    lastCameraX = x;
                    lastCameraY = y;
                    console.log('📱 Camera touch started');
                }
            });
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            if (e.cancelable) e.preventDefault();
            
            Array.from(e.changedTouches).forEach(touch => {
                if (touch.identifier === cameraTouchId) {
                    const deltaX = touch.clientX - lastCameraX;
                    const deltaY = touch.clientY - lastCameraY;
                    
                    this.yaw += deltaX * 0.005;
                    this.pitch -= deltaY * 0.005;
                    this.pitch = Math.max(CONFIG.camera.minPitch, Math.min(CONFIG.camera.maxPitch, this.pitch));
                    
                    lastCameraX = touch.clientX;
                    lastCameraY = touch.clientY;
                }
            });
        }, { passive: false });
        
        window.addEventListener('touchend', (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                if (touch.identifier === cameraTouchId) {
                    cameraTouchId = null;
                    console.log('📱 Camera touch ended');
                }
            });
        }, { passive: true });
        
        console.log('✅ Dual-zone touch controls initialized');
    },
    
    cacheRooms() { this.roomsCache = Array.from(document.querySelectorAll('.room')); },
    
    jumpToNextRoom() {
        if (!CONFIG.corridor.roomBox.enabled) return;
        const { roomDepth } = CONFIG.corridor.roomBox;
        const currentRoom = Math.floor((this.z - 2000) / roomDepth), nextRoom = currentRoom + 1;
        const totalRooms = Math.ceil(this.words.length / CONFIG.corridor.roomBox.wordsPerRoom);
        if (nextRoom < totalRooms) this.animateTo(2000 + (nextRoom * roomDepth), 800);
    },
    
    jumpToStart() { this.animateTo(-CONFIG.cards.spacing + 1500, 1000); this.x = this.y = 0; this.velocity.x = this.velocity.y = this.velocity.z = 0; },
    jumpToEnd() { this.animateTo(-CONFIG.cards.spacing * this.words.length, 1000); },
    
    animateTo(targetZ, duration = 800) {
        const startZ = this.z, distance = targetZ - startZ, startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime, progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            this.z = startZ + (distance * easeProgress);
            if (this.z < this.minZ) this.z = this.minZ;
            if (this.z > this.maxZ) this.z = this.maxZ;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },
    
    updateActiveRooms() {
        if (!this.roomsCache) this.roomsCache = Array.from(document.querySelectorAll('.room'));
        const visibilityThreshold = this.roomSpacing * 3;
        const fovRadians = (CONFIG.camera.fov / 800) * Math.PI;
        const halfFOV = fovRadians / 2;
        this.roomsCache.forEach(room => {
            const roomZ = -parseFloat(room.dataset.position || 0);
            const roomX = parseFloat(room.dataset.x || 0);
            const distance = Math.abs(roomZ - this.z);
            if (distance > visibilityThreshold) {
                room.style.visibility = 'hidden';
                return;
            }
            const dx = roomX - this.x;
            const dz = roomZ - this.z;
            let angleToCard = Math.atan2(dx, -dz);
            let angleDiff = angleToCard - this.yaw;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            const inFrustum = Math.abs(angleDiff) < halfFOV * 1.5;
            if (inFrustum) {
                room.style.visibility = 'visible';
                room.classList.toggle('room--active', distance < this.activeThreshold);
            } else {
                room.style.visibility = 'hidden';
            }
        });
    },
    
    updateProgress() {
        const bar = document.getElementById('progress-bar');
        if (bar) {
            const total = this.maxZ - this.minZ, current = this.maxZ - this.z;
            bar.style.width = `${Math.min(100, Math.max(0, (current / total) * 100))}%`;
        }
    },
    
    updateWordCounter() {
        const counter = document.getElementById('word-counter');
        if (counter && this.words.length > 0) {
            const idx = Math.max(0, Math.min(this.words.length - 1, Math.round(Math.abs(this.z) / CONFIG.cards.spacing)));
            counter.innerHTML = `<div>${idx + 1} / ${this.words.length}</div><div style="font-size:10px;color:#666">State: ${CameraState.mode}</div>`;
        }
    }
};

function initCamera(words, config) {
    if (!words || words.length === 0) return;
    Camera.words = words;
    Camera.roomSpacing = config.corridor.roomSpacing;
    Camera.startOffset = 2000;
    Camera.activeThreshold = 400;
    Camera.init();
}

export { initCamera, Camera };