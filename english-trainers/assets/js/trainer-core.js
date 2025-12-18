/**
 * ABSTRACT TRAINER ENGINE - CORE
 * State machine, lifecycle, game logic, state & stats.
 */

class Trainer {
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

    // Motivational phrases
    this._motivationalPhrases = {
      streak: [
        'Огонь! 🔥 Не останавливайся!',
        'Отлично! Продолжай в том же духе!',
        'Ты в ударе! Вперёд к победе!',
        'Превосходно! Ещё немного!',
        'Невероятная серия! 🏆'
      ],
      accuracy: [
        'Молодчина! Ещё чуть-чуть и ты станешь профи!',
        'Отличная работа! Так держать!',
        'Прекрасно! Ты быстро учишься!',
        'Великолепно! Ты на верном пути!'
      ],
      random: [
        'Правильно! ✅',
        'Точно! 🎯',
        'Супер! ⭐',
        'Класс! 👏',
        'Браво! 🎉'
      ]
    };
  }

  /* ========================================
     LIFECYCLE METHODS
     ======================================== */

  init() {
    this._cacheDOMElements();
    this._attachEventListeners();
    this._setState({ phase: 'IDLE' });
    this._injectEffectsCSS();
    this.emit('init');
  }

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

  pause() {
    if (this.state.phase !== 'PLAYING') return;
    this._stopTimer();
    this._stopTTS();
    this._setState({ phase: 'PAUSED' });
    this.emit('pause');
  }

  resume() {
    if (this.state.phase !== 'PAUSED') return;
    this._setState({ phase: 'PLAYING' });
    if (this.config.timerMode) this._startTimer();
    this.emit('resume');
  }

  end() {
    this._stopTimer();
    this._stopTTS();
    const stats = this._calculateStats();
    this._setState({ phase: 'GAME_OVER' });
    this.emit('end', stats);
    this._showResults(stats);
  }

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

  /* ABSTRACT METHODS (to override in children) */

  generateQuestion() {
    throw new Error('generateQuestion() must be implemented by child class');
  }

  validateAnswer(selectedIndex) {
    return selectedIndex === this.state.currentQuestion.correctIndex;
  }

  getFeedback(isCorrect) {
    if (isCorrect) {
      return this._getMotivationalPraise();
    } else {
      const correct = this.state.currentQuestion.options[this.state.currentQuestion.correctIndex];
      return `Wrong. Correct answer: <strong>${correct}</strong>`;
    }
  }

  /* GAME LOGIC */

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
      const streakBonus = this._calculateStreakBonus(this.state.streak + 1);
      newState.score = this.state.score + 10 + streakBonus;
      newState.streak = this.state.streak + 1;
      newState.maxStreak = Math.max(this.state.maxStreak, newState.streak);
      newState.correctAnswers = this.state.correctAnswers + 1;
      this._triggerSuccessEffects(newState.streak);
    } else {
      newState.streak = 0;
      newState.lives = this.state.lives - 1;
    }

    this._setState(newState);
    this._showFeedback(isCorrect, selectedIndex);
    this.emit('answer', { isCorrect, selectedIndex });

    if (newState.lives <= 0) {
      await this._delay(2000);
      this.end();
    } else {
      await this._delay(1500);
      this._nextQuestion();
    }
  }

  _nextQuestion() {
    try {
      const question = this.generateQuestion();

      if (!this._validateQuestion(question)) {
        throw new Error('Invalid question structure from generateQuestion()');
      }

      this._setState({
        phase: 'PLAYING',
        currentQuestion: question,
        timeRemaining: this.config.timeLimit
      });

      this._renderQuestion(question);
      this._speakQuestion(question.question);
      this.emit('question', question);

      if (this.config.timerMode) {
        this._startTimer();
      }
    } catch (error) {
      window.debugTrainer && window.debugTrainer(error);
      this.emit('error', error);
      this.end();
    }
  }

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

  _setState(updates) {
    const prevState = this.state;
    this.state = Object.freeze({ ...this.state, ...updates });
    this.emit('stateChange', { prev: prevState, current: this.state });
    this._scheduleUpdate('state');
  }

  getState() {
    return { ...this.state };
  }

  getConfig() {
    return { ...this.config };
  }
}
