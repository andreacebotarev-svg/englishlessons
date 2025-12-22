/**
 * Lesson Loader
 * Handles loading and caching lesson data from JSON files
 */

import { LessonSchema } from './schema';
import type { Lesson, LessonMeta } from './types';

/**
 * Lesson Loader with caching
 */
export class LessonLoader {
  private cache = new Map<number, Lesson>();
  private loading = new Map<number, Promise<Lesson>>();
  private readonly basePath: string;
  
  constructor(basePath = '../../data') {
    this.basePath = basePath;
  }
  
  /**
   * Load a lesson by ID
   */
  async load(id: number): Promise<Lesson> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    // Check if already loading
    if (this.loading.has(id)) {
      return this.loading.get(id)!;
    }
    
    // Load from file
    const loadPromise = this.loadFromFile(id);
    this.loading.set(id, loadPromise);
    
    try {
      const lesson = await loadPromise;
      this.cache.set(id, lesson);
      return lesson;
    } finally {
      this.loading.delete(id);
    }
  }
  
  /**
   * Load lesson from JSON file
   */
  private async loadFromFile(id: number): Promise<Lesson> {
    const fileName = `lesson_${String(id).padStart(2, '0')}.json`;
    const url = `${this.basePath}/${fileName}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(
          `Failed to load lesson ${id}: ${response.status} ${response.statusText}`
        );
      }
      
      const data = await response.json();
      
      // Validate with Zod
      const lesson = LessonSchema.parse(data);
      
      return lesson;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load lesson ${id}: ${error.message}`);
      }
      throw error;
    }
  }
  
  /**
   * Preload multiple lessons
   */
  async preload(ids: number[]): Promise<Lesson[]> {
    return Promise.all(ids.map(id => this.load(id)));
  }
  
  /**
   * Get lesson metadata without full load
   */
  async getMeta(id: number): Promise<LessonMeta> {
    const lesson = await this.load(id);
    
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      emoji: lesson.emoji,
      color: lesson.color,
      wordCount: lesson.words.length,
      estimatedTime: lesson.estimatedTime,
    };
  }
  
  /**
   * Get metadata for all available lessons
   */
  async getAllMeta(): Promise<LessonMeta[]> {
    // For now, try to load lessons 1-10
    const metas: LessonMeta[] = [];
    
    for (let id = 1; id <= 10; id++) {
      try {
        const meta = await this.getMeta(id);
        metas.push(meta);
      } catch (error) {
        // Lesson doesn't exist, stop trying
        break;
      }
    }
    
    return metas;
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Check if lesson is cached
   */
  isCached(id: number): boolean {
    return this.cache.has(id);
  }
  
  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Singleton instance
 */
export const lessonLoader = new LessonLoader();
