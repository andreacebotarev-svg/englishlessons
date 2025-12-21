import { useCallback } from 'react';
import { useSessionStore } from '@/entities/session';

/**
 * Main game logic hook
 * Handles word construction, validation, and scoring
 */
export function usePhonicsGame() {
  const store = useSessionStore();
  
  const handlePhonemeClick = useCallback((phoneme: string) => {
    // TODO: Implement phoneme selection logic
    console.log('Phoneme clicked:', phoneme);
  }, []);
  
  const validateWord = useCallback(() => {
    // TODO: Implement word validation
    return false;
  }, []);
  
  const handleNextWord = useCallback(() => {
    // TODO: Implement next word transition
  }, []);
  
  return {
    handlePhonemeClick,
    validateWord,
    handleNextWord,
    currentWord: store.currentLesson?.words[store.currentWordIndex],
    score: store.score,
    status: store.status,
  };
}
