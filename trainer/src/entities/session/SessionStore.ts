/**
 * Session Store
 * Manages game session state with Observer pattern and localStorage persistence
 */

import { storage } from '@/shared/lib/utils';
import type { SessionState, WordAttempt, UserStats } from './types';
import { SESSION_STORAGE_KEY, STATS_STORAGE_KEY } from './types';

type SessionListener = (state: SessionState) => void;

/**
 * Session Store class
 */
export class SessionStore {
  private state: SessionState;
  private listeners = new Set<SessionListener>();
  
  constructor() {
    this.state = this.loadState();
    
    // Auto-save on page unload
    window.addEventListener('beforeunload', () => {
      this.persist();
    });
  }
  
  /**
   * Get current state (readonly)
   */
  getState(): Readonly<SessionState> {
    return { ...this.state, completedWords: new Set(this.state.completedWords) };
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    
    // Call immediately with current state
    listener(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Start new lesson session
   */
  startLesson(lessonId: number): void {
    this.state = {
      lessonId,
      currentWordIndex: 0,
      score: 0,
      stars: 0,
      currentAttempt: this.getEmptyAttempt(),
      completedWords: new Set(),
      startTime: Date.now(),
      isActive: true,
    };
    
    this.persist();
    this.notify();
  }
  
  /**
   * End current lesson
   */
  endLesson(): void {
    if (!this.state.isActive) return;
    
    this.state.isActive = false;
    
    // Save to stats
    this.saveToStats();
    
    this.persist();
    this.notify();
  }
  
  /**
   * Move to next word
   */
  nextWord(): void {
    this.state.currentWordIndex++;
    this.state.currentAttempt = this.getEmptyAttempt();
    
    this.persist();
    this.notify();
  }
  
  /**
   * Add selected phoneme
   */
  addPhoneme(phoneme: string): void {
    this.state.currentAttempt.selectedPhonemes.push(phoneme);
    
    this.persist();
    this.notify();
  }
  
  /**
   * Remove last phoneme
   */
  removeLastPhoneme(): void {
    this.state.currentAttempt.selectedPhonemes.pop();
    
    this.persist();
    this.notify();
  }
  
  /**
   * Clear all selected phonemes
   */
  clearPhonemes(): void {
    this.state.currentAttempt.selectedPhonemes = [];
    
    this.persist();
    this.notify();
  }
  
  /**
   * Mark answer as correct/incorrect
   */
  setAnswerCorrect(isCorrect: boolean, earnedPoints: number = 0): void {
    this.state.currentAttempt.isCorrect = isCorrect;
    this.state.currentAttempt.attempts++;
    
    if (isCorrect) {
      this.state.score += earnedPoints;
      this.state.completedWords.add(this.state.currentWordIndex);
    }
    
    this.persist();
    this.notify();
  }
  
  /**
   * Update time spent on current word
   */
  updateTimeSpent(seconds: number): void {
    this.state.currentAttempt.timeSpent = seconds;
    this.persist();
    this.notify();
  }
  
  /**
   * Calculate stars based on score
   */
  calculateStars(maxScore: number): number {
    const percentage = (this.state.score / maxScore) * 100;
    
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  }
  
  /**
   * Reset session
   */
  reset(): void {
    this.state = this.getDefaultState();
    this.persist();
    this.notify();
  }
  
  /**
   * Get user statistics
   */
  getStats(): UserStats {
    return storage.get<UserStats>(STATS_STORAGE_KEY, this.getDefaultStats());
  }
  
  /**
   * Update user statistics
   */
  private saveToStats(): void {
    if (!this.state.lessonId) return;
    
    const stats = this.getStats();
    const lessonId = this.state.lessonId;
    const sessionDuration = Math.floor((Date.now() - this.state.startTime) / 1000);
    
    // Update totals
    stats.totalScore += this.state.score;
    stats.totalWords += this.state.completedWords.size;
    stats.totalPlaytime += sessionDuration;
    stats.lastPlayed = Date.now();
    
    // Update lesson progress
    const existingProgress = stats.lessonProgress[lessonId];
    const attempts = existingProgress ? existingProgress.attempts + 1 : 1;
    
    stats.lessonProgress[lessonId] = {
      lessonId,
      completedWords: this.state.completedWords.size,
      totalWords: this.state.currentWordIndex + 1,
      score: this.state.score,
      stars: this.state.stars,
      attempts,
      lastAttemptDate: Date.now(),
    };
    
    // Check if lesson is newly completed
    const isCompleted = this.state.completedWords.size === this.state.currentWordIndex + 1;
    if (isCompleted && !existingProgress) {
      stats.totalLessons++;
    }
    
    storage.set(STATS_STORAGE_KEY, stats);
  }
  
  /**
   * Clear all statistics
   */
  clearStats(): void {
    storage.remove(STATS_STORAGE_KEY);
  }
  
  /**
   * Load state from localStorage
   */
  private loadState(): SessionState {
    const stored = storage.get<any>(SESSION_STORAGE_KEY, null);
    
    if (!stored) {
      return this.getDefaultState();
    }
    
    // Restore Set from array
    return {
      ...stored,
      completedWords: new Set(stored.completedWords || []),
    };
  }
  
  /**
   * Persist state to localStorage
   */
  private persist(): void {
    // Convert Set to array for JSON serialization
    const toStore = {
      ...this.state,
      completedWords: Array.from(this.state.completedWords),
    };
    
    storage.set(SESSION_STORAGE_KEY, toStore);
  }
  
  /**
   * Notify all listeners
   */
  private notify(): void {
    const state = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }
  
  /**
   * Get default state
   */
  private getDefaultState(): SessionState {
    return {
      lessonId: null,
      currentWordIndex: 0,
      score: 0,
      stars: 0,
      currentAttempt: this.getEmptyAttempt(),
      completedWords: new Set(),
      startTime: Date.now(),
      isActive: false,
    };
  }
  
  /**
   * Get default statistics
   */
  private getDefaultStats(): UserStats {
    return {
      totalScore: 0,
      totalWords: 0,
      totalLessons: 0,
      totalPlaytime: 0,
      lessonProgress: {},
      lastPlayed: Date.now(),
      firstPlayed: Date.now(),
    };
  }
  
  /**
   * Get empty attempt
   */
  private getEmptyAttempt(): WordAttempt {
    return {
      selectedPhonemes: [],
      attempts: 0,
      isCorrect: null,
      timeSpent: 0,
    };
  }
}

/**
 * Singleton instance
 */
export const sessionStore = new SessionStore();
