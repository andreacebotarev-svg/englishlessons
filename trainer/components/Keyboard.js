/**
 * Keyboard Component
 * Interactive buttons with phonemes
 */

import { shuffle } from '../utils/helpers.js';

export function Keyboard(phonemes) {
    const shuffled = shuffle([...phonemes]);
    
    const keys = shuffled.map((phoneme, index) => `
        <button class="key-btn pop-in" 
                data-phoneme="${phoneme}" 
                data-index="${index}"
                style="animation-delay: ${index * 0.1}s"
                onclick="window.handlePhonemeClick('${phoneme}', ${index})">
            ${phoneme}
        </button>
    `).join('');
    
    return `<div class="keyboard-area">${keys}</div>`;
}
