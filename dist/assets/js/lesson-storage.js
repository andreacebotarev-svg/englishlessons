/**
 * LESSON STORAGE MODULE
 * Handles LocalStorage operations for saved words
 */

class LessonStorage {
  constructor(lessonId) {
    this.lessonId = lessonId;
    this.storageKey = `lesson-${lessonId}-words`;
    this.statusKey = `lesson-${lessonId}-word-statuses`;
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

  // ========================================
  // KANBAN STATUS TRACKING (NEW)
  // ========================================

  /**
   * Get word status for Kanban board
   * @param {string} word - English word
   * @returns {string} status: 'to-learn' | 'learning' | 'known' | 'favorites'
   */
  getWordStatus(word) {
    try {
      const statuses = JSON.parse(
        localStorage.getItem(this.statusKey) || '{}'
      );
      return statuses[word.toLowerCase()] || 'to-learn';
    } catch (e) {
      console.error('Error loading word status:', e);
      return 'to-learn';
    }
  }

  /**
   * Update word status in Kanban board
   * @param {string} word - English word
   * @param {string} status - New status: 'to-learn' | 'learning' | 'known' | 'favorites'
   * @returns {boolean} Success status
   */
  updateWordStatus(word, status) {
    try {
      const validStatuses = ['to-learn', 'learning', 'known', 'favorites'];
      if (!validStatuses.includes(status)) {
        console.warn(`Invalid status: ${status}. Using 'to-learn' as default.`);
        status = 'to-learn';
      }

      const statuses = JSON.parse(
        localStorage.getItem(this.statusKey) || '{}'
      );
      statuses[word.toLowerCase()] = status;
      localStorage.setItem(this.statusKey, JSON.stringify(statuses));
      return true;
    } catch (e) {
      console.error('Error updating word status:', e);
      return false;
    }
  }

  /**
   * Get words grouped by status for Kanban board
   * @param {Array} vocabularyWords - All vocabulary from lesson data
   * @returns {Object} Grouped words: { 'to-learn': [], 'learning': [], 'known': [], 'favorites': [] }
   */
  getWordsByStatus(vocabularyWords) {
    const grouped = {
      'to-learn': [],
      'learning': [],
      'known': [],
      'favorites': []
    };

    if (!vocabularyWords || !Array.isArray(vocabularyWords)) {
      console.warn('Invalid vocabulary data provided to getWordsByStatus');
      return grouped;
    }

    const savedWords = new Set(this.loadWords().map(w => w.word.toLowerCase()));

    vocabularyWords.forEach(word => {
      const wordEn = word.en;
      if (!wordEn) return; // Skip invalid entries

      const status = this.getWordStatus(wordEn);
      const isFavorite = savedWords.has(wordEn.toLowerCase());

      // Add to status column
      grouped[status].push({
        ...word,
        isFavorite: isFavorite
      });

      // Also add to favorites if saved (favorites column shows all saved words)
      if (isFavorite && status !== 'favorites') {
        grouped['favorites'].push({
          ...word,
          isFavorite: true
        });
      }
    });

    return grouped;
  }

  /**
   * Clear all word statuses (reset Kanban board)
   */
  clearAllStatuses() {
    try {
      localStorage.removeItem(this.statusKey);
      return true;
    } catch (e) {
      console.error('Error clearing word statuses:', e);
      return false;
    }
  }

  /**
   * Get statistics for Kanban board
   * @param {Array} vocabularyWords - All vocabulary from lesson data
   * @returns {Object} Statistics: { total, 'to-learn', 'learning', 'known', 'favorites' }
   */
  getStatusStatistics(vocabularyWords) {
    const grouped = this.getWordsByStatus(vocabularyWords);
    return {
      total: vocabularyWords.length,
      'to-learn': grouped['to-learn'].length,
      'learning': grouped['learning'].length,
      'known': grouped['known'].length,
      'favorites': grouped['favorites'].length
    };
  }
}