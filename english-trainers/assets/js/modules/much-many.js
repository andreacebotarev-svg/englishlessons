/**
 * MUCH/MANY/A LOT OF TRAINER - STATIC CENTERED VERSION
 * Single question card with timer pressure system
 */

class MuchManyTrainer {
  constructor(config = {}) {
    this.isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    this.config = {
      maxLives: config.maxLives ?? 5,
      baseDuration: this.isMobile ? 6000 : 5000, // 6s → 0.5s over 10 minutes
      minDuration: 500,
      speedUpFactor: 0.7, // Wrong answer makes timer 30% faster
      powerUpInterval: 60000,
      ...config
    };

    this.state = {
      score: 0,
      lives: this.config.maxLives,
      correctAnswers: 0,
      totalAnswers: 0,
      gameStartTime: null,
      isPlaying: false,
      currentSpeed: 1.0,
      currentLane: 1 // 0=much, 1=many, 2=a lot of
    };

    this.currentQuestion = null;
    this.questionTimer = null;

    this.powerUps = {
      slowMotionActive: false,
      shieldActive: false,
      spawnTimer: null
    };

    this.touchStartX = 0;
    this.touchStartY = 0;

    this._dom = {};

    this._effects = new EffectsManager({
      enableHaptic: true,
      hapticIntensity: 1.0
    });

    this.vocabulary = {
      countable: [
        { en: 'apples', ru: 'яблок' },
        { en: 'books', ru: 'книг' },
        { en: 'cars', ru: 'машин' },
        { en: 'students', ru: 'студентов' },
        { en: 'questions', ru: 'вопросов' },
        { en: 'friends', ru: 'друзей' },
        { en: 'people', ru: 'людей' },
        { en: 'houses', ru: 'домов' },
        { en: 'trees', ru: 'деревьев' },
        { en: 'animals', ru: 'животных' }
      ],
      uncountable: [
        { en: 'water', ru: 'воды' },
        { en: 'money', ru: 'денег' },
        { en: 'time', ru: 'времени' },
        { en: 'information', ru: 'информации' },
        { en: 'sugar', ru: 'сахара' },
        { en: 'coffee', ru: 'кофе' },
        { en: 'milk', ru: 'молока' },
        { en: 'bread', ru: 'хлеба' },
        { en: 'music', ru: 'музыки' },
        { en: 'love', ru: 'любви' }
      ]
    };

    // Answer mapping: lane → answer
    this.laneAnswers = ['much', 'many', 'a lot of'];

    this._initDOM();
    this._bindControls();
  }

  _initDOM() {
    this._dom = {
      startScreen: document.getElementById('start-screen'),
      gameArena: document.getElementById('game-arena'),
      gameOverScreen: document.getElementById('game-over-screen'),
      answerPanel: document.getElementById('answer-panel'),
      questionCard: document.getElementById('question-card'),
      questionText: document.getElementById('question-text'),
      timerBar: document.getElementById('timer-bar'),
      laneIndicators: document.querySelectorAll('.lane-indicator'),
      player: document.getElementById('player'),
      score: document.getElementById('score'),
      speed: document.getElementById('speed'),
      lives: document.getElementById('lives'),
      powerUpIndicator: document.getElementById('power-up-indicator'),
      powerUpText: document.getElementById('power-up-text'),
      finalScore: document.getElementById('final-score'),
      finalAccuracy: document.getElementById('final-accuracy'),
      finalDuration: document.getElementById('final-duration'),
      answerButtons: document.querySelectorAll('.answer-btn')
    };
  }

  _bindControls() {
    // Keyboard: A/D or arrows
    document.addEventListener('keydown', (e) => {
      if (!this.state.isPlaying) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this._moveLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this._moveLane(1);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this._submitAnswer();
      }
    });

