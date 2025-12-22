/**
 * LessonLoader tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LessonLoader } from './LessonLoader';

describe('LessonLoader', () => {
  let loader: LessonLoader;
  
  beforeEach(() => {
    loader = new LessonLoader();
    loader.clearCache();
  });
  
  describe('load', () => {
    it('should load lesson 1 successfully', async () => {
      const lesson = await loader.load(1);
      
      expect(lesson).toBeDefined();
      expect(lesson.id).toBe(1);
      expect(lesson.title).toBeTruthy();
      expect(lesson.words).toBeInstanceOf(Array);
      expect(lesson.words.length).toBeGreaterThan(0);
    });
    
    it('should validate lesson structure with Zod', async () => {
      const lesson = await loader.load(1);
      
      // Check required fields
      expect(lesson).toHaveProperty('id');
      expect(lesson).toHaveProperty('title');
      expect(lesson).toHaveProperty('rule');
      expect(lesson).toHaveProperty('description');
      expect(lesson).toHaveProperty('phonemesSet');
      expect(lesson).toHaveProperty('words');
      
      // Check word structure
      const word = lesson.words[0];
      expect(word).toHaveProperty('word');
      expect(word).toHaveProperty('phonemes');
      expect(word).toHaveProperty('translation');
      expect(word).toHaveProperty('transcription');
    });
    
    it('should cache loaded lessons', async () => {
      expect(loader.isCached(1)).toBe(false);
      
      await loader.load(1);
      
      expect(loader.isCached(1)).toBe(true);
      expect(loader.getCacheSize()).toBe(1);
    });
    
    it('should return cached lesson on second load', async () => {
      const lesson1 = await loader.load(1);
      const lesson2 = await loader.load(1);
      
      // Should be exact same object (from cache)
      expect(lesson1).toBe(lesson2);
    });
    
    it('should throw error for non-existent lesson', async () => {
      await expect(loader.load(999)).rejects.toThrow();
    });
  });
  
  describe('getMeta', () => {
    it('should return lesson metadata', async () => {
      const meta = await loader.getMeta(1);
      
      expect(meta).toBeDefined();
      expect(meta.id).toBe(1);
      expect(meta.title).toBeTruthy();
      expect(meta.wordCount).toBeGreaterThan(0);
    });
  });
  
  describe('getAllMeta', () => {
    it('should return metadata for all available lessons', async () => {
      const metas = await loader.getAllMeta();
      
      expect(metas).toBeInstanceOf(Array);
      expect(metas.length).toBeGreaterThan(0);
      
      // Should at least have lesson 1
      const lesson1 = metas.find(m => m.id === 1);
      expect(lesson1).toBeDefined();
    });
  });
  
  describe('preload', () => {
    it('should preload multiple lessons', async () => {
      const lessons = await loader.preload([1, 2]);
      
      expect(lessons).toHaveLength(2);
      expect(lessons[0].id).toBe(1);
      expect(lessons[1].id).toBe(2);
      
      expect(loader.getCacheSize()).toBe(2);
    });
  });
  
  describe('cache management', () => {
    it('should clear cache', async () => {
      await loader.load(1);
      expect(loader.getCacheSize()).toBe(1);
      
      loader.clearCache();
      expect(loader.getCacheSize()).toBe(0);
      expect(loader.isCached(1)).toBe(false);
    });
  });
});
