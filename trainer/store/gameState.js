/**
 * Game State Store
 * Simple reactive state management
 */

import { renderApp } from '../components/App.js';
import { playWord, playPhoneme, playSuccess, playError } from '../utils/audioManager.js';

export const gameState = {
    currentLesson: null,
    currentWordIndex: 0,
    score: 0,
    attempts: 0,
    selectedPhonemes: [],
    usedKeys: new Set(),
    
    setLesson(lesson) {
        this.currentLesson = lesson;
        this.currentWordIndex = 0;
        this.score = 0;
        this.selectedPhonemes = new Array(lesson.words[0].phonemes.length).fill(null);
        this.usedKeys = new Set();
        this.render();
    },
    
    getCurrentWord() {
        if (!this.currentLesson) return null;
        return this.currentLesson.words[this.currentWordIndex];
    },
    
    submitPhoneme(phoneme, keyIndex) {
        // Find first empty slot
        const emptyIndex = this.selectedPhonemes.findIndex(p => p === null);
        if (emptyIndex === -1) return;
        
        const currentWord = this.getCurrentWord();
        const expectedPhoneme = currentWord.phonemes[emptyIndex];
        
        if (phoneme === expectedPhoneme) {
            // Correct!
            this.selectedPhonemes[emptyIndex] = phoneme;
            this.usedKeys.add(keyIndex);
            playPhoneme(phoneme);
            
            // Check if word is complete
            if (!this.selectedPhonemes.includes(null)) {
                this.handleWordComplete();
            }
            
            this.render();
            return true;
        } else {
            // Wrong!
            playError();
            this.showMessage('Try again!', 'error');
            this.shakeElement(`.key-btn[data-index="${keyIndex}"]`);
            return false;
        }
    },
    
    handleWordComplete() {
        playSuccess();
        const word = this.getCurrentWord();
        playWord(word.text);
        
        this.score += 10;
        this.showMessage('Great job! 🎉', 'success');
        
        setTimeout(() => {
            this.nextWord();
        }, 1500);
    },
    
    nextWord() {
        this.currentWordIndex++;
        
        if (this.currentWordIndex >= this.currentLesson.words.length) {
            // Lesson complete!
            alert(`Lesson complete! Score: ${this.score}`);
            this.currentWordIndex = 0;
        }
        
        const nextWord = this.getCurrentWord();
        this.selectedPhonemes = new Array(nextWord.phonemes.length).fill(null);
        this.usedKeys = new Set();
        this.render();
    },
    
    render() {
        renderApp();
    },
    
    showMessage(text, type = 'info') {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.style.color = type === 'error' ? 'var(--error)' : 'var(--success)';
            setTimeout(() => {
                messageEl.textContent = '';
            }, 1500);
        }
    },
    
    shakeElement(selector) {
        const el = document.querySelector(selector);
        if (el) {
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 500);
        }
    }
};

// Global functions for onclick handlers
window.handlePhonemeClick = (phoneme, index) => {
    if (gameState.usedKeys.has(index)) return;
    gameState.submitPhoneme(phoneme, index);
};

window.playWord = (word) => {
    playWord(word);
};