    // Touch: swipe
    document.addEventListener('touchstart', (e) => {
      if (!this.state.isPlaying) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!this.state.isPlaying) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - this.touchStartX;
      const diffY = touchEndY - this.touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this._moveLane(1);
        } else {
          this._moveLane(-1);
        }
      }
    }, { passive: true });
  }

  start() {
    this.state = {
      score: 0,
      lives: this.config.maxLives,
      correctAnswers: 0,
      totalAnswers: 0,
      gameStartTime: Date.now(),
      isPlaying: true,
      currentSpeed: 1.0,
      currentLane: 1
    };

    this._dom.startScreen.style.display = 'none';
    this._dom.gameOverScreen.style.display = 'none';
    this._dom.gameArena.style.display = 'flex';
    this._dom.answerPanel.style.display = 'flex';

    this._updateUI();
    this._updateLaneIndicators();
    this._showQuestion();
    this._startPowerUpSpawning();

    this._effects._haptic.vibrate('impact');
  }

  restart() {
    this._cleanup();
    this.start();
  }

  _showQuestion() {
    if (!this.state.isPlaying) return;

    // Generate question
    this.currentQuestion = this._generateQuestion();
    
    // Display
    this._dom.questionText.textContent = this.currentQuestion.text;
    this._dom.questionCard.classList.add('active');
    
    // Remove old hint
    const oldHint = this._dom.questionCard.querySelector('.hint');
    if (oldHint) oldHint.remove();
    
    // Start timer
    const duration = this._calculateDuration();
    this._startQuestionTimer(duration);
  }

  _generateQuestion() {
    const sentenceType = Math.random();
    const wordType = Math.random();
    
    let word, isCountable;
    if (wordType < 0.5) {
      word = this.vocabulary.countable[Math.floor(Math.random() * this.vocabulary.countable.length)];
      isCountable = true;
    } else {
      word = this.vocabulary.uncountable[Math.floor(Math.random() * this.vocabulary.uncountable.length)];
      isCountable = false;
    }

    if (sentenceType < 0.33) {
      // QUESTION
      if (isCountable) {
        return {
          text: `How ___ ${word.en} do you need?`,
          correctAnswer: 'many',
          hint: 'Исчисляемое → many',
          type: 'countable-question'
        };
      } else {
        return {
          text: `How ___ ${word.en} is there?`,
          correctAnswer: 'much',
          hint: 'Неисчисляемое → much',
          type: 'uncountable-question'
        };
      }
    } else if (sentenceType < 0.66) {
      // STATEMENT
      if (isCountable) {
        return {
          text: `I have ___ ${word.en}`,
          correctAnswer: 'many',
          hint: 'Исчисляемое → many',
          type: 'countable-statement'
        };
      } else {
        return {
          text: `There is ___ ${word.en} here`,
          correctAnswer: 'much',
          hint: 'Неисчисляемое → much',
          type: 'uncountable-statement'
        };
      }
    } else {
      // NEGATIVE
      if (isCountable) {
        return {
          text: `I don't have ___ ${word.en}`,
          correctAnswer: 'many',
          hint: 'Исчисляемое → many',
          type: 'countable-negative'
        };
      } else {
        return {
          text: `There isn't ___ ${word.en}`,
          correctAnswer: 'much',
          hint: 'Неисчисляемое → much',
          type: 'uncountable-negative'
        };
      }
    }
  }

  _calculateDuration() {
    const elapsed = (Date.now() - this.state.gameStartTime) / 1000;
    const k = Math.log(this.config.minDuration / this.config.baseDuration) / 600;
    const duration = Math.max(
      this.config.minDuration,
      this.config.baseDuration * Math.exp(k * elapsed)
    );

    this.state.currentSpeed = this.config.baseDuration / duration;
    this._dom.speed.textContent = `${this.state.currentSpeed.toFixed(1)}x`;

    return duration;
  }

  _startQuestionTimer(duration) {
    // Clear existing timer
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
    }

    // Start visual timer bar
    this._dom.timerBar.style.setProperty('--duration', `${duration}ms`);
    this._dom.timerBar.classList.remove('running');
    
    requestAnimationFrame(() => {
      this._dom.timerBar.classList.add('running');
    });

    // Set timeout
    this.questionTimer = setTimeout(() => {
      this._handleTimeout();
    }, duration);
  }

  _moveLane(direction) {
    const newLane = this.state.currentLane + direction;
    
    if (newLane >= 0 && newLane <= 2) {
      this.state.currentLane = newLane;
      this._updateLaneIndicators();
      
      if (!this.isMobile || this.state.currentLane % 2 === 0) {
        this._effects._haptic.vibrate('tick');
      }
    }
  }

  _updateLaneIndicators() {
    // Update lane indicator visuals
    this._dom.laneIndicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === this.state.currentLane);
    });
    
    // Update button highlights
    this._dom.answerButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === this.state.currentLane);
    });
  }

  throwStone(answer) {
    if (!this.state.isPlaying || !this.currentQuestion) return;
    this._submitAnswer(answer);
  }

  _submitAnswer(answer) {
    if (!answer) {
      answer = this.laneAnswers[this.state.currentLane];
    }

    // Clear timer
    clearTimeout(this.questionTimer);
    this._dom.timerBar.classList.remove('running');

    this.state.totalAnswers++;

    const isCorrect = answer === this.currentQuestion.correctAnswer;

    if (isCorrect) {
      this._handleCorrect();
    } else {
      this._handleWrong();
    }
  }

  _handleCorrect() {
    this.state.correctAnswers++;
    this.state.score += 10;

    // Visual feedback
    this._dom.questionCard.classList.add('correct');
    this._dom.player.classList.add('throwing');
    
    this._effects.triggerSuccessEffects(0, this._dom.questionCard);
    this._updateUI();

    // Next question
    setTimeout(() => {
      this._dom.questionCard.classList.remove('active', 'correct');
      this._dom.player.classList.remove('throwing');
      
      setTimeout(() => {
        this._showQuestion();
      }, 300);
    }, 500);
  }

  _handleWrong() {
    // Visual feedback
    this._dom.questionCard.classList.add('wrong');
    this._effects.triggerErrorEffects();

    // Show hint
    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.innerHTML = `💡 ${this.currentQuestion.hint}`;
    this._dom.questionCard.appendChild(hint);

    // Retry with faster timer
    setTimeout(() => {
      this._dom.questionCard.classList.remove('wrong');
      
      const newDuration = this._calculateDuration() * this.config.speedUpFactor;
      this._startQuestionTimer(newDuration);
    }, 1000);
  }

  _handleTimeout() {
    // Missed question
    if (this.powerUps.shieldActive) {
      this.powerUps.shieldActive = false;
      this._dom.player.textContent = '🧑';
      this._effects._haptic.vibrate('impact');
    } else {
      this.state.lives--;
      this._effects._haptic.vibrate('error');
    }

    this._updateUI();

    if (this.state.lives <= 0) {
      this._gameOver();
    } else {
      // Show timeout feedback
      this._dom.questionCard.classList.add('wrong');
      
      setTimeout(() => {
        this._dom.questionCard.classList.remove('active', 'wrong');
        
        setTimeout(() => {
          this._showQuestion();
        }, 300);
      }, 500);
    }
  }

  _startPowerUpSpawning() {
    const spawnPowerUp = () => {
      if (!this.state.isPlaying) return;

      const type = Math.random() < 0.5 ? 'shield' : 'slow-motion';
      this._activatePowerUp(type);

      this.powerUps.spawnTimer = setTimeout(spawnPowerUp, this.config.powerUpInterval);
    };

    this.powerUps.spawnTimer = setTimeout(spawnPowerUp, this.config.powerUpInterval);
  }

  _activatePowerUp(type) {
    this._effects._haptic.vibrate('milestone');

    if (type === 'shield') {
      this.powerUps.shieldActive = true;
      this._dom.player.textContent = '🛡️🧑';
      this._showPowerUpIndicator('🛡️ Shield Active');
    } else if (type === 'slow-motion') {
      this._showPowerUpIndicator('⏱️ Slow Motion');
      
      // Pause timer
      clearTimeout(this.questionTimer);
      this._dom.timerBar.style.animationPlayState = 'paused';
      
      setTimeout(() => {
        // Resume timer
        this._dom.timerBar.style.animationPlayState = 'running';
        const remainingDuration = 3000; // Continue with extra time
        this._startQuestionTimer(remainingDuration);
        this._hidePowerUpIndicator();
      }, 3000);
    }
  }

  _showPowerUpIndicator(text) {
    this._dom.powerUpText.textContent = text;
    this._dom.powerUpIndicator.style.display = 'flex';
  }

  _hidePowerUpIndicator() {
    this._dom.powerUpIndicator.style.display = 'none';
  }

  _updateUI() {
    this._dom.score.textContent = this.state.score;
    this._dom.lives.textContent = '❤️'.repeat(this.state.lives) + '💔'.repeat(this.config.maxLives - this.state.lives);
  }

  _gameOver() {
    this.state.isPlaying = false;
    this._cleanup();

    const duration = Math.floor((Date.now() - this.state.gameStartTime) / 1000);
    const accuracy = this.state.totalAnswers > 0 
      ? Math.round((this.state.correctAnswers / this.state.totalAnswers) * 100) 
      : 0;

    this._dom.finalScore.textContent = this.state.score;
    this._dom.finalAccuracy.textContent = `${accuracy}%`;
    this._dom.finalDuration.textContent = `${duration}с`;

    this._dom.gameArena.style.display = 'none';
    this._dom.answerPanel.style.display = 'none';
    this._dom.gameOverScreen.style.display = 'flex';

    this._effects._haptic.vibrate('error');
  }

  _cleanup() {
    if (this.questionTimer) clearTimeout(this.questionTimer);
    if (this.powerUps.spawnTimer) clearTimeout(this.powerUps.spawnTimer);
    
    this._dom.timerBar.classList.remove('running');
    this._dom.questionCard.classList.remove('active', 'correct', 'wrong');
  }
}

if (typeof window !== 'undefined') {
  window.MuchManyTrainer = MuchManyTrainer;
}
