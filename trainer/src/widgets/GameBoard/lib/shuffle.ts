/**
 * Utility to shuffle phonemes for keyboard
 */

export function shufflePhonemes(phonemes: string[]): string[] {
  const shuffled = [...phonemes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
