import { useState, useEffect } from 'react';
import { loadLesson } from '@/shared/api';
import type { Lesson } from '@/entities/dictionary';

/**
 * Hook to load and validate lesson data
 */
export function useLessonData(lessonId: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!lessonId) return;
    
    async function fetchLesson() {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await loadLesson(lessonId);
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchLesson();
  }, [lessonId]);
  
  return { lesson, isLoading, error };
}
