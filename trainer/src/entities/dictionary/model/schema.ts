import { z } from 'zod';

/**
 * Zod validation schemas for lesson data
 */

export const PhonemeSchema = z.string().min(1).max(3);

export const WordCardSchema = z.object({
  id: z.string(),
  text: z.string().regex(/^[a-z]+$/i, 'Only letters allowed'),
  transcription: z.string().optional(),
  translation: z.string(),
  phonemes: z.array(PhonemeSchema).min(2).max(6),
  image: z.string(),
  audioUrl: z.string().optional(),
  difficulty: z.number().min(1).max(3).default(1),
  tags: z.array(z.string()).default([]),
});

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number().positive(),
  words: z.array(WordCardSchema).min(1),
});
