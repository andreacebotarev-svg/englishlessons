/**
 * HAVE GOT/HAS GOT TRAINER
 * British structure only: have got/has got (positive, negative, questions)
 */

class HaveGotTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'Have Got Trainer',
      maxLives: 3,
      ...config
    });

    // Subject mapping (have vs has)
    this.subjects = [
      { pronoun: 'I', verb: 'have', isPlural: true },
      { pronoun: 'you', verb: 'have', isPlural: true },
      { pronoun: 'he', verb: 'has', isPlural: false },
      { pronoun: 'she', verb: 'has', isPlural: false },
      { pronoun: 'it', verb: 'has', isPlural: false },
      { pronoun: 'we', verb: 'have', isPlural: true },
      { pronoun: 'they', verb: 'have', isPlural: true },
      { pronoun: 'Tom', verb: 'has', isPlural: false },
      { pronoun: 'my friend', verb: 'has', isPlural: false },
      { pronoun: 'the cat', verb: 'has', isPlural: false }
    ];

    // Possessions vocabulary
    this.possessions = [
      'a brother', 'a sister', 'two brothers', 'three sisters',
      'a dog', 'a cat', 'two cats', 'a parrot',
      'a car', 'a bike', 'a laptop', 'a new phone',
      'blue eyes', 'long hair', 'brown eyes', 'a headache',
      'a lot of free time', 'a good idea', 'a question',
      'a big family', 'a new watch', 'an old bike'
    ];

    // Templates by difficulty
    this.templates = {
      // EASY: Positive statements
      positive: [
        '{{subject}} ____ got {{possession}}.',
        '{{subject}} ____ got {{possession}} at home.',
        '{{subject}} ____ got {{possession}} now.'
      ],
      
      // MEDIUM: Negatives (haven't got / hasn't got)
      negative: [
        '{{subject}} ____n\'t got {{possession}}.',
        '{{subject}} ____ not got {{possession}}.',
        '{{subject}} ____n\'t got {{possession}} at home.'
      ],
      
      // HARD: Questions (Have ... got? / Has ... got?)
      question: [
        '____ {{subject}} got {{possession}}?',
        '____ {{subject}} got {{possession}} at home?',
        'How many pets ____ {{subject}} got?'
      ]
    };

    // Recent cache to avoid repetition
    this._recentSubjects = [];
    this._recentPossessions = [];
    this._maxCache = 3;

    // Auto-difficulty
    this._currentDifficulty = 'positive';
  }

  /**
   * Generate question
   */
  generateQuestion() {
    this._updateDifficulty();

    const subjectObj = this._selectSubject();
    const possession = this._selectPossession();
    const difficulty = this._currentDifficulty;

    const templates = this.templates[difficulty];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Build sentence
    const { sentence, correctAnswer, options } = this._buildSentence(
      template,
      subjectObj,
      possession,
      difficulty
    );

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        subject: subjectObj.pronoun,
        possession,
        difficulty,
        correctAnswer,
        correctVerb: subjectObj.verb
      }
    };
  }

  /**
   * Build sentence with correct have/has
   * @private
   */
  _buildSentence(template, subjectObj, possession, difficulty) {
    const subject = subjectObj.pronoun;
    const verb = subjectObj.verb; // have or has
    const isPlural = subjectObj.isPlural;

    let sentence, correctAnswer, options;

    // Capitalize subject if starts sentence
    const capitalizeSubject = template.startsWith('{{subject}}');
    const displaySubject = capitalizeSubject
      ? subject.charAt(0).toUpperCase() + subject.slice(1)
      : subject;

    if (difficulty === 'positive') {
      // I ____ got a dog. → have
      correctAnswer = verb;
      sentence = template
        .replace('{{subject}}', displaySubject)
        .replace('{{possession}}', possession);
      options = ['have', 'has'];

    } else if (difficulty === 'negative') {
      // I ____n't got a dog. → have (haven't)
      // She ____n't got a cat. → has (hasn't)
      correctAnswer = verb;
      sentence = template
        .replace('{{subject}}', displaySubject)
        .replace('{{possession}}', possession);
      options = ['have', 'has'];

    } else { // question
      // ____ you got a dog? → Have
      // ____ she got a cat? → Has
      correctAnswer = verb.charAt(0).toUpperCase() + verb.slice(1); // Have/Has
      sentence = template
        .replace('{{subject}}', subject) // lowercase in questions
        .replace('{{possession}}', possession);
      options = ['Have', 'Has'];
    }

    // Add extra distractor for variety
    if (difficulty !== 'question') {
      options.push(isPlural ? 'has' : 'have'); // Wrong option
    }

    return {
      sentence: sentence.replace(/\s+/g, ' ').trim(),
      correctAnswer,
      options: this._shuffle([...new Set(options)]) // Unique + shuffled
    };
  }

  /**
   * Select subject (avoid recent)
   * @private
   */
  _selectSubject() {
    const available = this.subjects.filter(s => !this._recentSubjects.includes(s.pronoun));
    
    if (available.length === 0) {
      this._recentSubjects = [];
      return this._selectSubject();
    }

    const subject = available[Math.floor(Math.random() * available.length)];
    this._recentSubjects.push(subject.pronoun);
    if (this._recentSubjects.length > this._maxCache) {
      this._recentSubjects.shift();
    }

    return subject;
  }

  /**
   * Select possession (avoid recent)
   * @private
   */
  _selectPossession() {
    const available = this.possessions.filter(p => !this._recentPossessions.includes(p));
    
    if (available.length === 0) {
      this._recentPossessions = [];
      return this._selectPossession();
    }

    const possession = available[Math.floor(Math.random() * available.length)];
    this._recentPossessions.push(possession);
    if (this._recentPossessions.length > this._maxCache) {
      this._recentPossessions.shift();
    }

    return possession;
  }

  /**
   * Auto-scale difficulty based on performance
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
   * Enhanced feedback with grammar tips
   * @override
   */
  getFeedback(isCorrect) {
    if (isCorrect) {
      const messages = [
        'Perfect! 🎯',
        'Correct! ✅',
        'Excellent! ⭐',
        'Great job! 🔥',
        'Well done! 👏'
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }

    const { subject, correctAnswer, difficulty, correctVerb } = this.state.currentQuestion.metadata;
    
    // Grammar tips
    const tips = {
      'I': 'I/you/we/they use <strong>have</strong> got',
      'you': 'I/you/we/they use <strong>have</strong> got',
      'he': 'He/she/it uses <strong>has</strong> got',
      'she': 'He/she/it uses <strong>has</strong> got',
      'it': 'He/she/it uses <strong>has</strong> got',
      'we': 'I/you/we/they use <strong>have</strong> got',
      'they': 'I/you/we/they use <strong>have</strong> got'
    };

    const tip = tips[subject] || (correctVerb === 'has' 
      ? 'He/she/it uses <strong>has</strong> got'
      : 'I/you/we/they use <strong>have</strong> got');

    // Example sentence
    let example = '';
    if (difficulty === 'positive') {
      example = `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${correctAnswer} got a dog.`;
    } else if (difficulty === 'negative') {
      example = `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${correctAnswer}n't got a cat.`;
    } else {
      example = `${correctAnswer} ${subject} got a bike?`;
    }

    return `
      <div>Wrong. Correct: <strong>${correctAnswer}</strong></div>
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.75rem;">
        💡 ${tip}<br>
        <em style="opacity: 0.8; margin-top: 0.25rem; display: block;">${example}</em>
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

// Auto-init on page load
if (typeof window !== 'undefined') {
  window.HaveGotTrainer = HaveGotTrainer;
}
