import { LessonSchema, type Lesson } from '@/entities/dictionary';

/**
 * Load and validate lesson JSON files from /public/data
 * Data is self-contained within trainer app
 */
export async function loadLesson(lessonId: string): Promise<Lesson> {
  try {
    // Fetch from trainer's own public/data folder
    const response = await fetch(`/data/${lessonId}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load lesson: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate with Zod
    const validated = LessonSchema.parse(data);
    
    return validated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Lesson loading error: ${error.message}`);
    }
    throw error;
  }
}
