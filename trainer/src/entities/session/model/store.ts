import { create } from 'zustand';
import type { WordCard, Lesson } from '@/entities/dictionary';

/**
 * Global session state management
 */

export interface SessionState {
  // Current lesson data
  currentLesson: Lesson | null;
  currentWordIndex: number;
  
  // Game state
  score: number;
  attempts: number;
  status: 'idle' | 'playing' | 'success' | 'error' | 'completed';
  
  // Word construction state
  selectedPhonemes: (string | null)[];
  
  // Actions
  setLesson: (lesson: Lesson) => void;
  nextWord: () => void;
  submitPhoneme: (phoneme: string, slotIndex: number) => void;
  checkWord: () => boolean;
  resetGame: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  currentLesson: null,
  currentWordIndex: 0,
  score: 0,
  attempts: 0,
  status: 'idle',
  selectedPhonemes: [],
  
  // Actions
  setLesson: (lesson) => {
    set({
      currentLesson: lesson,
      currentWordIndex: 0,
      selectedPhonemes: new Array(lesson.words[0]?.phonemes.length || 0).fill(null),
      status: 'playing',
      score: 0,
      attempts: 0,
    });
  },
  
  nextWord: () => {
    const state = get();
    const nextIndex = state.currentWordIndex + 1;
    
    if (state.currentLesson && nextIndex < state.currentLesson.words.length) {
      const nextWord = state.currentLesson.words[nextIndex];
      set({
        currentWordIndex: nextIndex,
        selectedPhonemes: new Array(nextWord.phonemes.length).fill(null),
        status: 'playing',
      });
    } else {
      set({ status: 'completed' });
    }
  },
  
  submitPhoneme: (phoneme, slotIndex) => {
    const state = get();
    const newPhonemes = [...state.selectedPhonemes];
    newPhonemes[slotIndex] = phoneme;
    
    set({
      selectedPhonemes: newPhonemes,
      attempts: state.attempts + 1,
    });
  },
  
  checkWord: () => {
    const state = get();
    if (!state.currentLesson) return false;
    
    const currentWord = state.currentLesson.words[state.currentWordIndex];
    const isCorrect = state.selectedPhonemes.every(
      (phoneme, index) => phoneme === currentWord.phonemes[index]
    );
    
    if (isCorrect) {
      set({
        status: 'success',
        score: state.score + 10,
      });
    } else {
      set({ status: 'error' });
    }
    
    return isCorrect;
  },
  
  resetGame: () => {
    set({
      currentLesson: null,
      currentWordIndex: 0,
      score: 0,
      attempts: 0,
      status: 'idle',
      selectedPhonemes: [],
    });
  },
}));
