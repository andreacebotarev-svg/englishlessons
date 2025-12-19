/**
 * LESSON STORAGE MODULE
 * Handles LocalStorage operations for saved words
 */

class LessonStorage {
  constructor(lessonId) {
    this.lessonId = lessonId;
    this.storageKey = `lesson-${lessonId}-words`;
  }

  /**
   * Load saved words from LocalStorage
   * @returns {Array} Array of saved word objects
   */
  loadWords() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading saved words:', e);
      return [];
    }
  }

  /**
   * Save words to LocalStorage with quota handling
   * @param {Array} words - Array of word objects to save
   */
  saveWords(words) {
    if (!this.safeSave(this.storageKey, words)) {
      // Quota exceeded → cleanup and retry
      this.cleanupOldLessons();
      if (!this.safeSave(this.storageKey, words)) {
        throw new Error('Storage quota exceeded after cleanup');
      }
    }
  }

  /**
   * Safe save with quota error handling
   * @param {string} key - Storage key
   * @param {*} value - Value to save
   * @returns {boolean} Success status
   */
  safeSave(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded:', e);
        return false;
      }
      throw e; // Other errors propagate
    }
  }

  /**
   * Cleanup old lesson data (30+ days)
   */
  cleanupOldLessons() {
    const keys = Object.keys(localStorage);
    const lessonKeys = keys.filter(k => k.startsWith('lesson-'));
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    
    lessonKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (!Array.isArray(data) || data.length === 0) return;
        
        const age = Date.now() - (data[0]?.timestamp || 0);
        if (age > THIRTY_DAYS) {
          localStorage.removeItem(key);
          console.log('Cleaned up old lesson:', key);
        }
      } catch (e) {
        // Corrupted data → remove it
        localStorage.removeItem(key);
        console.warn('Removed corrupted data:', key);
      }
    });
  }

  /**
   * Add a word to saved words
   * @param {Object} wordData - Word object with {word, definition, phonetic}
   * @returns {boolean} Success status
   */
  addWord(wordData) {
    const words = this.loadWords();
    
    // Check if word already exists
    const exists = words.some(w => 
      w.word.toLowerCase() === wordData.word.toLowerCase()
    );
    
    if (!exists) {
      words.push({
        word: wordData.word,
        definition: wordData.definition,
        phonetic: wordData.phonetic || '',
        timestamp: Date.now()
      });
      this.saveWords(words);
      return true;
    }
    return false;
  }

  /**
   * Remove a word from saved words
   * @param {string} word - Word to remove
   * @returns {boolean} Success status
   */
  removeWord(word) {
    let words = this.loadWords();
    const initialLength = words.length;
    
    words = words.filter(w => 
      w.word.toLowerCase() !== word.toLowerCase()
    );
    
    if (words.length !== initialLength) {
      this.saveWords(words);
      return true;
    }
    return false;
  }

  /**
   * Check if a word is saved
   * @param {string} word - Word to check
   * @returns {boolean}
   */
  isWordSaved(word) {
    const words = this.loadWords();
    return words.some(w => w.word.toLowerCase() === word.toLowerCase());
  }

  /**
   * Clear all saved words for this lesson
   */
  clearAll() {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Clear all saved words (alias for backward compatibility)
   */
  clearAllWords() {
    this.clearAll();
  }

  /**
   * Get count of saved words
   * @returns {number}
   */
  getCount() {
    return this.loadWords().length;
  }
}