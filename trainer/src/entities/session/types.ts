/**
 * Session entity types
 * Represents current game session state
 */

import type { LessonProgress } from '../dictionary/types';

/**
 * Current word attempt state
 */
export interface WordAttempt {
  /** Selected phonemes by user */
  selectedPhonemes: string[];
  
  /** Number of attempts for current word */
  attempts: number;
  
  /** Whether answer is correct */
  isCorrect: boolean | null;
  
  /** Time spent on current word (seconds) */
  timeSpent: number;
}

/**
 * Game session state
 */
export interface SessionState {
  /** Current lesson ID */
  lessonId: number | null;
  
  /** Current word index */
  currentWordIndex: number;
  
  /** Total score */
  score: number;
  
  /** Stars earned (0-3) */
  stars: number;
  
  /** Current word attempt */
  currentAttempt: WordAttempt;
  
  /** Completed word indices */
  completedWords: Set<number>;
  
  /** Session start time */
  startTime: number;
  
  /** Is session active */
  isActive: boolean;
}

/**
 * User statistics
 */
export interface UserStats {
  /** Total score across all lessons */
  totalScore: number;
  
  /** Total words completed */
  totalWords: number;
  
  /** Total lessons completed */
  totalLessons: number;
  
  /** Total playtime (seconds) */
  totalPlaytime: number;
  
  /** Lesson progress by lesson ID */
  lessonProgress: Record<number, LessonProgress>;
  
  /** Last played timestamp */
  lastPlayed: number;
  
  /** First played timestamp */
  firstPlayed: number;
}

/**
 * Session storage key
 */
export const SESSION_STORAGE_KEY = 'english-trainer-session';
export const STATS_STORAGE_KEY = 'english-trainer-stats';
