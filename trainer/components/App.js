/**
 * Main App Component
 * Renders the entire application
 */

import { GameBoard } from './GameBoard.js';
import { ProgressBar } from './ProgressBar.js';
import { gameState } from '../store/gameState.js';

export function renderApp() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        ${ProgressBar()}
        ${GameBoard()}
    `;
    
    // Attach event listeners
    attachEventListeners();
}

function attachEventListeners() {
    // Will be populated by child components
}
