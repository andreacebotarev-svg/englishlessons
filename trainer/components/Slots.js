/**
 * Slots Component
 * Empty slots where phonemes will be placed
 */

import { gameState } from '../store/gameState.js';

export function Slots(count) {
    const slots = [];
    
    for (let i = 0; i < count; i++) {
        const phoneme = gameState.selectedPhonemes[i];
        const filled = phoneme ? 'filled' : '';
        
        slots.push(`
            <div class="slot ${filled}" data-index="${i}">
                ${phoneme || ''}
            </div>
        `);
    }
    
    return `<div class="slots-container">${slots.join('')}</div>`;
}
