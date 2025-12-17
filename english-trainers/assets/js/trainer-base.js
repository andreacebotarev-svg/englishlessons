/**
 * ABSTRACT TRAINER ENGINE
 * Senior-level architecture: State machine + Event system + Performance optimizations
 * 
 * Design patterns:
 * - Template Method: abstract methods for child classes
 * - State Machine: IDLE → PLAYING → FEEDBACK → GAME_OVER
 * - Observer: event emitter for UI decoupling
 * - Dependency Injection: config object
 */

class Trainer {
  /**
   * @param {Object} config - Trainer configuration
   * @param {string} config.name - Trainer display name
   * @param {number} config.maxLives - Starting lives (default: 3)
   * @param {number} config.streakBonus - Points for streak milestones (default: 10)
   * @param {boolean} config.timerMode - Enable countdown timer (default: false)
   * @param {number} config.timeLimit - Seconds per question in timer mode (default: 30)
   * @param {boolean} config.enableTTS - Enable text-to-speech (default: true)
   */
  constructor(config = {}) {
    // Immutable config with defaults
    this.config = Object.freeze({
      name: config.name || 'Trainer',
      maxLives: config.maxLives ?? 3,
      streakBonus: config.streakBonus ?? 10,
      timerMode: config.timerMode ?? false,
      timeLimit: config.timeLimit ?? 30,
      enableTTS: config.enableTTS ?? true,
      ...config
    });

    // State machine (immutable updates via _setState)
    this.state = {
      phase: 'IDLE', // IDLE | PLAYING | FEEDBACK | GAME_OVER
      score: 0,
      streak: 0,
      maxStreak: 0,
      lives: this.config.maxLives,
      questionsAnswered: 0,
      correctAnswers: 0,
      currentQuestion: null,
      lastAnswer: null,
      timeRemaining: this.config.timeLimit,
      startTime: null
    };

    // Event listeners registry
    this._listeners = {};

    // DOM cache (lazy-loaded)
    this._dom = {};

    // Timer interval ID
    this._timerInterval = null;

    // RAF handle for batched updates
    this._rafHandle = null;
    this._pendingUpdates = new Set();

    // Debounced resize handler
    this._resizeDebounce = null;

    // TTS (Text-to-Speech)
    this._tts = null;
    if (this.config.enableTTS && 'speechSynthesis' in window) {
      this._tts = window.speechSynthesis;
    }

    // Bind methods for event listeners
    this._handleResize = this._handleResize.bind(this);
    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
  }

  /* ========================================
     LIFECYCLE METHODS
     ======================================== */

  /**
   * Initialize trainer (called once)
   */
  init() {
    this._cacheDOMElements();
    this._attachEventListeners();
    this._setState({ phase: 'IDLE' });
    this.emit('init');
  }

  /**
   * Start new game
   */
  start() {
    this._setState({
      phase: 'PLAYING',
      score: 0,
      streak: 0,
      maxStreak: 0,
      lives: this.config.maxLives,
      questionsAnswered: 0,
      correctAnswers: 0,
      startTime: Date.now()
    });

    this._nextQuestion();
    this.emit('start');

    if (this.config.timerMode) {
      this._startTimer();
    }
  }

  /**
   * Pause game (timer mode)
   */
  pause() {
    if (this.state.phase !== 'PLAYING') return;
    this._stopTimer();
    this._stopTTS();
    this._setState({ phase: 'PAUSED' });
    this.emit('pause');
  }

  /**
   * Resume game
   */
  resume() {
    if (this.state.phase !== 'PAUSED') return;
    this._setState({ phase: 'PLAYING' });
    if (this.config.timerMode) this._startTimer();
    this.emit('resume');
  }

  /**
   * End game
   */
  end() {
    this._stopTimer();
    this._stopTTS();
    const stats = this._calculateStats();
    this._setState({ phase: 'GAME_OVER' });
    this.emit('end', stats);
    this._showResults(stats);
  }

