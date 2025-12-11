/* ============================================
   MEMORY PALACE - MAIN APPLICATION
   Описание: Инициализация с поддержкой CSS и Three.js режимов
   Last update: 2025-12-11 (Hybrid camera system)
   ============================================ */

import { CONFIG } from './config.js';
import { GameLoop } from './GameLoop.js';
import { DebugPanel } from './DebugPanel.js';

// === CSS MODE IMPORTS ===
import { buildWorld } from './builder.js';
import { initCamera, Camera } from './camera.js';

// === THREE.JS MODE IMPORTS ===
import * as THREE from 'three';
import { buildThreeJSWorld, createThreeJSFloor, createThreeJSWalls } from './builder-threejs.js';
import { CinematicCamera } from '../CinematicCamera.js';
import { CameraControls } from '../CameraControls.js';

// 🔧 РЕЖИМ РАБОТЫ (можно переключать)
const USE_THREEJS = false; // ← Измени на true для Three.js

// Экспорт камеры в window (для builder.js)
window.Camera = Camera;

const App = {
    // Глобальные переменные
    scene: null,
    camera: null,
    renderer: null,
    cards: null,
    cinematicCamera: null,
    controls: null,
    
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // 1. Initialize GameLoop
            console.log('⚙️ Initializing GameLoop...');
            const gameLoop = new GameLoop({
                targetFPS: 60,
                debug: true,
                maxDeltaCap: 250
            });
            
            // 2. Initialize Debug Panel
            const debugPanel = new DebugPanel(gameLoop);
            console.log('✅ GameLoop and DebugPanel ready');
            
            // 3. Read lesson ID from URL
            const params = new URLSearchParams(window.location.search);
            const lessonId = params.get('lesson') || '263';
            
            console.log(`🎯 Loading lesson: ${lessonId}`);
            
            // 4. Load JSON
            const response = await fetch(`../data/${lessonId}.json`);
            
            if (!response.ok) {
                throw new Error(`Lesson ${lessonId} not found`);
            }
            
            const data = await response.json();
            console.log('📦 Data loaded:', data);
            
            // 5. Extract words
            let words = [];
            
            if (data.content?.vocabulary?.words) {
                words = data.content.vocabulary.words;
            }
            
            if (words.length === 0) {
                throw new Error('No words in this lesson');
            }
            
            console.log(`📚 Words found: ${words.length}`);
            
            // === РАЗВИЛКА: CSS или Three.js ===
            if (USE_THREEJS) {
                await this.initThreeJS(words, gameLoop);
            } else {
                await this.initCSS(words, gameLoop);
            }
            
            // Update word counter
            const counter = document.getElementById('word-counter');
            if (counter) {
                counter.textContent = `0 / ${words.length}`;
            }
            
            // Start GameLoop
            gameLoop.start();
            console.log('▶️ GameLoop started');
            
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.log(`✅ App initialized with ${words.length} words`);
            console.log(`🎮 Mode: ${USE_THREEJS ? 'Three.js' : 'CSS 3D'}`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            
            if (loader) {
                loader.style.display = 'none';
            }
            
            showError(`Ошибка: ${error.message}`);
        }
    },
    
    /**
     * Инициализация CSS режима (старая система)
     */
    async initCSS(words, gameLoop) {
        console.log('🎨 Initializing CSS 3D mode...');
        
        // Build HTML corridor
        const corridor = buildWorld(words);
        
        // Add to #world container
        const world = document.getElementById('world');
        if (!world) {
            throw new Error('#world container not found');
        }
        
        world.appendChild(corridor);
        console.log('🏛️ Corridor appended to #world');
        
        // Initialize WASD Camera
        initCamera(words, CONFIG, gameLoop);
        console.log('📹 WASD Camera initialized');
        
        console.log('🎮 Controls: WASD + Mouse + LMB (quiz) + RMB (speak)');
        console.log('⚙️ Press "G" to toggle debug panel');
    },
    
    /**
     * Инициализация Three.js режима (новая система)
     */
    async initThreeJS(words, gameLoop) {
        console.log('🎬 Initializing Three.js mode...');
        
        // 1. Создать сцену
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
        
        // 2. Создать камеру
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 15);
        
        // 3. Создать рендерер
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // 4. Добавить canvas в #world
        const worldContainer = document.getElementById('world');
        if (!worldContainer) {
            throw new Error('#world container not found');
        }
        
        worldContainer.innerHTML = ''; // Очистить
        worldContainer.appendChild(this.renderer.domElement);
        console.log('🖼️ Three.js canvas added to #world');
        
        // 5. Освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        console.log('💡 Lighting added');
        
        // 6. Создать пол и стены
        createThreeJSFloor(this.scene);
        createThreeJSWalls(this.scene);
        
        // 7. Создать карточки
        this.cards = await buildThreeJSWorld(words, this.scene);
        console.log(`🎴 ${this.cards.length} cards created`);
        
        // 8. Инициализировать Cinematic Camera
        this.cinematicCamera = new CinematicCamera(this.scene, this.camera, this.cards);
        this.controls = new CameraControls(this.cinematicCamera);
        
        console.log('🎥 Cinematic Camera initialized');
        
        // 9. Setup raycasting для quiz
        this.setupQuizInteraction(words);
        
        // 10. Animation loop
        const clock = new THREE.Clock();
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            const deltaTime = clock.getDelta();
            
            // Update camera
            this.cinematicCamera.update(deltaTime);
            
            // Render
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        
        // 11. Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('🎮 Controls: W/S or ↑/↓ - Move, Space - Next waypoint, R - Toggle rail, Click - Focus');
    },
    
    /**
     * Raycasting для клика по карточкам
     */
    setupQuizInteraction(words) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            // ИСПРАВЛЕННАЯ ФОРМУЛА (БАГ #6)
            const rect = this.renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Raycasting
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.cards);
            
            if (intersects.length > 0) {
                const clickedCard = intersects[0].object;
                const wordData = clickedCard.userData;
                
                console.log('🎯 Clicked card:', wordData.word);
                
                // Показать quiz overlay
                this.showQuizOverlay(wordData);
                
                // Отключить управление камерой (ИСПРАВЛЕНИЕ БАГА #6)
                if (this.controls) {
                    this.controls.enabled = false;
                }
            }
        });
        
        console.log('✅ Raycasting setup complete');
    },
    
    /**
     * Показать quiz overlay поверх canvas
     */
    showQuizOverlay(wordData) {
        // Создать overlay
        const overlay = document.createElement('div');
        overlay.id = 'quiz-overlay-threejs';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Создать карточку quiz
        const quizCard = document.createElement('div');
        quizCard.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            border: 3px solid #FFD60A;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        `;
        
        quizCard.innerHTML = `
            <div style="text-align: center; color: white;">
                <h1 style="font-size: 48px; margin: 0 0 20px 0;">${wordData.word}</h1>
                <p style="font-size: 24px; color: rgba(255, 255, 255, 0.6); margin: 0 0 30px 0;">
                    ${wordData.transcription || `/${wordData.word}/`}
                </p>
                
                ${wordData.example ? `
                    <p style="font-size: 18px; font-style: italic; color: rgba(255, 255, 255, 0.5); margin-bottom: 30px;">
                        "${wordData.example}"
                    </p>
                ` : ''}
                
                <input 
                    type="text" 
                    id="quiz-input-threejs" 
                    placeholder="Введите перевод..."
                    style="
                        width: 100%;
                        padding: 15px;
                        font-size: 20px;
                        border: 2px solid #0f4c75;
                        border-radius: 10px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        margin-bottom: 20px;
                    "
                    autocomplete="off"
                />
                
                <div id="quiz-hint-threejs" style="
                    color: #FFD60A;
                    font-size: 16px;
                    margin-bottom: 20px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="check-btn-threejs" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: #0f4c75;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Проверить</button>
                    
                    <button id="close-btn-threejs" style="
                        padding: 15px 30px;
                        font-size: 18px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        border-radius: 10px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">Закрыть (Esc)</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(quizCard);
        document.body.appendChild(overlay);
        
        // Автофокус на input
        const input = document.getElementById('quiz-input-threejs');
        input.focus();
        
        // Обработчик проверки ответа
        const checkBtn = document.getElementById('check-btn-threejs');
        const hint = document.getElementById('quiz-hint-threejs');
        
        const checkAnswer = () => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = wordData.translation.toLowerCase();
            
            if (userAnswer === correctAnswer) {
                hint.style.display = 'block';
                hint.style.color = '#4CAF50';
                hint.textContent = '✅ Правильно!';
                
                setTimeout(() => {
                    closeOverlay();
                }, 1500);
            } else {
                hint.style.display = 'block';
                hint.style.color = '#f44336';
                hint.textContent = `❌ Неправильно. Правильный ответ: ${wordData.translation}`;
            }
        };
        
        checkBtn.onclick = checkAnswer;
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        
        // Обработчик закрытия (ИСПРАВЛЕНИЕ БАГА #6)
        const closeBtn = document.getElementById('close-btn-threejs');
        const closeOverlay = () => {
            overlay.remove();
            
            // Восстановить управление камерой
            if (this.controls) {
                this.controls.enabled = true;
            }
        };
        
        closeBtn.onclick = closeOverlay;
        
        // Закрытие по Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeOverlay();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
};



function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-msg';
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px 40px;
        background: rgba(255, 50, 50, 0.9);
        color: white;
        border-radius: 12px;
        font-size: 18px;
        border: 2px solid rgba(255, 100, 100, 0.5);
        z-index: 10000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

// Start on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

export default App;