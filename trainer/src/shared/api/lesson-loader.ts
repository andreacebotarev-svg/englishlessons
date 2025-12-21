import { LessonSchema, ILesson } from '@/entities/dictionary/model/schema';

/**
 * Загружает урок по ID из папки data
 * @param lessonId - например 'lesson_01'
 */
export const fetchLesson = async (lessonId: string): Promise<ILesson> => {
  try {
    // Определяем путь к данным
    // DEV: ../../data (относительно trainer/src/shared/api/)
    // PROD: ../data (относительно trainer/dist/)
    const isDev = import.meta.env.DEV;
    const basePath = isDev ? '../../data' : '../data'; 
    
    const response = await fetch(`${basePath}/${lessonId}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load lesson: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Zod валидация
    const parsedData = LessonSchema.parse(rawData);
    
    return parsedData;

  } catch (error) {
    console.error('Lesson Loader Error:', error);
    throw error;
  }
};