  /**
   * Cleanup (called on destroy)
   */
  destroy() {
    this._stopTimer();
    this._stopTTS();
    this._cancelRAF();
    window.removeEventListener('resize', this._handleResize);
    document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    this._listeners = {};
    this._dom = {};
    this.emit('destroy');
  }

  /* ========================================
     ABSTRACT METHODS (must implement in child)
     ======================================== */

  /**
   * Generate new question
   * @returns {Object} { question: string, options: string[], correctIndex: number }
   */
  generateQuestion() {
    throw new Error('generateQuestion() must be implemented by child class');
  }

  /**
   * Validate answer (optional override for custom logic)
   * @param {number} selectedIndex - User's selected option index
   * @returns {boolean}
   */
  validateAnswer(selectedIndex) {
    return selectedIndex === this.state.currentQuestion.correctIndex;
  }

  /**
   * Get feedback message (optional override)
   * @param {boolean} isCorrect
   * @returns {string}
   */
  getFeedback(isCorrect) {
    if (isCorrect) {
      const messages = ['Correct!', 'Great!', 'Perfect!', 'Excellent!', 'Well done!'];
      return messages[Math.floor(Math.random() * messages.length)];
    } else {
      const correct = this.state.currentQuestion.options[this.state.currentQuestion.correctIndex];
      return `Wrong. Correct answer: <strong>${correct}</strong>`;
    }
  }

  /* ========================================
     GAME LOGIC
     ======================================== */

  /**
   * Handle user answer
   * @param {number} selectedIndex
   */
  async submitAnswer(selectedIndex) {
    if (this.state.phase !== 'PLAYING') return;

    this._stopTimer();
    this._stopTTS();
    this._setState({ phase: 'FEEDBACK' });

    const isCorrect = this.validateAnswer(selectedIndex);
    const newState = {
      questionsAnswered: this.state.questionsAnswered + 1,
      lastAnswer: { selectedIndex, isCorrect }
    };

    if (isCorrect) {
      // Correct answer logic
      const streakBonus = this._calculateStreakBonus(this.state.streak + 1);
      newState.score = this.state.score + 10 + streakBonus;
      newState.streak = this.state.streak + 1;
      newState.maxStreak = Math.max(this.state.maxStreak, newState.streak);
      newState.correctAnswers = this.state.correctAnswers + 1;
    } else {
      // Wrong answer logic
      newState.streak = 0;
      newState.lives = this.state.lives - 1;
    }

    this._setState(newState);
    this._showFeedback(isCorrect, selectedIndex);
    this.emit('answer', { isCorrect, selectedIndex });

    // Check game over condition
    if (newState.lives <= 0) {
      await this._delay(2000);
      this.end();
    } else {
      await this._delay(1500);
      this._nextQuestion();
    }
  }

  /**
   * Load next question
   * @private
   */
  _nextQuestion() {
    try {
      const question = this.generateQuestion();
      
      // Validate question structure
      if (!this._validateQuestion(question)) {
        throw new Error('Invalid question structure from generateQuestion()');
      }

      this._setState({
        phase: 'PLAYING',
        currentQuestion: question,
        timeRemaining: this.config.timeLimit
      });

      this._renderQuestion(question);
      this._speakQuestion(question.question); // TTS
      this.emit('question', question);

      if (this.config.timerMode) {
        this._startTimer();
      }
    } catch (error) {
      console.error('Error generating question:', error);
      this.emit('error', error);
      this.end();
    }
  }

  /**
   * Calculate streak bonus points
   * @private
   */
  _calculateStreakBonus(streak) {
    const milestones = [5, 10, 15, 20];
    const bonuses = [5, 10, 20, 30];
    
    for (let i = milestones.length - 1; i >= 0; i--) {
      if (streak >= milestones[i] && streak % milestones[i] === 0) {
        return bonuses[i];
      }
    }
    return 0;
  }

