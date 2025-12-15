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
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError(error.message);
    }
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
    this.updateSidebar();
  }

  /**
   * Render main interface structure
   */
  renderInterface() {
    const { title, subtitle, meta } = this.lessonData;
    const { level = 'A1', duration = 30 } = meta || {};
    
    // ИСПРАВЛЕНО: Grammar всегда показывается, если есть данные
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
          </div>

          <div class="card">
            <div class="card-inner" id="tab-content">
              <!-- Dynamic content -->
            </div>
          </div>
        </div>

        <aside class="sidebar">
          <div class="sidebar-header">
            <h2 class="sidebar-title">My Words</h2>
            <span class="sidebar-count" id="word-count">0</span>
          </div>
          <div class="sidebar-body" id="sidebar-words">
            <!-- Dynamic content -->
          </div>
        </aside>
      </div>
    `;
    
    // ИСПРАВЛЕНО: убран дублирующий вызов attachVocabularyListeners
  }

  /**
   * Switch tab
   */
  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Reset flashcard when entering vocabulary tab
    if (tabName === 'vocabulary' && this.vocabMode === 'flashcard') {
      // Remove flipped state when switching tabs
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
        // ИСПРАВЛЕНО: передаём flashcardIndex отдельным параметром
        html = this.renderer.renderVocabulary(this.vocabMode, this.myWords, this.flashcardIndex);
        break;
      case 'grammar':
        html = this.renderer.renderGrammar();
        break;
      case 'quiz':
        html = this.renderer.renderQuiz(this.quizState);
        break;
    }

    contentEl.innerHTML = html;
    this.attachCurrentTabListeners();
  }

  /**
   * Attach event listeners for current tab
   */
  attachCurrentTabListeners() {
    if (this.currentTab === 'reading') {
      this.attachReadingListeners();
    } else if (this.currentTab === 'vocabulary') {
      this.attachVocabularyListeners();
    }
  }

  /**
   * Attach listeners for reading tab
   */
  attachReadingListeners() {
    document.querySelectorAll('.word-clickable').forEach(wordEl => {
      wordEl.addEventListener('click', () => {
        const word = wordEl.dataset.word;
        const definition = wordEl.dataset.definition;
        const phonetic = wordEl.dataset.phonetic || '';
        this.toggleWord({ word, definition, phonetic });
      });
    });
  }

  /**
   * Attach listeners for vocabulary tab
   */
  attachVocabularyListeners() {
    const modeButtons = document.querySelectorAll('.vocab-mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.vocabMode = btn.dataset.mode;
        this.flashcardIndex = 0; // Reset when switching modes
        this.renderCurrentTab(); // КРИТИЧНО: перерисовать интерфейс
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
    this.updateSidebar();
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
    this.updateSidebar();
  }

  /**
   * Update sidebar
   */
  updateSidebar() {
    const wordsEl = document.getElementById('sidebar-words');
    const countEl = document.getElementById('word-count');

    if (wordsEl) {
      wordsEl.innerHTML = this.renderer.renderSidebar(this.myWords);
    }

    if (countEl) {
      countEl.textContent = this.myWords.length;
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
      this.flashcardIndex = 0; // Loop back to start
    }
    
    this.renderCurrentTab();
    this.tts.vibrate(10);
  }

  prevFlashcard() {
    if (!this.lessonData.vocabulary?.words) return;
    
    if (this.flashcardIndex > 0) {
      this.flashcardIndex--;
    } else {
      // Loop to end
      this.flashcardIndex = this.lessonData.vocabulary.words.length - 1;
    }
    
    this.renderCurrentTab();
    this.tts.vibrate(10);
  }

  /**
   * Quiz methods - support both array and object format
   */
  selectQuizAnswer(answerIndex) {
    // Get questions array (support both formats)
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

    // Get feedback text (support both 'fb' and 'feedback')
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