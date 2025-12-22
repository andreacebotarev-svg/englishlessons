/**
 * Zod schemas for runtime validation
 * Ensures data integrity when loading from JSON
 */

import { z } from 'zod';

/**
 * Word schema
 */
export const WordSchema = z.object({
  word: z.string().min(1).max(20),
  phonemes: z.array(z.string()).min(1).max(10),
  translation: z.string().min(1),
  transcription: z.string(),
  emoji: z.string().optional(),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Lesson schema
 */
export const LessonSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  rule: z.string().min(1),
  description: z.string().min(1),
  phonemesSet: z.array(z.string()).min(1),
  words: z.array(WordSchema).min(1),
  emoji: z.string().optional(),
  color: z.string().optional(),
  estimatedTime: z.number().int().positive().optional(),
  prerequisites: z.array(z.number().int().positive()).optional(),
});

/**
 * Lesson metadata schema
 */
export const LessonMetaSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  wordCount: z.number().int().positive(),
  estimatedTime: z.number().int().positive().optional(),
  isCompleted: z.boolean().optional(),
  stars: z.number().int().min(0).max(3).optional(),
});

/**
 * Type inference from schemas
 */
export type WordSchemaType = z.infer<typeof WordSchema>;
export type LessonSchemaType = z.infer<typeof LessonSchema>;
export type LessonMetaSchemaType = z.infer<typeof LessonMetaSchema>;
