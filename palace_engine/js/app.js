/* ============================================
   MEMORY PALACE - MAIN APPLICATION (CINEMATIC CAMERA VERSION)
   Описание: Инициализация и загрузка данных с Three.js
   Last update: 2025-12-11 (Cinematic Camera Migration)
   ============================================ */

import * as THREE from 'three';
import { CinematicCamera } from '../CinematicCamera.js';
import { CameraControls } from '../CameraControls.js';
import { CONFIG } from './config.js';
import { buildThreeJSWorld } from './builder.js';
// import { createCardTexture } not needed since it's used internally in builder.js
import { GameLoop } from './GameLoop.js';
import { DebugPanel } from './DebugPanel.js';

// 🎮 ЭКСПОРТ Camera для совместимости (временно)
window.Camera = {}; // Заглушка для совместимости

const App = {
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // ⚙️ 1. Initialize GameLoop FIRST
            console.log('⚙️ Initializing GameLoop...');
            const gameLoop = new GameLoop({
                targetFPS: 60,
                debug: true,
                maxDeltaCap: 250
            });
            
            // 🎮 2. Initialize Debug Panel
            const debugPanel = new DebugPanel(gameLoop);
            console.log('✅ GameLoop and DebugPanel ready');
            
            // 📖 3. Read lesson ID from URL (?lesson=263)
            const params = new URLSearchParams(window.location.search);
            const lessonId = params.get('lesson') || '263';
            
            console.log(`🎯 Loading lesson: ${lessonId}`);
            
            // 📦 4. Load JSON
            const response = await fetch(`../data/${lessonId}.json`);
            
            if (!response.ok) {
                throw new Error(`Lesson ${lessonId} not found`);
            }
            
            const data = await response.json();
            console.log('📦 Data loaded:', data);
            
            // 📚 5. Extract words
            let words = [];
            
            if (data.content && data.content.vocabulary && data.content.vocabulary.words) {
                words = data.content.vocabulary.words;
            }
            
            if (words.length === 0) {
                throw new Error('No words in this lesson');
            }
            
            console.log(`📚 Words found: ${words.length}`);
            
            // 🎨 6. Setup Three.js scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x1a1a2e); // Dark blue background
            
            // 📹 7. Create Three.js Perspective Camera
            const camera = new THREE.PerspectiveCamera(
                35, // FOV (cinematic)
                window.innerWidth / window.innerHeight, // Aspect ratio
                0.1, // Near plane
                1000 // Far plane
            );
            camera.position.set(0, 2, 5); // Start position
            
            // 🎨 8. Create WebGL Renderer
            const renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                preserveDrawingBuffer: true // For screenshots if needed
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for performance
            
            // Replace #world container with canvas
            const worldContainer = document.getElementById('world');
            if (!worldContainer) {
                throw new Error('#world container not found in HTML');
            }
            
            // Clear the container and add the renderer
            worldContainer.innerHTML = '';
            worldContainer.appendChild(renderer.domElement);
            
            // 🌟 9. Add lighting to the scene
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(5, 10, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            
            // Spotlight for focused cards
            const spotlight = new THREE.SpotLight(0xffffff, 1);
            spotlight.position.set(0, 10, 0);
            spotlight.angle = Math.PI / 6;
            spotlight.penumbra = 0.2;
            spotlight.decay = 2;
            spotlight.distance = 20;
            spotlight.castShadow = true;
            scene.add(spotlight);
            
            // 🏛️ 10. Build Three.js world with cards
            const cards = buildThreeJSWorld(words, scene);
            console.log(`🏛️ Created ${cards.length} Three.js cards`);
            
            // 📹 11. Initialize Cinematic Camera
            const cinematicCamera = new CinematicCamera(scene, camera, cards);
            const controls = new CameraControls(cinematicCamera, renderer.domElement);
            
            // 🔢 12. Update word counter
            const counter = document.getElementById('word-counter');
            if (counter) {
                counter.innerHTML = `<div>0 / ${words.length}</div><div style="font-size:10px;color:#666">Cinematic Mode</div>`;
            }
            
            // 🕹️ 13. Setup click handler for quiz
            setupQuizInteraction(renderer, camera, scene, cards, words);
            
            // 🌀 14. Animation loop
            const clock = new THREE.Clock();
            
            function animate() {
                requestAnimationFrame(animate);
                
                const delta = clock.getDelta();
                const elapsedTime = clock.getElapsedTime();
                
                // Update cinematic camera
                cinematicCamera.update(delta);
                
                // Render the scene
                renderer.render(scene, camera);
            }
            
            animate();
            console.log('🎬 Cinematic Camera system activated');
            
            // ▶️ 15. START GAMELOOP (for other systems)
            gameLoop.start();
            console.log('▶️ GameLoop started');
            
            // 📱 16. Handle window resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
            
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.log(`✅ Cinematic App initialized with ${words.length} words`);
            console.log(`🎮 Cinematic Controls: WASD + Mouse + Click (quiz)`);
            console.log(`⚙️ Press 'G' to toggle GameLoop debug panel`);
            
        } catch (error) {
            console.error('❌ Cinematic initialization failed:', error);
            
            if (loader) {
                loader.style.display = 'none';
            }
            
            showError(`Cinematic Error: ${error.message}`);
        }
    }
};

