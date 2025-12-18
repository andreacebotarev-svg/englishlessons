/**
 * TO BE TRAINER V3
 * Dynamic question generation via 5 generators
 */

class ToBeTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'To Be Trainer',
      maxLives: 3,
      ...config
    });

    // Initialize generators (lazy load check)
    this._initGenerators();

    // Question type weights by difficulty
    this.typeWeights = {
      lvl0: { recognition: 1.0 },
      easy: { recognition: 0.3, 'fill-in': 0.7 },
      medium: { recognition: 0.1, 'fill-in': 0.6, 'error-correction': 0.3 },
      hard: { 'fill-in': 0.4, 'error-correction': 0.25, transformation: 0.25, context: 0.1 }
    };

    this._currentDifficulty = 'easy';
    this._manualDifficulty = null;
  }

  _initGenerators() {
    // Check if generators are loaded
    if (typeof RecognitionGenerator === 'undefined') {
      console.error('[ToBeTrainer] RecognitionGenerator not loaded');
      return;
    }

    this.generators = {
      recognition: new RecognitionGenerator(),
      'fill-in': new FillInGenerator(),
      'error-correction': new ErrorCorrectionGenerator(),
      transformation: new TransformationGenerator(),
      context: new ContextGenerator()
    };
  }

  generateQuestion() {
    if (!this._manualDifficulty) {
      this._updateDifficulty();
    } else {
      this._currentDifficulty = this._manualDifficulty;
    }

    // Select question type by weighted random
    const questionType = this._selectQuestionType();

    // Generate question via generator
    const generator = this.generators[questionType];
    if (!generator) {
      console.error(`[ToBeTrainer] Generator not found: ${questionType}`);
      return this._getFallbackQuestion();
    }

    return generator.generate(this._currentDifficulty);
  }

  _selectQuestionType() {
    const weights = this.typeWeights[this._currentDifficulty];
    const types = Object.keys(weights);
    const totalWeight = types.reduce((sum, t) => sum + weights[t], 0);
    
    let random = Math.random() * totalWeight;
    for (const type of types) {
      random -= weights[type];
      if (random <= 0) return type;
    }
    return types[0];
  }

  _getFallbackQuestion() {
    // Emergency fallback if generators fail
    return {
      question: 'I <span class="blank">____</span> happy',
      options: ['am', 'is', 'are'],
      correctIndex: 0,
      metadata: { type: 'fill-in', difficulty: 'easy' }
    };
  }

  getFeedback(isCorrect) {
    if (isCorrect) {
      return this._getMotivationalPraise();
    }

    const metadata = this.state.currentQuestion?.metadata || {};
    const correctOption = this.state.currentQuestion.options[this.state.currentQuestion.correctIndex];

    let feedback = `<div>Wrong. Correct answer: <strong>${correctOption}</strong></div>`;

    // Add type-specific hints
    if (metadata.explanation) {
      feedback += `<div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">💡 ${metadata.explanation}</div>`;
    } else if (metadata.hint) {
      feedback += `<div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">💡 Hint: ${metadata.hint}</div>`;
    }

    return feedback;
  }

  _updateDifficulty() {
    const { questionsAnswered, correctAnswers } = this.state;
    const accuracy = questionsAnswered > 0 ? correctAnswers / questionsAnswered : 0;

    if (questionsAnswered < 5) {
      this._currentDifficulty = 'easy';
    } else if (questionsAnswered < 15) {
      this._currentDifficulty = accuracy >= 0.75 ? 'medium' : 'easy';
    } else {
      if (accuracy >= 0.85) this._currentDifficulty = 'hard';
      else if (accuracy >= 0.7) this._currentDifficulty = 'medium';
      else this._currentDifficulty = 'easy';
    }
  }

  _getMotivationalPraise() {
    const messages = [
      'Perfect! 💯',
      'Correct! 🎯',
      'Excellent! ⭐',
      'Well done! 👏',
      'Great job! 🔥',
      'Amazing! 🎉',
      'Brilliant! ✨',
      'Superb! 🏆'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

if (typeof window !== 'undefined') {
  window.ToBeTrainer = ToBeTrainer;
}
