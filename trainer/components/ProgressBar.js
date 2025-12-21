/**
 * ProgressBar Component
 * Shows lesson progress and score
 */

import { gameState } from '../store/gameState.js';

export function ProgressBar() {
    const lesson = gameState.currentLesson;
    const progress = lesson ? (gameState.currentWordIndex / lesson.words.length) * 100 : 0;
    
    return `
        <div class="header">
            <div>Lesson ${lesson ? lesson.order : 1}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div id="score-display">⭐ ${gameState.score}</div>
        </div>
    `;
}
