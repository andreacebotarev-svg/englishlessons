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
  
  // Actions (to be implemented)
  setLesson: (lesson) => {
    set({
      currentLesson: lesson,
      currentWordIndex: 0,
      selectedPhonemes: new Array(lesson.words[0]?.phonemes.length || 0).fill(null),
      status: 'playing',
    });
  },
  
  nextWord: () => {
    // TODO: Implement next word logic
  },
  
  submitPhoneme: (phoneme, slotIndex) => {
    // TODO: Implement phoneme submission logic
  },
  
  checkWord: () => {
    // TODO: Implement word validation logic
    return false;
  },
  
  resetGame: () => {
    set({
      currentWordIndex: 0,
      score: 0,
      attempts: 0,
      status: 'idle',
      selectedPhonemes: [],
    });
  },
}));
