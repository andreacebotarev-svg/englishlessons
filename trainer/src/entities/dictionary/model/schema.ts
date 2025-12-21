import { z } from 'zod';

// Валидация одной фонемы
export const PhonemeSchema = z.string().min(1);

// Валидация карточки слова
export const WordCardSchema = z.object({
  id: z.string(),
  text: z.string(),
  transcription: z.string(),
  translation: z.string(),
  phonemes: z.array(PhonemeSchema),
  // Разрешаем и эмодзи, и URL. Если пусто — подставим заглушку в UI
  image: z.string().optional().default('❓'), 
  difficulty: z.number().optional().default(1),
});

// Валидация урока целиком
export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  order: z.number(),
  words: z.array(WordCardSchema),
});

// Выводим TypeScript типы из схем автоматически
export type IWordCard = z.infer<typeof WordCardSchema>;
export type ILesson = z.infer<typeof LessonSchema>;
