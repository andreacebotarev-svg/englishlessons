/**
 * Core data types for lesson content
 */

export type Phoneme = string;

export interface WordCard {
  id: string;
  text: string;
  transcription?: string;
  translation: string;
  phonemes: Phoneme[];
  image: string;
  audioUrl?: string;
  difficulty: number;
  tags: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  words: WordCard[];
}
