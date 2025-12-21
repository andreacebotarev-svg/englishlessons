/**
 * Main application entry point
 * ES Module - automatically imports dependencies
 */

import { renderApp } from './components/App.js';
import { gameState } from './store/gameState.js';
import { loadLesson } from './utils/lessonLoader.js';

// Initialize application
async function init() {
    try {
        console.log('🎯 Initializing English Trainer...');
        
        // Load first lesson
        const lesson = await loadLesson('lesson_01');
        gameState.setLesson(lesson);
        
        // Render app
        renderApp();
        
        console.log('✅ App initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        document.getElementById('app').innerHTML = `
            <div class="error">
                <h1>⚠️ Error</h1>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
