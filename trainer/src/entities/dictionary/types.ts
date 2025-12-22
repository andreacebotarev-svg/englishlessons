/**
 * Dictionary entity types
 * Represents lessons, words, and phonemes
 */

/**
 * Single phoneme (sound unit)
 */
export interface Phoneme {
  /** Phoneme symbol (e.g., 'æ', 'k', 't') */
  symbol: string;
  /** IPA transcription */
  ipa?: string;
  /** Example words */
  examples?: string[];
}

/**
 * Single word with phonetic breakdown
 */
export interface Word {
  /** The word itself (e.g., 'cat') */
  word: string;
  
  /** Phonemes that make up the word */
  phonemes: string[];
  
  /** Russian translation */
  translation: string;
  
  /** IPA transcription (e.g., '[kæt]') */
  transcription: string;
  
  /** Optional emoji or icon */
  emoji?: string;
  
  /** Optional image URL */
  imageUrl?: string;
  
  /** Optional audio URL */
  audioUrl?: string;
  
  /** Difficulty level (1-5) */
  difficulty?: number;
  
  /** Tags for filtering */
  tags?: string[];
}

/**
 * Lesson containing multiple words
 */
export interface Lesson {
  /** Lesson ID (e.g., 1, 2, 3) */
  id: number;
  
  /** Lesson title */
  title: string;
  
  /** Reading rule explanation */
  rule: string;
  
  /** Detailed description */
  description: string;
  
  /** Set of phonemes introduced in this lesson */
  phonemesSet: string[];
  
  /** Words to practice */
  words: Word[];
  
  /** Optional lesson icon/emoji */
  emoji?: string;
  
  /** Optional color theme */
  color?: string;
  
  /** Estimated time in minutes */
  estimatedTime?: number;
  
  /** Prerequisites (lesson IDs) */
  prerequisites?: number[];
}

/**
 * Lesson metadata (for lesson selection)
 */
export interface LessonMeta {
  id: number;
  title: string;
  description: string;
  emoji?: string;
  color?: string;
  wordCount: number;
  estimatedTime?: number;
  isCompleted?: boolean;
  stars?: number; // 0-3
}

/**
 * Lesson progress
 */
export interface LessonProgress {
  lessonId: number;
  completedWords: number;
  totalWords: number;
  score: number;
  stars: number; // 0-3
  attempts: number;
  lastAttemptDate: number; // timestamp
}
