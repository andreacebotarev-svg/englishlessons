/**
 * TO BE TRAINER
 * Weighted randomization + context templates + difficulty scaling
 */

class ToBeTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'To Be Trainer',
      maxLives: 3,
      ...config
    });

    // Pronoun-to-verb mapping
    this.verbMap = {
      'I': 'am',
      'you': 'are',
      'he': 'is',
      'she': 'is',
      'it': 'is',
      'we': 'are',
      'they': 'are'
    };

    // Russian translations for Level 0
    this.pronounTranslations = {
      'I': 'я',
      'you': 'ты/вы',
      'he': 'он',
      'she': 'она',
      'it': 'оно',
      'we': 'мы',
      'they': 'они'
    };

    // Weighted pronoun pool (avoid monotony)
    this.pronounWeights = {
      'I': 1,
      'you': 1,
      'he': 1.2,  // Slightly more common for learners
      'she': 1.2,
      'it': 0.8,  // Less common in natural speech
      'we': 1,
      'they': 1
    };

    // Sentence templates by difficulty
    this.templates = {
      lvl0: [
        // Level 0: Just pronoun + is/am/are (no context)
        '{{pronoun}} {{verb}}'
      ],
      easy: [
        '{{pronoun}} ____ a student.',
        '{{pronoun}} ____ happy.',
        '{{pronoun}} ____ at home.',
        '{{pronoun}} ____ tired.',
        '{{pronoun}} ____ hungry.'
      ],
      medium: [
        '{{pronoun}} ____ not ready yet.',
        '____ {{pronoun}} from Spain?',
        '{{pronoun}} ____ always late.',
        '{{pronoun}} ____ never wrong.',
        'Why ____ {{pronoun}} here?'
      ],
      hard: [
        '{{pronoun}} ____ supposed to be here.',
        '{{pronoun}} ____n\'t going to do that.',
        'Where ____ {{pronoun}} now?',
        '{{pronoun}} ____ about to leave.',
        '{{pronoun}} ____ being very careful.'
      ]
    };

    // Recent pronouns cache (avoid repeats)
    this._recentPronouns = [];
    this._maxRecentCache = 3;

    // Difficulty progression (auto-scales with score)
    this._currentDifficulty = 'easy';
    this._manualDifficulty = null; // Locked difficulty
  }

  /**
   * Generate question with weighted randomization
   * @returns {Object}
   */
  generateQuestion() {
    // Auto-scale difficulty (unless locked)
    if (!this._manualDifficulty) {
      this._updateDifficulty();
    } else {
      this._currentDifficulty = this._manualDifficulty;
    }

    // Select pronoun (weighted + avoid recent)
    const pronoun = this._selectPronoun();
    const correctVerb = this.verbMap[pronoun];
    const isLvl0 = this._currentDifficulty === 'lvl0';

    // Pick template and fill
    const templates = this.templates[this._currentDifficulty];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Detect question/negative form
    const isQuestion = template.includes('____ {{pronoun}}');
    const isNegative = template.includes('not') || template.includes('n\'t');

    // Generate sentence
    let sentence;
    if (isLvl0) {
      // Level 0: Show completed sentence, ask for pronoun
      sentence = template
        .replace('{{pronoun}}', '<span class="blank">____</span>')
        .replace('{{verb}}', correctVerb);
    } else {
      sentence = this._fillTemplate(template, pronoun);
    }

    // Generate options
    const options = isLvl0 
      ? this._generatePronounOptions(pronoun)
      : this._generateVerbOptions(correctVerb);

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(isLvl0 ? pronoun : correctVerb),
      metadata: {
        pronoun,
        correctVerb,
        difficulty: this._currentDifficulty,
        isQuestion,
        isNegative,
        isLvl0,
        translation: this.pronounTranslations[pronoun]
      }
    };
  }

  /**
   * Generate pronoun options for Level 0
   * @private
   */
  _generatePronounOptions(correctPronoun) {
    const allPronouns = ['I', 'you', 'he', 'she', 'it', 'we', 'they'];
    const shuffled = this._shuffle(allPronouns.filter(p => p !== correctPronoun));
    const options = [correctPronoun, ...shuffled.slice(0, 3)];
    return this._shuffle(options);
  }

  /**
   * Select pronoun with weighted random + recency filter
   * @private
   */
  _selectPronoun() {
    const available = Object.keys(this.pronounWeights)
      .filter(p => !this._recentPronouns.includes(p));

    // If all cached, clear cache
    if (available.length === 0) {
      this._recentPronouns = [];
      return this._selectPronoun();
    }

    // Weighted random selection
    const totalWeight = available.reduce((sum, p) => sum + this.pronounWeights[p], 0);
    let random = Math.random() * totalWeight;

    for (const pronoun of available) {
      random -= this.pronounWeights[pronoun];
      if (random <= 0) {
        // Update recency cache
        this._recentPronouns.push(pronoun);
        if (this._recentPronouns.length > this._maxRecentCache) {
          this._recentPronouns.shift();
        }
        return pronoun;
      }
    }

    return available[0]; // Fallback
  }

  /**
   * Fill sentence template
   * @private
   */
  _fillTemplate(template, pronoun) {
    // Capitalize first letter if pronoun starts sentence
    const capitalizedPronoun = template.startsWith('{{pronoun}}') || template.startsWith('____')
      ? pronoun.charAt(0).toUpperCase() + pronoun.slice(1)
      : pronoun;

    return template
      .replace(/\{\{pronoun\}\}/g, capitalizedPronoun)
      .replace(/____/g, '<span class="blank">____</span>'); // Highlight blank
  }

  /**
   * Generate shuffled verb options
   * @private
   */
  _generateVerbOptions(correctVerb) {
    const allVerbs = ['am', 'is', 'are'];
    
    // Add contracted forms for variety (30% chance)
    if (Math.random() < 0.3) {
      allVerbs.push('\'m', '\'s', '\'re');
    }

    // Shuffle and return unique 3-4 options including correct
    const shuffled = this._shuffle(allVerbs);
    const options = [correctVerb];

    for (const verb of shuffled) {
      if (verb !== correctVerb && options.length < 4) {
        options.push(verb);
      }
    }

    return this._shuffle(options);
  }

  /**
   * Auto-scale difficulty based on performance
   * @private
   */
  _updateDifficulty() {
    const { score, questionsAnswered, correctAnswers } = this.state;
    
    if (questionsAnswered < 5) {
      this._currentDifficulty = 'easy';
    } else if (questionsAnswered < 15) {
      const accuracy = correctAnswers / questionsAnswered;
      this._currentDifficulty = accuracy >= 0.8 ? 'medium' : 'easy';
    } else {
      const accuracy = correctAnswers / questionsAnswered;
      if (accuracy >= 0.85) this._currentDifficulty = 'hard';
      else if (accuracy >= 0.7) this._currentDifficulty = 'medium';
      else this._currentDifficulty = 'easy';
    }
  }

  /**
   * Enhanced feedback with grammar tip
   * @override
   */
  getFeedback(isCorrect) {
    if (isCorrect) {
      const messages = [
        'Perfect! 💯',
        'Correct! 🎯',
        'Excellent! ⭐',
        'Well done! 👏',
        'Great job! 🔥'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }

    const { pronoun, correctVerb, isLvl0, translation } = this.state.currentQuestion.metadata;
    
    if (isLvl0) {
      // Level 0 feedback
      return `
        <div>Wrong. Correct: <strong>${pronoun}</strong> (${translation})</div>
        <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
          💡 Tip: "${pronoun}" means "${translation}" in Russian
        </div>
      `;
    }

    // Regular feedback
    const tips = {
      'I': 'I always uses "am"',
      'you': '"You" always uses "are" (singular & plural)',
      'he': 'He/She/It uses "is"',
      'she': 'He/She/It uses "is"',
      'it': 'He/She/It uses "is"',
      'we': 'We/They use "are"',
      'they': 'We/They use "are"'
    };

    return `
      <div>Wrong. Correct: <strong>${pronoun} ${correctVerb}</strong></div>
      <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
        💡 Tip: ${tips[pronoun]}
      </div>
    `;
  }

  /**
   * Override render to show translation in Level 0
   * @override
   */
  _renderQuestion(question) {
    const container = this._dom.questionContainer;
    if (!container) return;

    const { isLvl0, translation } = this.state.currentQuestion?.metadata || {};

    // Add translation hint for Level 0
    const hint = isLvl0 ? `<div class="pronoun-hint">(🇷🇺 ${translation})</div>` : '';

    container.innerHTML = `
      <div class="question" role="heading" aria-level="2">
        ${question.question}
        ${hint}
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
   * Fisher-Yates shuffle
   * @private
   */
  _shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// Auto-init on page load
if (typeof window !== 'undefined') {
  window.ToBeTrainer = ToBeTrainer;
}
