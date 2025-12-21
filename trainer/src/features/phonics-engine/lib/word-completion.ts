/**
 * Word completion and scoring logic
 */

export function calculateScore(attempts: number, difficulty: number): number {
  // TODO: Implement scoring algorithm
  const baseScore = 10;
  const penaltyPerAttempt = 2;
  const difficultyMultiplier = difficulty;
  
  return Math.max(0, (baseScore - (attempts * penaltyPerAttempt)) * difficultyMultiplier);
}

export function shouldShowHint(attempts: number): boolean {
  return attempts >= 3;
}