function setupQuizInteraction(renderer, camera, scene, cards, words) {
    // Create raycaster for mouse interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Add click event listener to the renderer
    renderer.domElement.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(cards);
        
        if (intersects.length > 0) {
            const clickedCard = intersects[0].object;
            // Show quiz for the clicked card
            showCardQuiz(clickedCard, words);
        }
    });
}

function showCardQuiz(card, words) {
    // Get the word data from the card's userData
    const wordIndex = card.userData.index;
    const wordData = words[wordIndex];
    
    if (!wordData) {
        console.error('Word data not found for card index:', wordIndex);
        return;
    }
    
    // Create quiz overlay similar to the old system
    const quizOverlay = document.createElement('div');
    quizOverlay.className = 'quiz-overlay';
    quizOverlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(30, 30, 46, 0.95);
        border: 2px solid #FFD60A;
        border-radius: 16px;
        padding: 30px;
        z-index: 10000;
        min-width: 400px;
        box-shadow: 0 0 30px rgba(255, 214, 10, 0.3);
        color: white;
        font-family: Arial, sans-serif;
    `;
    
    // Create quiz content
    quizOverlay.innerHTML = `
        <div style="margin-bottom: 20px; text-align: center;">
            <h2 style="margin: 0; color: #FFD60A; font-size: 24px;">${wordData.en}</h2>
            <p style="margin: 10px 0; color: #ccc; font-size: 16px;">${wordData.transcription || ''}</p>
        </div>
        <div style="margin-bottom: 20px; text-align: center; color: #ccc; font-size: 16px;">
            ${wordData.example || ''}
        </div>
        <input type="text" id="quiz-input" placeholder="Введите перевод..." 
               style="width: 100%; padding: 12px; font-size: 16px; border-radius: 8px; border: 1px solid #666; background: #2a2a3e; color: white; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between;">
            <button id="quiz-check-btn" style="padding: 10px 20px; background: #FFD60A; color: #1a1a2e; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Проверить</button>
            <button id="quiz-close-btn" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer;">Закрыть</button>
        </div>
        <div id="quiz-result" style="margin-top: 15px; text-align: center; min-height: 24px;"></div>
    `;
    
    document.body.appendChild(quizOverlay);
    
    // Handle quiz input
    const input = document.getElementById('quiz-input');
    const checkBtn = document.getElementById('quiz-check-btn');
    const closeBtn = document.getElementById('quiz-close-btn');
    const resultDiv = document.getElementById('quiz-result');
    
    input.focus();
    
    // Check answer function
    const checkAnswer = () => {
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = wordData.ru.toLowerCase();
        
        if (userAnswer === correctAnswer) {
            resultDiv.innerHTML = '<span style="color: #4ade80;">✅ Правильно!</span>';
            setTimeout(() => quizOverlay.remove(), 1500);
        } else {
            resultDiv.innerHTML = `<span style="color: #f87171;">❌ Неправильно. Правильный ответ: ${wordData.ru}</span>`;
        }
    };
    
    // Event listeners
    checkBtn.addEventListener('click', checkAnswer);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    closeBtn.addEventListener('click', () => {
        quizOverlay.remove();
    });
}

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