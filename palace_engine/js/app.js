/* ============================================
   MEMORY PALACE - MAIN APPLICATION
   Описание: Инициализация и загрузка данных
   Last update: 2025-12-11 (GameLoop integration)
   ============================================ */

import { CONFIG } from './config.js';
import { buildWorld } from './builder.js';
import { initCamera, Camera } from './camera.js';
import { GameLoop } from './GameLoop.js';
import { DebugPanel } from './DebugPanel.js';
import { updateViewportHeight } from './scene-depth-calculator.js';
import { ScrollCamera } from './scroll-camera.js';

// 🎮 ЭКСПОРТ Camera в window для builder.js
window.Camera = Camera;

const App = {
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // ⚙️ 1. Initialize GameLoop FIRST
            console.log('⚙️ Initializing GameLoop...');
            const gameLoop = new GameLoop({
                targetFPS: 60,
                debug: true,  // Enable FPS monitoring
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
            
            // 🏛️ 6. ✅ CRITICAL: Calculate scene depth BEFORE building world
            updateViewportHeight(words.length);
            
            // 🏛️ 7. Build world with cards
            const corridor = buildWorld(words);
            
            // Add corridor to #world container
            const world = document.getElementById('world');
            
            if (!world) {
                throw new Error('#world container not found in HTML');
            }
            
            world.appendChild(corridor);
            console.log('🏛️ Corridor appended to #world');
            
            // 🔢 8. Update word counter
            const counter = document.getElementById('word-counter');
            if (counter) {
                counter.textContent = `0 / ${words.length}`;
            }
            
            // 📹 9. ✅ CRITICAL: Initialize Scroll Camera
            const scrollCamera = new ScrollCamera();
            scrollCamera.init();
            
            // 📹 10. Initialize traditional camera (optional - for WASD support)
            initCamera(words, CONFIG, gameLoop);
            console.log('📹 Traditional and scroll cameras initialized');
            
            // ▶️ 11. START GAMELOOP (after everything is ready)
            gameLoop.start();
            console.log('▶️ GameLoop started');
            
            // Hide loader
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.log(`✅ App initialized with ${words.length} words`);
            console.log(`🎮 Quiz-Mode ready! (LMB → Quiz, RMB → Speak, RMB×2 → Reveal)`);
            console.log(`⚙️ Press 'G' to toggle GameLoop debug panel`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            
            if (loader) {
                loader.style.display = 'none';
            }
            
            showError(`Ошибка: ${error.message}`);
        }
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