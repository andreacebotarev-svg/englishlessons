/**
 * TO BE TRAINER V3
 * Dynamic question generation via separate generator classes.
 */

class ToBeTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'To Be Trainer',
      maxLives: 3,
      ...config
    });

    this.verbMap = {
      'I': 'am',
      'you': 'are',
      'he': 'is',
      'she': 'is',
      'it': 'is',
      'we': 'are',
      'they': 'are'
    };

    // Initialize generators
    const genConfig = { verbMap: this.verbMap };
    this.generators = {
      recognition: new RecognitionGenerator(genConfig),
      'fill-in': new FillInGenerator(genConfig),
      'error-correction': new ErrorCorrectionGenerator(genConfig),
      transformation: new TransformationGenerator(genConfig),
      context: new ContextGenerator(genConfig)
    };

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

  generateQuestion() {
    if (!this._manualDifficulty) {
      this._updateDifficulty();
    } else {
      this._currentDifficulty = this._manualDifficulty;
    }

    const questionType = this._selectQuestionType();
    const generator = this.generators[questionType];

    // Generate question (pass difficulty for fill-in)
    if (questionType === 'fill-in') {
      return generator.generate(this._currentDifficulty);
    } else {
      return generator.generate();
    }
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
    } else if (metadata.type === 'fill-in') {
      const tips = {
        'I': 'I always uses "am"',
        'you': '"You" always uses "are"',
        'he': 'He/She/It uses "is"',
        'she': 'He/She/It uses "is"',
        'it': 'He/She/It uses "is"',
        'we': 'We/They use "are"',
        'they': 'We/They use "are"'
      };
      feedback += `<div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">💡 Tip: ${tips[metadata.pronoun?.toLowerCase()]}</div>`;
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
}

if (typeof window !== 'undefined') {
  window.ToBeTrainer = ToBeTrainer;
}
