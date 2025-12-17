/**
 * LESSON ENGINE
 * Main application controller
 */

class LessonEngine {
  constructor(lessonId) {
    this.lessonId = lessonId;
    this.storage = new LessonStorage(lessonId);
    this.tts = new LessonTTS();
    this.lessonData = null;
    this.currentTab = 'reading';
    this.vocabMode = 'list';
    this.flashcardIndex = 0;
    this.myWords = [];
    this.quizState = {
      currentQuestionIndex: 0,
      answers: [],
      completed: false
    };
  }

  /**
   * Initialize the lesson
   */
  async init() {
    try {
      await this.loadLessonData();
      this.myWords = this.storage.loadWords();
      this.render();
      this.hideLoader();
      this.injectPopupStyles();
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(error.message);
    }
  }

  /**
   * Inject critical popup styles into document
   */
  injectPopupStyles() {
    if (document.getElementById('popup-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'popup-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .word-popup {
        position: fixed;
        z-index: 10000;
        background: white;
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1);
        min-width: 280px;
        max-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #1a1a1a;
        animation: fadeIn 0.2s ease-out;
      }
      .word-popup-content {
        display: flex;
        flex-direction: column;
      }
      .word-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
      }
      .word-popup-word {
        font-weight: 600;
        font-size: 16px;
        color: #1a1a1a;
      }
      .word-popup-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        padding: 4px 8px;
        line-height: 1;
        transition: color 0.2s;
      }
      .word-popup-close:hover {
        color: #000;
      }
      .word-popup-body {
        padding: 16px;
      }
      .word-popup-phonetic {
        color: #666;
        font-size: 13px;
        margin-bottom: 8px;
        font-style: italic;
      }
      .word-popup-translation {
        font-size: 15px;
        margin-bottom: 12px;
        color: #1a1a1a;
      }
      .word-popup-error {
        color: #d73a49;
        font-size: 14px;
        margin-bottom: 12px;
      }
      .word-popup-actions {
        display: flex;
        gap: 8px;
      }
      .word-popup-btn {
        flex: 1;
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .word-popup-btn:hover {
        background: #f5f5f5;
        border-color: #ccc;
      }
      .word-popup-btn:active {
        transform: scale(0.98);
      }
      .word-popup-btn.primary {
        background: #0969da;
        color: white;
        border-color: #0969da;
      }
      .word-popup-btn.primary:hover {
        background: #0860ca;
        border-color: #0860ca;
      }
      .word-popup-btn.saved {
        background: #1a7f37;
        color: white;
        border-color: #1a7f37;
      }
      .word-popup-btn.saved:hover {
        background: #1a7038;
        border-color: #1a7038;
      }
      .word-popup-loader {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        font-size: 14px;
      }
      .word-popup .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #eee;
        border-top-color: #0969da;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Load lesson JSON data
   */
  async loadLessonData() {
    const response = await fetch(`../data/${this.lessonId}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load lesson data: ${response.status}`);
    }
    
    this.lessonData = await response.json();
    this.renderer = new LessonRenderer(this.lessonData, this.tts, this.storage);
  }