  /**
   * Calculate final statistics
   * @private
   */
  _calculateStats() {
    const accuracy = this.state.questionsAnswered > 0
      ? Math.round((this.state.correctAnswers / this.state.questionsAnswered) * 100)
      : 0;
    
    const duration = this.state.startTime
      ? Math.round((Date.now() - this.state.startTime) / 1000)
      : 0;

    return {
      score: this.state.score,
      questionsAnswered: this.state.questionsAnswered,
      correctAnswers: this.state.correctAnswers,
      accuracy,
      maxStreak: this.state.maxStreak,
      duration
    };
  }

  /* ========================================
     TIMER MANAGEMENT
     ======================================== */

  _startTimer() {
    this._stopTimer();
    this._timerInterval = setInterval(() => {
      const newTime = this.state.timeRemaining - 1;
      
      if (newTime <= 0) {
        this._stopTimer();
        this.submitAnswer(-1); // Auto-submit as wrong
      } else {
        this._setState({ timeRemaining: newTime });
        this._scheduleUpdate('timer');
      }
    }, 1000);
  }

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  /* ========================================
     TEXT-TO-SPEECH
     ======================================== */

  /**
   * Speak question text (removes blanks)
   * @private
   */
  _speakQuestion(questionText) {
    if (!this._tts || !this.config.enableTTS) return;

    // Remove HTML tags and blank placeholders
    const cleanText = questionText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/____/g, 'blank') // Replace ____ with "blank"
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    this._tts.speak(utterance);
  }

  /**
   * Stop TTS
   * @private
   */
  _stopTTS() {
    if (this._tts) {
      this._tts.cancel();
    }
  }

  /* ========================================
     STATE MANAGEMENT
     ======================================== */

  /**
   * Immutable state update
   * @private
   */
  _setState(updates) {
    const prevState = this.state;
    this.state = Object.freeze({ ...this.state, ...updates });
    this.emit('stateChange', { prev: prevState, current: this.state });
    this._scheduleUpdate('state');
  }

  /* ========================================
     RENDERING (batched via RAF)
     ======================================== */

  /**
   * Schedule UI update (batched)
   * @private
   */
  _scheduleUpdate(component) {
    this._pendingUpdates.add(component);
    
    if (!this._rafHandle) {
      this._rafHandle = requestAnimationFrame(() => {
        this._flushUpdates();
        this._rafHandle = null;
      });
    }
  }

  /**
   * Flush pending updates
   * @private
   */
  _flushUpdates() {
    if (this._pendingUpdates.has('state')) {
      this._updateStats();
    }
    if (this._pendingUpdates.has('timer')) {
      this._updateTimer();
    }
    this._pendingUpdates.clear();
  }

  _cancelRAF() {
    if (this._rafHandle) {
      cancelAnimationFrame(this._rafHandle);
      this._rafHandle = null;
    }
  }

  /**
   * Render question to DOM
   * @private
   */
  _renderQuestion(question) {
    const container = this._dom.questionContainer;
    if (!container) return;

    // Sanitize options but allow HTML in question (for <span class="blank">)
    container.innerHTML = `
      <div class="question" role="heading" aria-level="2">
        ${question.question}
      </div>
      <div class="options" role="radiogroup" aria-label="Answer options">
        ${question.options.map((opt, i) => `
          <button class="option" 
                  role="radio" 
                  aria-checked="false"
                  data-index="${i}"
                  onclick="window.trainer.submitAnswer(${i})">
            ${this._escapeHTML(opt)}
          </button>
        `).join('')}
      </div>
      <div id="feedback" class="feedback hidden" role="alert" aria-live="polite"></div>
    `;
  }

  /**
   * Show answer feedback
   * @private
   */
  _showFeedback(isCorrect, selectedIndex) {
    const options = this._dom.questionContainer?.querySelectorAll('.option');
    const feedbackEl = document.getElementById('feedback');

    if (options) {
      options.forEach((opt, i) => {
        opt.disabled = true;
        if (i === this.state.currentQuestion.correctIndex) {
          opt.classList.add('correct');
        } else if (i === selectedIndex && !isCorrect) {
          opt.classList.add('wrong');
        }
      });
    }

    if (feedbackEl) {
      feedbackEl.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
      feedbackEl.innerHTML = this.getFeedback(isCorrect);
    }
  }

  /**
   * Update stats display
   * @private
   */
  _updateStats() {
    // Score
    const scoreEl = this._dom.score;
    if (scoreEl) scoreEl.textContent = this.state.score;

    // Streak
    const streakEl = this._dom.streak;
    if (streakEl) {
      streakEl.textContent = `🔥 ${this.state.streak}`;
      streakEl.classList.toggle('hidden', this.state.streak < 3);
    }

    // Lives
    const livesEl = this._dom.lives;
    if (livesEl) {
      livesEl.innerHTML = '❤️'.repeat(this.state.lives) + 
                          '💔'.repeat(this.config.maxLives - this.state.lives);
    }
  }

  /**
   * Update timer display
   * @private
   */
  _updateTimer() {
    const timerEl = this._dom.timer;
    if (timerEl) {
      timerEl.textContent = this.state.timeRemaining;
      timerEl.classList.toggle('warning', this.state.timeRemaining <= 5);
    }
  }

  /**
   * Show results screen
   * @private
   */
  _showResults(stats) {
    const container = this._dom.questionContainer;
    if (!container) return;

    const grade = stats.accuracy >= 90 ? '🏆' :
                  stats.accuracy >= 70 ? '⭐' :
                  stats.accuracy >= 50 ? '👍' : '💪';

    container.innerHTML = `
      <div class="results" style="text-align: center; animation: scaleIn 0.4s ease-out;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">${grade}</div>
        <h2 style="margin-bottom: 2rem;">Game Over!</h2>
        
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div class="stat-card card" style="padding: 1rem;">
            <div style="font-size: 2rem; color: var(--accent);">${stats.score}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted);">Final Score</div>
          </div>
          <div class="stat-card card" style="padding: 1rem;">
            <div style="font-size: 2rem; color: var(--accent-success);">${stats.accuracy}%</div>
            <div style="font-size: 0.9rem; color: var(--text-muted);">Accuracy</div>
          </div>
          <div class="stat-card card" style="padding: 1rem;">
            <div style="font-size: 2rem; color: var(--accent-warning);">${stats.maxStreak}</div>
            <div style="font-size: 0.9rem; color: var(--text-muted);">Max Streak</div>
          </div>
          <div class="stat-card card" style="padding: 1rem;">
            <div style="font-size: 2rem;">${stats.duration}s</div>
            <div style="font-size: 0.9rem; color: var(--text-muted);">Duration</div>
          </div>
        </div>

        <button class="btn btn-primary" onclick="window.trainer.start()">
          🔄 Play Again
        </button>
      </div>
    `;
  }

  /* ========================================
     EVENT SYSTEM
     ======================================== */

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this._listeners[event]) return;
    this._listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /* ========================================
     DOM MANAGEMENT
     ======================================== */

  _cacheDOMElements() {
    this._dom = {
      questionContainer: document.getElementById('question-container'),
      score: document.getElementById('score'),
      streak: document.getElementById('streak'),
      lives: document.getElementById('lives'),
      timer: document.getElementById('timer')
    };
  }

  _attachEventListeners() {
    window.addEventListener('resize', this._handleResize);
    document.addEventListener('visibilitychange', this._handleVisibilityChange);
  }

  _handleResize() {
    clearTimeout(this._resizeDebounce);
    this._resizeDebounce = setTimeout(() => {
      this.emit('resize');
    }, 150);
  }

  _handleVisibilityChange() {
    if (document.hidden && this.state.phase === 'PLAYING') {
      this.pause();
    }
  }

  /* ========================================
     UTILITIES
     ======================================== */

  _validateQuestion(question) {
    return question &&
           typeof question.question === 'string' &&
           Array.isArray(question.options) &&
           question.options.length > 0 &&
           typeof question.correctIndex === 'number' &&
           question.correctIndex >= 0 &&
           question.correctIndex < question.options.length;
  }

  _escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current state (read-only)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get config (read-only)
   */
  getConfig() {
    return { ...this.config };
  }
}
