/**
 * Phoneme validation utilities
 */

import type { Phoneme } from '@/entities/dictionary';

export function validatePhonemeSequence(
  selected: (string | null)[],
  expected: Phoneme[]
): boolean {
  // TODO: Implement validation logic
  if (selected.length !== expected.length) return false;
  
  return selected.every((phoneme, index) => phoneme === expected[index]);
}

export function findNextEmptySlot(slots: (string | null)[]): number {
  return slots.findIndex(slot => slot === null);
}