  /**
   * Hide loader
   */
  hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 400);
    }
  }

  /**
   * Show error
   */
  showError(message) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.innerHTML = `
        <div style="text-align: center; color: var(--accent-danger);">
          <div style="font-size: 2rem; margin-bottom: 12px;">⚠️</div>
          <div style="font-size: 0.95rem; margin-bottom: 8px;">Failed to load lesson</div>
          <div style="font-size: 0.8rem; color: var(--text-soft);">${message}</div>
        </div>
      `;
    }
  }

  /**
   * Full render of the app
   */
  render() {
    this.renderInterface();
    this.renderCurrentTab();
    this.updateSavedWordsCount();
  }

  /**
   * Render main interface structure (NO SIDEBAR)
   */
  renderInterface() {
    const { title, subtitle, meta } = this.lessonData;
    const { level = 'A1', duration = 30 } = meta || {};
    
    const hasGrammar = this.lessonData.grammar && Object.keys(this.lessonData.grammar).length > 0;

    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      <div class="app-shell">
        <div class="app-main">
          <header class="lesson-header">
            <div class="lesson-header-main">
              <div class="lesson-kicker">English Lesson</div>
              <h1 class="lesson-title">${this.renderer.escapeHTML(title)}</h1>
              <p class="lesson-subtitle">${this.renderer.escapeHTML(subtitle)}</p>
              <div class="lesson-meta">
                <span class="pill"><strong>${this.renderer.escapeHTML(level)}</strong></span>
                <span class="pill">⏱ <strong>${duration} min</strong></span>
                <span class="pill">📘 Lesson ${this.renderer.escapeHTML(this.lessonId)}</span>
              </div>
            </div>
            <div class="lesson-actions">
              <button class="primary-btn" onclick="window.lessonEngine.speakAllReading()" aria-label="Listen to reading">
                <span>🔊</span> Listen All
              </button>
              <div class="lesson-progress">
                <div class="progress-bar">
                  <div class="progress-bar-fill"></div>
                </div>
                <span class="progress-label">35%</span>
              </div>
            </div>
          </header>

          <div class="tabs">
            <button class="tab ${this.currentTab === 'reading' ? 'active' : ''}" data-tab="reading" onclick="window.lessonEngine.switchTab('reading')">
              <span class="tab-indicator"></span>
              Reading
            </button>
            <button class="tab ${this.currentTab === 'vocabulary' ? 'active' : ''}" data-tab="vocabulary" onclick="window.lessonEngine.switchTab('vocabulary')">
              <span class="tab-indicator"></span>
              Vocabulary
            </button>
            ${hasGrammar ? `
            <button class="tab ${this.currentTab === 'grammar' ? 'active' : ''}" data-tab="grammar" onclick="window.lessonEngine.switchTab('grammar')">
              <span class="tab-indicator"></span>
              Grammar
            </button>
            ` : ''}
            <button class="tab ${this.currentTab === 'quiz' ? 'active' : ''}" data-tab="quiz" onclick="window.lessonEngine.switchTab('quiz')">
              <span class="tab-indicator"></span>
              Quiz
            </button>
            <button class="tab ${this.currentTab === 'mywords' ? 'active' : ''}" data-tab="mywords" onclick="window.lessonEngine.switchTab('mywords')">
              <span class="tab-indicator"></span>
              My Words (<span id="words-count-badge">0</span>)
            </button>
          </div>

          <div class="card">
            <div class="card-inner" id="tab-content">
              <!-- Dynamic content -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show word popup with translation
   */
  async showWordPopup(word, event) {
    event.stopPropagation();
    
    // Remove old popup if exists
    const oldPopup = document.getElementById('word-popup');
    if (oldPopup) oldPopup.remove();
    
    // Create popup
    const popup = document.createElement('div');
    popup.id = 'word-popup';
    popup.className = 'word-popup';
    
    // Calculate position
    const rect = event.target.getBoundingClientRect();
    const popupHeight = 200;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    let top, left;
    
    // Smart positioning: above if space, otherwise below
    if (spaceAbove >= popupHeight || spaceAbove > spaceBelow) {
      top = rect.top + window.scrollY - popupHeight - 12;
    } else {
      top = rect.bottom + window.scrollY + 8;
    }
    
    // Horizontal positioning with edge detection
    left = rect.left + window.scrollX;
    const maxLeft = window.innerWidth - 350 - 20;
    if (left > maxLeft) left = maxLeft;
    if (left < 20) left = 20;
    
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    
    popup.innerHTML = `
      <div class="word-popup-content">
        <div class="word-popup-header">
          <span class="word-popup-word">${word}</span>
          <button class="word-popup-close" onclick="this.closest('.word-popup').remove()">✕</button>
        </div>
        <div class="word-popup-body">
          <div class="word-popup-loader">
            <div class="spinner"></div>
            Loading translation...
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Adjust position after render
    const actualHeight = popup.offsetHeight;
    if (spaceAbove >= actualHeight || spaceAbove > spaceBelow) {
      popup.style.top = `${rect.top + window.scrollY - actualHeight - 12}px`;
    }
    
    // Get translation
    try {
      const translation = await this.translateWord(word);
      const isInVocab = this.isWordInVocabulary(word);
      
      let transcription = '';
      if (isInVocab) {
        const vocabWord = this.lessonData.vocabulary.words.find(
          w => w.en.toLowerCase() === word.toLowerCase()
        );
        transcription = vocabWord?.transcription || '';
      }
      
      popup.querySelector('.word-popup-body').innerHTML = `
        ${transcription ? `<div class="word-popup-phonetic">${transcription}</div>` : ''}
        <div class="word-popup-translation">${translation}</div>
        <div class="word-popup-actions">
          <button class="word-popup-btn primary" onclick="window.lessonEngine.speakWord('${word.replace(/'/g, "\\'")}'')">
            🔊 Listen
          </button>
          <button class="word-popup-btn ${this.storage.isWordSaved(word) ? 'saved' : ''}" 
                  onclick="window.lessonEngine.toggleWordFromPopup('${word.replace(/'/g, "\\'")}'', '${translation.replace(/'/g, "\\\'" ).replace(/"/g, '&quot;')}', this)">
            ${this.storage.isWordSaved(word) ? '✓ Saved' : '💾 Save'}
          </button>
        </div>
      `;
      
      // Final position adjustment
      const finalHeight = popup.offsetHeight;
      if (spaceAbove >= finalHeight || spaceAbove > spaceBelow) {
        popup.style.top = `${rect.top + window.scrollY - finalHeight - 12}px`;
      }
      
    } catch (error) {
      console.error('Translation error:', error);
      popup.querySelector('.word-popup-body').innerHTML = `
        <div class="word-popup-error">
          ⚠️ Translation unavailable
        </div>
        <div class="word-popup-actions">
          <button class="word-popup-btn primary" onclick="window.lessonEngine.speakWord('${word.replace(/'/g, "\\\'")}')">
            🔊 Listen
          </button>
        </div>
      `;
    }
    
    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target)) {
          popup.remove();
          document.removeEventListener('click', closePopup);
        }
      });
    }, 100);
  }

  /**
   * Translate word using Google Translate API
   */
  async translateWord(word) {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(word)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0];
      }
      
      throw new Error('Translation not found');
    } catch (error) {
      console.warn('Google Translate failed, trying fallback:', error);
      
      // Fallback: check if word is in vocabulary
      const vocabWord = this.lessonData.vocabulary?.words.find(
        w => w.en.toLowerCase() === word.toLowerCase()
      );
      
      if (vocabWord) {
        return vocabWord.ru;
      }
      
      throw new Error('Translation unavailable');
    }
  }

  /**
   * Check if word is in vocabulary
   */
  isWordInVocabulary(word) {
    if (!this.lessonData?.vocabulary?.words) return false;
    return this.lessonData.vocabulary.words.some(
      w => w.en.toLowerCase() === word.toLowerCase()
    );
  }

  /**
   * Toggle word from popup
   */
  toggleWordFromPopup(word, translation, button) {
    if (this.storage.isWordSaved(word)) {
      // Remove
      this.storage.removeWord(word);
      button.textContent = '💾 Save';
      button.classList.remove('saved');
      this.showNotification(`"${word}" removed from saved words`);
    } else {
      // Save
      this.storage.addWord({
        word: word,
        definition: translation,
        phonetic: '',
        timestamp: Date.now()
      });
      button.textContent = '✓ Saved';
      button.classList.add('saved');
      this.showNotification(`"${word}" saved!`);
    }
    
    // Update saved words count
    this.myWords = this.storage.loadWords();
    this.updateSavedWordsCount();
  }

  /**
   * Update saved words count badge
   */
  updateSavedWordsCount() {
    const badge = document.getElementById('words-count-badge');
    if (badge) {
      badge.textContent = this.myWords.length;
    }
  }

  /**
   * Switch tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    
    if (tabName === 'vocabulary' && this.vocabMode === 'flashcard') {
      this.flashcardIndex = Math.max(0, this.flashcardIndex);
    }
    
    this.renderCurrentTab();
    this.tts.vibrate(10);
  }

  /**
   * Render current tab content
   */
  renderCurrentTab() {
    const contentEl = document.getElementById('tab-content');
    if (!contentEl) return;

    let html = '';

    switch (this.currentTab) {
      case 'reading':
        html = this.renderer.renderReading(this.myWords);
        break;
      case 'vocabulary':
        html = this.renderer.renderVocabulary(this.vocabMode, this.myWords, this.flashcardIndex);
        break;
      case 'grammar':
        html = this.renderer.renderGrammar();
        break;
      case 'quiz':
        html = this.renderer.renderQuiz(this.quizState);
        break;
      case 'mywords':
        html = this.renderMyWords();
        break;
    }

    contentEl.innerHTML = html;
    this.attachCurrentTabListeners();
  }

  /**
   * Render My Words tab
   */
  renderMyWords() {
    if (this.myWords.length === 0) {
      return `
        <div class="card-header">
          <h2 class="card-title">📚 My Words</h2>
        </div>
        <div style="padding: 40px 20px; text-align: center; color: var(--text-soft);">
          <div style="font-size: 3rem; margin-bottom: 16px;">📖</div>
          <p style="font-size: 1rem; margin-bottom: 8px;">No saved words yet</p>
          <p style="font-size: 0.85rem;">Click on any word in the reading to save it here!</p>
        </div>
      `;
    }

    const wordsHTML = this.myWords.map(word => {
      const safeWord = this.renderer.escapeHTML(word.word).replace(/'/g, "\\'" );
      return `
        <div class="vocab-item">
          <div class="vocab-top-line">
            <div>
              <span class="vocab-word">${this.renderer.escapeHTML(word.word)}</span>
              ${word.phonetic ? `<span class="vocab-phonetic">${this.renderer.escapeHTML(word.phonetic)}</span>` : ''}
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="icon-btn primary" onclick="window.lessonEngine.speakWord('${safeWord}')" aria-label="Speak word">
                <span>🔊</span>
              </button>
              <button class="icon-btn danger" onclick="window.lessonEngine.removeWord('${safeWord}')" aria-label="Remove word">
                <span>❌</span>
              </button>
            </div>
          </div>
          <div class="vocab-definition">${this.renderer.escapeHTML(word.definition)}</div>
          <div style="font-size: 0.75rem; color: var(--text-soft); margin-top: 4px;">
            Saved ${new Date(word.timestamp).toLocaleDateString()}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card-header">
        <h2 class="card-title">📚 My Words</h2>
        <button class="primary-btn secondary" onclick="window.lessonEngine.clearAllWords()" aria-label="Clear all words">
          <span>🗑️</span> Clear All
        </button>
      </div>
      <div class="vocab-list" style="margin-top: var(--space-md);">
        ${wordsHTML}
      </div>
    `;
  }

  /**
   * Attach event listeners for current tab
   */
  attachCurrentTabListeners() {
    if (this.currentTab === 'vocabulary') {
      this.attachVocabularyListeners();
    }
  }

  /**
   * Attach listeners for vocabulary tab
   */
  attachVocabularyListeners() {
    const modeButtons = document.querySelectorAll('.vocab-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.vocabMode = btn.dataset.mode;
        this.flashcardIndex = 0;
        this.renderCurrentTab();
      });
    });
  }

  /**
   * Toggle word save/unsave
   */
  toggleWord(wordData) {
    const isSaved = this.storage.isWordSaved(wordData.word);

    if (isSaved) {
      this.storage.removeWord(wordData.word);
      this.showNotification(`Removed "${wordData.word}"`);
    } else {
      this.storage.addWord(wordData);
      this.showNotification(`Saved "${wordData.word}"`);
    }

    this.myWords = this.storage.loadWords();
    this.renderCurrentTab();
    this.updateSavedWordsCount();
    this.tts.vibrate(10);
  }

  /**
   * Toggle word from vocabulary panel
   */
  toggleWordFromVocab(word, definition, phonetic) {
    this.toggleWord({ word, definition, phonetic });
  }

  /**
   * Remove word
   */
  removeWord(word) {
    this.storage.removeWord(word);
    this.myWords = this.storage.loadWords();
    this.showNotification(`Removed "${word}"`);
    this.renderCurrentTab();
    this.updateSavedWordsCount();
  }

  /**
   * Clear all saved words
   */
  clearAllWords() {
    if (confirm('Are you sure you want to clear all saved words?')) {
      this.storage.clearAllWords();
      this.myWords = [];
      this.showNotification('All words cleared');
      this.renderCurrentTab();
      this.updateSavedWordsCount();
    }
  }

  /**
   * Speak all reading content
   */
  speakAllReading() {
    const reading = this.lessonData.content?.reading;
    if (!reading) return;

    const texts = reading.filter(p => p.type !== 'fact').map(para => para.text);
    this.tts.speakSequence(texts, 1500);
  }

  /**
   * Speak a word
   */
  speakWord(word) {
    this.tts.speak(word);
  }

  /**
   * Flashcard navigation
   */
  flipFlashcard() {
    const card = document.getElementById('flashcard');
    if (card) {
      card.classList.toggle('flipped');
      this.tts.vibrate(15);
    }
  }

  nextFlashcard() {
    if (!this.lessonData.vocabulary?.words) return;
    
    const maxIndex = this.lessonData.vocabulary.words.length - 1;
    if (this.flashcardIndex < maxIndex) {
      this.flashcardIndex++;
    } else {
      this.flashcardIndex = 0;
    }
    
    this.renderCurrentTab();
    this.tts.vibrate(10);
  }

  prevFlashcard() {
    if (!this.lessonData.vocabulary?.words) return;
    
    if (this.flashcardIndex > 0) {
      this.flashcardIndex--;
    } else {
      this.flashcardIndex = this.lessonData.vocabulary.words.length - 1;
    }
    
    this.renderCurrentTab();
    this.tts.vibrate(10);
  }

  /**
   * Quiz methods
   */
  selectQuizAnswer(answerIndex) {
    const quiz = this.lessonData.quiz;
    const questions = Array.isArray(quiz) ? quiz : (quiz.questions || []);
    
    if (questions.length === 0) return;
    
    const question = questions[this.quizState.currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;

    this.quizState.answers.push({
      questionIndex: this.quizState.currentQuestionIndex,
      answerIndex,
      correct: isCorrect
    });

    // Show feedback
    const feedbackEl = document.getElementById('quiz-feedback');
    const options = document.querySelectorAll('.quiz-option');

    options.forEach((opt, i) => {
      opt.disabled = true;
      if (i === question.correct) {
        opt.classList.add('correct');
      } else if (i === answerIndex && !isCorrect) {
        opt.classList.add('wrong');
      }
    });

    const feedback = question.fb || question.feedback || (isCorrect ? 'Correct!' : 'Incorrect');

    if (feedbackEl) {
      feedbackEl.innerHTML = `
        <p class="quiz-feedback ${isCorrect ? 'correct' : 'wrong'}">
          ${isCorrect ? '✓' : '✗'} ${feedback}
        </p>
        <button class="primary-btn" style="margin-top: 12px;" onclick="window.lessonEngine.nextQuizQuestion()">
          ${this.quizState.currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
        </button>
      `;
    }
    
    this.tts.vibrate(isCorrect ? 30 : 50);
  }

  nextQuizQuestion() {
    const quiz = this.lessonData.quiz;
    const questions = Array.isArray(quiz) ? quiz : (quiz.questions || []);
    
    if (this.quizState.currentQuestionIndex < questions.length - 1) {
      this.quizState.currentQuestionIndex++;
      this.renderCurrentTab();
    } else {
      this.quizState.completed = true;
      this.renderCurrentTab();
    }
  }

  resetQuiz() {
    this.quizState = {
      currentQuestionIndex: 0,
      answers: [],
      completed: false
    };
    this.renderCurrentTab();
  }

  /**
   * Show notification
   */
  showNotification(message) {
    const notif = document.getElementById('notification');
    const textEl = document.getElementById('notification-text');

    if (notif && textEl) {
      textEl.textContent = message;
      notif.classList.add('visible');

      setTimeout(() => {
        notif.classList.remove('visible');
      }, 2500);
    }
  }
}