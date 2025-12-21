/**
 * Utility functions for processing dictionary data
 */

import type { WordCard } from '../model/types';

export function shufflePhonemes(phonemes: string[]): string[] {
  // TODO: Implement phoneme shuffling logic
  return [...phonemes].sort(() => Math.random() - 0.5);
}

export function getWordDifficulty(word: WordCard): number {
  // TODO: Calculate difficulty based on word properties
  return word.difficulty;
}
