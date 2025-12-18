/**
 * TO BE TRAINER V2
 * 5 question types + adaptive progression + weighted randomization
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

    // Question type weights by difficulty
    this.typeWeights = {
      lvl0: { recognition: 1.0 },
      easy: { recognition: 0.3, 'fill-in': 0.7 },
      medium: { recognition: 0.1, 'fill-in': 0.6, 'error-correction': 0.3 },
      hard: { 'fill-in': 0.4, 'error-correction': 0.25, transformation: 0.25, context: 0.1 }
    };

    // Content pools for each question type
    this._initQuestionPools();

    this._currentDifficulty = 'easy';
    this._manualDifficulty = null;
    this._recentPronouns = [];
  }

  _initQuestionPools() {
    // Pool 1: Recognition tasks
    this.recognitionPool = [
      { correct: 'I am happy', wrong: ['I is happy', 'I are happy', 'I be happy'] },
      { correct: 'You are ready', wrong: ['You is ready', 'You am ready', 'You be ready'] },
      { correct: 'He is tired', wrong: ['He am tired', 'He are tired', 'He be tired'] },
      { correct: 'She is at home', wrong: ['She am at home', 'She are at home', 'She be at home'] },
      { correct: 'It is cold', wrong: ['It am cold', 'It are cold', 'It be cold'] },
      { correct: 'We are students', wrong: ['We is students', 'We am students', 'We be students'] },
      { correct: 'They are here', wrong: ['They is here', 'They am here', 'They be here'] }
    ];

    // Pool 2: Fill-in templates (existing)
    this.fillInTemplates = {
      easy: [
        'I ____ a student',
        'You ____ my friend',
        'He ____ very tall',
        'She ____ a doctor',
        'It ____ sunny today',
        'We ____ at school',
        'They ____ happy'
      ],
      medium: [
        'I ____ not ready',
        'You ____ always late',
        'He ____ never wrong',
        'She ____ not here',
        'It ____ not working',
        'We ____ very busy',
        'They ____ not coming'
      ],
      hard: [
        'I ____ about to leave',
        'You ____ supposed to call',
        'He ____ being careful',
        'She ____ going to win',
        'It ____ getting dark',
        'We ____ running late',
        'They ____ always fighting'
      ]
    };

    // Pool 3: Error correction
    this.errorPool = [
      {
        sentence: 'She <span class="error-highlight">are</span> a teacher',
        options: [
          "Change 'are' to 'is'",
          "Change 'She' to 'They'",
          "Add 'not' after 'are'",
          'No error'
        ],
        correctIndex: 0,
        explanation: "Use 'is' with 3rd person singular (he/she/it)"
      },
      {
        sentence: 'They <span class="error-highlight">is</span> at home',
        options: [
          "Change 'is' to 'are'",
          "Change 'They' to 'He'",
          "Remove 'at'",
          'No error'
        ],
        correctIndex: 0,
        explanation: "Use 'are' with plural subjects (we/they)"
      },
      {
        sentence: 'I <span class="error-highlight">is</span> happy',
        options: [
          "Change 'is' to 'am'",
          "Change 'I' to 'He'",
          "Remove 'happy'",
          'No error'
        ],
        correctIndex: 0,
        explanation: "'I' always uses 'am'"
      },
      {
        sentence: 'You <span class="error-highlight">is</span> my friend',
        options: [
          "Change 'is' to 'are'",
          "Change 'You' to 'She'",
          "Add 'not' after 'is'",
          'No error'
        ],
        correctIndex: 0,
        explanation: "'You' always uses 'are' (singular and plural)"
      },
      {
        sentence: 'We <span class="error-highlight">am</span> students',
        options: [
          "Change 'am' to 'are'",
          "Change 'We' to 'I'",
          "Remove 'students'",
          'No error'
        ],
        correctIndex: 0,
        explanation: "'We' uses 'are'"
      }
    ];

    // Pool 4: Transformation tasks
    this.transformationPool = [
      {
        instruction: 'Make this sentence <strong>negative</strong>:',
        sentence: 'We are at home',
        options: [
          'We are not at home',
          'We not are at home',
          'We are at not home',
          'Not we are at home'
        ],
        correctIndex: 0,
        hint: "Place 'not' after 'to be'"
      },
      {
        instruction: 'Make this a <strong>question</strong>:',
        sentence: 'They are ready',
        options: [
          'Are they ready?',
          'They are ready?',
          'Are ready they?',
          'They ready are?'
        ],
        correctIndex: 0,
        hint: "Move 'to be' before the subject"
      },
      {
        instruction: 'Make this sentence <strong>negative</strong>:',
        sentence: 'She is happy',
        options: [
          'She is not happy',
          'She not is happy',
          'She is happy not',
          'Not she is happy'
        ],
        correctIndex: 0,
        hint: "Use 'is not' or 'isn't'"
      },
      {
        instruction: 'Make this a <strong>question</strong>:',
        sentence: 'You are tired',
        options: [
          'Are you tired?',
          'You are tired?',
          'Are tired you?',
          'You tired are?'
        ],
        correctIndex: 0,
        hint: "Invert 'to be' and subject"
      },
      {
        instruction: 'Change to <strong>plural</strong>:',
        sentence: 'He is a student',
        options: [
          'They are students',
          'They is students',
          'He are students',
          'They are student'
        ],
        correctIndex: 0,
        hint: "He → They, is → are, student → students"
      }
    ];

    // Pool 5: Context (dialogues)
    this.contextPool = [
      {
        context: `
          <div class="dialogue">
            <p><strong>A:</strong> Where ____ your friends?</p>
            <p><strong>B:</strong> They ____ at the park.</p>
          </div>
        `,
        options: ['are / are', 'is / are', 'are / is', 'is / is'],
        correctIndex: 0,
        explanation: "'Your friends' = plural → 'are'. 'They' → 'are'"
      },
      {
        context: `
          <div class="dialogue">
            <p><strong>A:</strong> ____ you ready?</p>
            <p><strong>B:</strong> Yes, I ____ ready!</p>
          </div>
        `,
        options: ['Are / am', 'Is / am', 'Are / is', 'Is / are'],
        correctIndex: 0,
        explanation: "Question: 'Are you...?', Answer: 'I am...'"
      },
      {
        context: `
          <div class="dialogue">
            <p><strong>A:</strong> She ____ not here today.</p>
            <p><strong>B:</strong> Where ____ she?</p>
          </div>
        `,
        options: ['is / is', 'are / is', 'is / are', 'are / are'],
        correctIndex: 0,
        explanation: "'She' always uses 'is'"
      },
      {
        context: `
          <div class="dialogue">
            <p><strong>Teacher:</strong> ____ we all ready?</p>
            <p><strong>Students:</strong> Yes, we ____!</p>
          </div>
        `,
        options: ['Are / are', 'Is / are', 'Are / is', 'Is / is'],
        correctIndex: 0,
        explanation: "'We' uses 'are'"
      }
    ];
  }

  generateQuestion() {
    if (!this._manualDifficulty) {
      this._updateDifficulty();
    } else {
      this._currentDifficulty = this._manualDifficulty;
    }

    // Select question type by weighted random
    const questionType = this._selectQuestionType();

    // Generate question by type
    return this[`_generate${this._capitalize(questionType)}`]();
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

  _generateRecognition() {
    const item = this._randomItem(this.recognitionPool);
    const options = this._shuffle([item.correct, ...item.wrong]);

    return {
      question: 'Which sentence is <strong>correct</strong>?',
      options,
      correctIndex: options.indexOf(item.correct),
      metadata: { type: 'recognition', difficulty: this._currentDifficulty }
    };
  }

  _generateFillIn() {
    const templates = this.fillInTemplates[this._currentDifficulty] || this.fillInTemplates.easy;
    const template = this._randomItem(templates);
    
    // Extract pronoun from template
    const pronoun = template.split(' ')[0];
    const correctVerb = this.verbMap[pronoun.toLowerCase()];
    const sentence = template.replace('____', '<span class="blank">____</span>');

    const options = this._shuffle(['am', 'is', 'are']);

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctVerb),
      metadata: { type: 'fill-in', pronoun, correctVerb, difficulty: this._currentDifficulty }
    };
  }

  _generateErrorCorrection() {
    const item = this._randomItem(this.errorPool);

    return {
      question: `<div style="margin-bottom: 1rem;">Find and fix the error:</div><div class="error-sentence">${item.sentence}</div>`,
      options: item.options,
      correctIndex: item.correctIndex,
      metadata: { type: 'error-correction', explanation: item.explanation, difficulty: this._currentDifficulty }
    };
  }

  _generateTransformation() {
    const item = this._randomItem(this.transformationPool);

    return {
      question: `
        <div style="margin-bottom: 0.5rem;">${item.instruction}</div>
        <div class="transformation-sentence" style="font-size: 1.1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; margin: 1rem 0;">
          "${item.sentence}"
        </div>
      `,
      options: item.options,
      correctIndex: item.correctIndex,
      metadata: { type: 'transformation', hint: item.hint, difficulty: this._currentDifficulty }
    };
  }

  _generateContext() {
    const item = this._randomItem(this.contextPool);

    return {
      question: `<div style="margin-bottom: 1rem; font-weight: 600;">Complete the dialogue:</div>${item.context}`,
      options: item.options,
      correctIndex: item.correctIndex,
      metadata: { type: 'context', explanation: item.explanation, difficulty: this._currentDifficulty }
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

  // Utility methods
  _randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  _shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  _capitalize(str) {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  }
}

if (typeof window !== 'undefined') {
  window.ToBeTrainer = ToBeTrainer;
}
