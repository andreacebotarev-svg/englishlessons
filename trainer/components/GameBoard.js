/**
 * GameBoard Component
 * Main game area with word display, slots, and keyboard
 */

import { WordCard } from './WordCard.js';
import { Slots } from './Slots.js';
import { Keyboard } from './Keyboard.js';
import { gameState } from '../store/gameState.js';

export function GameBoard() {
    const word = gameState.getCurrentWord();
    
    if (!word) {
        return '<div class="stage"><p>Loading...</p></div>';
    }
    
    return `
        <div class="stage">
            ${WordCard(word)}
            ${Slots(word.phonemes.length)}
            ${Keyboard(word.phonemes)}
            <div id="message" style="height: 20px; color: #64748b; font-weight: 500;"></div>
        </div>
    `;
}
