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
   * Save words to LocalStorage
   * @param {Array} words - Array of word objects to save
   */
  saveWords(words) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(words));
    } catch (e) {
      console.error('Error saving words:', e);
    }
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
   * Get count of saved words
   * @returns {number}
   */
  getCount() {
    return this.loadWords().length;
  }
}