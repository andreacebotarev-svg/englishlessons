/**
 * PRESENT SIMPLE TRAINER
 * Subject-verb agreement + irregular verbs + do/does mastery
 */

class PresentSimpleTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'Present Simple Trainer',
      maxLives: 3,
      ...config
    });

    // Subject categories
    this.subjects = {
      singular: ['I', 'you', 'he', 'she', 'it', 'the cat', 'John', 'my friend'],
      plural: ['we', 'they', 'the cats', 'my friends', 'people']
    };

    // Third-person singular subjects (needs -s/-es)
    this.thirdPersonSingular = ['he', 'she', 'it', 'the cat', 'John', 'my friend'];

    // Verb database with base/third-person forms
    this.verbs = [
      { base: 'work', thirdPerson: 'works' },
      { base: 'play', thirdPerson: 'plays' },
      { base: 'study', thirdPerson: 'studies' }, // y → ies
      { base: 'go', thirdPerson: 'goes' },       // irregular
      { base: 'watch', thirdPerson: 'watches' }, // ch → ches
      { base: 'have', thirdPerson: 'has' },      // irregular
      { base: 'do', thirdPerson: 'does' },       // irregular
      { base: 'teach', thirdPerson: 'teaches' },
      { base: 'fix', thirdPerson: 'fixes' },     // x → xes
      { base: 'wash', thirdPerson: 'washes' },   // sh → shes
      { base: 'try', thirdPerson: 'tries' },     // y → ies
      { base: 'fly', thirdPerson: 'flies' },
      { base: 'catch', thirdPerson: 'catches' },
      { base: 'miss', thirdPerson: 'misses' },   // ss → sses
      { base: 'read', thirdPerson: 'reads' },
      { base: 'write', thirdPerson: 'writes' },
      { base: 'live', thirdPerson: 'lives' },
      { base: 'like', thirdPerson: 'likes' }
    ];

    // Sentence templates by form type
    this.templates = {
      positive: [
        '{{subject}} {{verb}} every day.',
        '{{subject}} always {{verb}} in the morning.',
        '{{subject}} {{verb}} very well.',
        '{{subject}} often {{verb}} at home.',
        '{{subject}} {{verb}} on weekends.'
      ],
      negative: [
        '{{subject}} {{do}} not {{verb}} often.',
        '{{subject}} {{do}}n\'t {{verb}} much.',
        '{{subject}} {{do}} not {{verb}} anymore.',
        '{{subject}} never {{verb}}.' // Tricky: never = negative
      ],
      question: [
        '{{do}} {{subject}} {{verb}} regularly?',
        'Where {{do}} {{subject}} {{verb}}?',
        'Why {{do}} {{subject}} {{verb}}?',
        'How often {{do}} {{subject}} {{verb}}?'
      ]
    };

    // Recent verbs cache
    this._recentVerbs = [];
    this._maxRecentCache = 4;

    // Difficulty progression
    this._currentDifficulty = 'positive'; // positive → negative → question
  }

  /**
   * Generate question with subject-verb agreement logic
   */
  generateQuestion() {
    this._updateDifficulty();

    // Select subject and verb
    const subject = this._selectSubject();
    const verb = this._selectVerb();
    const isThirdPerson = this.thirdPersonSingular.includes(subject);

    // Pick template based on difficulty
    const formType = this._currentDifficulty;
    const templates = this.templates[formType];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate sentence and options
    const { sentence, correctAnswer, options } = this._buildSentence(
      template,
      subject,
      verb,
      isThirdPerson,
      formType
    );

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        subject,
        verb,
        isThirdPerson,
        formType,
        correctAnswer
      }
    };
  }

  /**
   * Build sentence with correct verb form
   * @private
   */
  _buildSentence(template, subject, verb, isThirdPerson, formType) {
    let sentence, correctAnswer, options;

    // Capitalize subject if starts sentence
    const capitalizedSubject = template.startsWith('{{subject}}')
      ? subject.charAt(0).toUpperCase() + subject.slice(1)
      : subject;

    if (formType === 'positive') {
      // Positive: choose correct verb form (base vs third-person)
      correctAnswer = isThirdPerson ? verb.thirdPerson : verb.base;
      sentence = template
        .replace('{{subject}}', capitalizedSubject)
        .replace('{{verb}}', '____');

      options = [verb.base, verb.thirdPerson];
      
      // Add common mistake (always add -s)
      if (!isThirdPerson && !options.includes(verb.thirdPerson)) {
        options.push(verb.thirdPerson);
      }

    } else if (formType === 'negative') {
      // Negative: do/does + base form
      const doForm = isThirdPerson ? 'does' : 'do';
      correctAnswer = template.includes('never') ? verb.base : `${doForm} not ${verb.base}`;
      
      if (template.includes('never')) {
        sentence = template
          .replace('{{subject}}', capitalizedSubject)
          .replace('{{verb}}', '____');
        options = [verb.base, verb.thirdPerson];
      } else {
        sentence = template
          .replace('{{subject}}', capitalizedSubject)
          .replace('{{do}}', '____')
          .replace('{{verb}}', verb.base);
        options = ['do', 'does'];
        correctAnswer = doForm;
      }

    } else { // question
      // Question: Do/Does at start + base form
      const doForm = isThirdPerson ? 'Does' : 'Do';
      correctAnswer = doForm;
      
      sentence = template
        .replace('{{do}}', '____')
        .replace('{{subject}}', subject) // Don't capitalize in questions
        .replace('{{verb}}', verb.base);
      
      options = ['Do', 'Does'];
    }

    // Shuffle options and ensure uniqueness
    options = [...new Set(options)];
    if (options.length < 3) {
      // Add distractor
      options.push(isThirdPerson ? 'do' : 'does');
    }

    return {
      sentence,
      correctAnswer,
      options: this._shuffle(options)
    };
  }

  /**
   * Select subject with balanced distribution
   * @private
   */
  _selectSubject() {
    const allSubjects = [...this.subjects.singular, ...this.subjects.plural];
    return allSubjects[Math.floor(Math.random() * allSubjects.length)];
  }

  /**
   * Select verb avoiding recent repeats
   * @private
   */
  _selectVerb() {
    const available = this.verbs.filter(v => !this._recentVerbs.includes(v.base));
    
    if (available.length === 0) {
      this._recentVerbs = [];
      return this._selectVerb();
    }

    const verb = available[Math.floor(Math.random() * available.length)];
    
    this._recentVerbs.push(verb.base);
    if (this._recentVerbs.length > this._maxRecentCache) {
      this._recentVerbs.shift();
    }

    return verb;
  }

  /**
   * Update difficulty based on performance
   * @private
   */
  _updateDifficulty() {
    const { questionsAnswered, correctAnswers } = this.state;
    
    if (questionsAnswered < 5) {
      this._currentDifficulty = 'positive';
    } else if (questionsAnswered < 12) {
      const accuracy = correctAnswers / questionsAnswered;
      this._currentDifficulty = accuracy >= 0.75 ? 'negative' : 'positive';
    } else {
      const accuracy = correctAnswers / questionsAnswered;
      if (accuracy >= 0.85) this._currentDifficulty = 'question';
      else if (accuracy >= 0.7) this._currentDifficulty = 'negative';
      else this._currentDifficulty = 'positive';
    }
  }

  /**
   * Enhanced feedback with grammar rule
   * @override
   */
  getFeedback(isCorrect) {
    if (isCorrect) {
      return ['Perfect! 🎯', 'Excellent! ⭐', 'Correct! 💯', 'Great! 🔥'][Math.floor(Math.random() * 4)];
    }

    const { subject, verb, isThirdPerson, formType, correctAnswer } = this.state.currentQuestion.metadata;
    
    let tip = '';
    if (formType === 'positive') {
      tip = isThirdPerson
        ? `he/she/it needs <strong>${verb.thirdPerson}</strong> (add -s/-es)`
        : `Use base form <strong>${verb.base}</strong> with I/you/we/they`;
    } else if (formType === 'negative') {
      tip = isThirdPerson
        ? 'Use <strong>does not</strong> (doesn\'t) with he/she/it'
        : 'Use <strong>do not</strong> (don\'t) with I/you/we/they';
    } else {
      tip = isThirdPerson
        ? '<strong>Does</strong> for questions with he/she/it'
        : '<strong>Do</strong> for questions with I/you/we/they';
    }

    return `
      <div>Wrong. Correct: <strong>${correctAnswer}</strong></div>
      <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
        💡 Tip: ${tip}
      </div>
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

// Auto-export
if (typeof window !== 'undefined') {
  window.PresentSimpleTrainer = PresentSimpleTrainer;
}
