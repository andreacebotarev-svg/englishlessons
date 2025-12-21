import { LessonSchema, ILesson } from '@/entities/dictionary/model/schema';

/**
 * Загружает урок по ID из папки data (на 2 уровня выше)
 * @param lessonId - например 'lesson_01'
 */
export const fetchLesson = async (lessonId: string): Promise<ILesson> => {
  try {
    // Vite alias позволяет делать запросы к файловой системе в dev режиме
    // В продакшене это будет обычный fetch к ./data/...
    // Важно: путь должен быть относительным от корня сайта на GitHub Pages
    
    // Определяем базовый путь. 
    // В режиме DEV (localhost) файлы лежат в корневой папке ../../data
    // В режиме PROD (GitHub) они будут лежать параллельно с index.html тренажера
    
    const isDev = import.meta.env.DEV;
    const basePath = isDev ? '../../data' : '../../data'; 
    
    const response = await fetch(`${basePath}/${lessonId}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load lesson: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Zod валидация: если в JSON ошибка, код упадет здесь и скажет ГДЕ именно
    const parsedData = LessonSchema.parse(rawData);
    
    return parsedData;

  } catch (error) {
    console.error('Lesson Loader Error:', error);
    throw error;
  }
};
