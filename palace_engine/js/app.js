/* ============================================
   MEMORY PALACE - MAIN APPLICATION
   Описание: Инициализация и загрузка данных
   Last update: 2025-12-09 12:27
   ============================================ */

import { CONFIG } from './config.js';
import { buildWorld } from './builder.js';
import { initCamera } from './camera.js';

const App = {
    async init() {
        const loader = document.getElementById('loading');
        
        try {
            // 1. Читаем ID урока из URL (?lesson=263)
            const params = new URLSearchParams(window.location.search);
            const lessonId = params.get('lesson') || '263';
            
            console.log(`🎯 Loading lesson: ${lessonId}`);
            
            // 2. Загружаем JSON
            const response = await fetch(`../data/${lessonId}.json`);
            
            if (!response.ok) {
                throw new Error(`Lesson ${lessonId} not found`);
            }
            
            const data = await response.json();
            console.log('📦 Data loaded:', data);
            
            // 3. Достаем слова
            let words = [];
            
            if (data.content && data.content.vocabulary && data.content.vocabulary.words) {
                words = data.content.vocabulary.words;
            }
            
            if (words.length === 0) {
                throw new Error('No words in this lesson');
            }
            
            console.log(`📚 Words found: ${words.length}`);
            
            // 4. Строим мир с карточками
            const world = buildWorld(words);
            const scene = document.getElementById('scene');
            
            if (!scene) {
                throw new Error('Scene container not found');
            }
            
            scene.appendChild(world);
            console.log('🏗️ World built successfully');
            
            // 5. Обновляем счётчик
            const counter = document.getElementById('word-counter');
            if (counter) {
                counter.textContent = `0 / ${words.length}`;
            }
            
            // 6. Запускаем камеру
            initCamera(words, CONFIG);
            console.log('📹 Camera initialized');
            
            // Скрываем лоадер
            if (loader) {
                loader.style.display = 'none';
            }
            
            console.log(`✅ App initialized with ${words.length} words`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            
            if (loader) {
                loader.style.display = 'none';
            }
            
            // Показываем ошибку пользователю
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

// Старт при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

export default App;