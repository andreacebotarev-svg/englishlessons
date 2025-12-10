/* ============================================
   MINECRAFT-STYLE CAMERA CONTROLLER
   ============================================ */

import { CONFIG } from './config.js';
import { QuizManager, SoundEffects } from './quiz-manager.js';

export const CameraState = {
    mode: 'IDLE',
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
        this.setupKeyboard();
        this.setupMouse();
        this.setupRaycast();
        this.setupTouchControls();
        this.startGameLoop();
        setTimeout(() => this.cacheRooms(), 100);
        console.log('✅ Camera ready');
    },
    
    setupRaycast() {
        this.quizManager = new QuizManager(this);
        let rightClickCount = 0;
        let rightClickTimer = null;
        
        // ✅ ЕДИНЫЙ ОБРАБОТЧИК МЫШИ (LMB + RMB)
        window.addEventListener('mousedown', (e) => {
            // ═══════════════════════════════════════
            // ЛКМ (button === 0) → открыть quiz
            // ═══════════════════════════════════════
            if (e.button === 0 && this.isPointerLocked && this.targetedCard) {
                const state = this.targetedCard.dataset.state || 'idle';
                if (state === 'idle') {
                    this.quizManager.initQuiz(this.targetedCard);
                    SoundEffects.playClick();
                }
            }
            
            // ═══════════════════════════════════════
            // ПКМ (button === 2) → озвучка/перевод
            // ✅ РАБОТАЕТ В POINTER LOCK!
            // ═══════════════════════════════════════
            if (e.button === 2) {
                console.log('═══════════════════════════════');
                console.log('🖱️ RMB pressed (mousedown)');
                console.log('  Mode:', CameraState.mode);
                console.log('  Pointer locked:', this.isPointerLocked);
                
                // Определяем карточку
                let targetCard = null;
                if (CameraState.mode === 'QUIZ_MODE') {
                    targetCard = CameraState.activeCard;
                    console.log('  → QUIZ_MODE, using activeCard');
                } else {
                    targetCard = this.targetedCard;
                    console.log('  → IDLE, using targetedCard');
                }
                
                if (!targetCard) {
                    console.warn('  ❌ No card found!');
                    console.log('  targetedCard:', this.targetedCard);
                    console.log('  activeCard:', CameraState.activeCard);
                    console.log('═══════════════════════════════');
                    return;
                }
                
                console.log('  ✅ Card:', targetCard.dataset.word);
                console.log('  Translation:', targetCard.dataset.translation);
                
                rightClickCount++;
                console.log('  → Clicks:', rightClickCount);
                
                if (rightClickCount === 1) {
                    // ПКМ × 1 → озвучка
                    const word = targetCard.dataset.word;
                    console.log('  🔊 Speaking:', word);
                    
                    try {
                        this.quizManager.speakWord(word);
                        console.log('  ✅ speakWord() success');
                    } catch (err) {
                        console.error('  ❌ speakWord() error:', err);
                    }
                    
                    this.animateClick(targetCard);
                    this.showDoubleClickHint();
                    
                    clearTimeout(rightClickTimer);
                    rightClickTimer = setTimeout(() => {
                        rightClickCount = 0;
                        this.hideDoubleClickHint();
                        console.log('  ⏱️ Timer reset');
                    }, 500);
                    
                } else if (rightClickCount === 2) {
                    // ПКМ × 2 → перевод
                    clearTimeout(rightClickTimer);
                    rightClickCount = 0;
                    console.log('  👁️ Revealing translation');
                    
                    try {
                        this.quizManager.revealTranslation(targetCard);
                        console.log('  ✅ revealTranslation() success');
                    } catch (err) {
                        console.error('  ❌ revealTranslation() error:', err);
                    }
                    
                    this.hideDoubleClickHint();
                }
                
                console.log('═══════════════════════════════');
            }
        });
        
        // ✅ Блокировка стандартного контекстного меню
        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    },
    
    updateRaycast() {
        const crosshair = document.querySelector('.crosshair');
        if (!crosshair) return;
        if (CameraState.mode === 'QUIZ_MODE' && CameraState.activeCard) {
            const distance = this.getDistanceToCard(CameraState.activeCard);
            if (distance > 2500) {
                console.log(`⚠️ Too far, closing quiz`);
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
    
    showDoubleClickHint() {
        let hint = document.getElementById('double-click-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.id = 'double-click-hint';
            hint.textContent = '👉 RMB again to reveal';
            hint.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(255,214,10,0.9);color:black;padding:10px 20px;border-radius:8px;font-weight:bold;font-size:14px;z-index:9999;animation:fadeInUp 0.2s;`;
            document.body.appendChild(hint);
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
            console.log('🔒 Pointer lock changed:', this.isPointerLocked);
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
            this.updateActiveRooms();
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
        document.documentElement.style.setProperty('--fov', `${CONFIG.camera.fov}px`);
        corridor.style.transform = `translateZ(${CONFIG.camera.fov}px) rotateX(${this.pitch}rad) rotateY(${this.yaw}rad) translate3d(${-this.x}px, ${-this.y}px, ${-this.z}px)`;
    },
    
    updateWASDHints() {
        [['w', this.keys.forward], ['a', this.keys.left], ['s', this.keys.backward], ['d', this.keys.right]].forEach(([key, active]) => {
            const el = document.querySelector(`.wasd-key[data-key="${key}"]`);
            if (el) el.classList.toggle('wasd-key--active', active);
        });
    },
    
    setupTouchControls() {
        let touchStartY = 0, touchStartX = 0, isSwiping = false;
        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('.room-card')) return;
            touchStartY = e.touches[0].clientY; touchStartX = e.touches[0].clientX; isSwiping = true;
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            if (e.cancelable) e.preventDefault();
            const deltaY = touchStartY - e.touches[0].clientY, deltaX = touchStartX - e.touches[0].clientX;
            if (Math.abs(deltaY) > 5) { this.velocity.z += (deltaY > 0 ? 1 : -1) * this.speed * 0.1; touchStartY = e.touches[0].clientY; }
            if (Math.abs(deltaX) > 5) { this.yaw += deltaX * 0.01; touchStartX = e.touches[0].clientX; }
        }, { passive: false });
        window.addEventListener('touchend', () => { isSwiping = false; }, { passive: true });
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
        this.roomsCache.forEach(room => {
            const roomZ = -parseFloat(room.dataset.position || 0), distance = Math.abs(roomZ - this.z);
            if (distance > visibilityThreshold) { room.style.visibility = 'hidden'; } else { room.style.visibility = 'visible'; room.classList.toggle('room--active', distance < this.activeThreshold); }
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