/**
 * HAVE/HAVE GOT TRAINER
 * British vs American usage + possession expressions
 */

class HaveGotTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'Have/Have Got Trainer',
      maxLives: 3,
      ...config
    });

    // Subject mapping
    this.subjects = {
      singular: [
        { pronoun: 'I', haveForm: 'have', hasForm: 'have' },
        { pronoun: 'you', haveForm: 'have', hasForm: 'have' },
        { pronoun: 'he', haveForm: 'has', hasForm: 'has' },
        { pronoun: 'she', haveForm: 'has', hasForm: 'has' },
        { pronoun: 'it', haveForm: 'has', hasForm: 'has' },
        { pronoun: 'my friend', haveForm: 'has', hasForm: 'has' },
        { pronoun: 'the dog', haveForm: 'has', hasForm: 'has' }
      ],
      plural: [
        { pronoun: 'we', haveForm: 'have', hasForm: 'have' },
        { pronoun: 'they', haveForm: 'have', hasForm: 'have' },
        { pronoun: 'my friends', haveForm: 'have', hasForm: 'have' }
      ]
    };

    // Possession vocabulary by category
    this.possessions = {
      family: ['a brother', 'a sister', 'two brothers', 'three sisters', 'a big family'],
      pets: ['a dog', 'a cat', 'two cats', 'a parrot', 'three goldfish'],
      objects: ['a car', 'a bike', 'a laptop', 'a phone', 'a new watch', 'blue eyes'],
      abilities: ['a lot of free time', 'a good memory', 'a question', 'an idea'],
      physical: ['a headache', 'a cold', 'long hair', 'brown eyes', 'a new haircut']
    };

    // Flatten all possessions
    this.allPossessions = Object.values(this.possessions).flat();

    // Sentence templates
    this.templates = {
      positive: [
        '{{subject}} {{have}} {{possession}}.',
        '{{subject}} {{have}} got {{possession}}.',
        '{{subject}} {{have}} {{possession}} at home.'
      ],
      negative: [
        '{{subject}} {{do}} not {{have}} {{possession}}.',
        '{{subject}} {{have}} not got {{possession}}.',
        '{{subject}} {{do}}n\'t {{have}} {{possession}}.'
      ],
      question: [
        '{{do}} {{subject}} {{have}} {{possession}}?',
        '{{have}} {{subject}} got {{possession}}?',
        'How many siblings {{do}} {{subject}} {{have}}?'
      ]
    };

    // Recent cache
    this._recentSubjects = [];
    this._recentPossessions = [];
    this._maxCache = 3;

    // Difficulty
    this._currentDifficulty = 'positive';
  }

  /**
   * Generate question
   */
  generateQuestion() {
    this._updateDifficulty();

    // Select subject and possession
    const subjectObj = this._selectSubject();
    const possession = this._selectPossession();
    const formType = this._currentDifficulty;

    // Pick template
    const templates = this.templates[formType];
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Determine if "have got" or "have" structure
    const isHaveGot = template.includes('got');

    // Build sentence
    const { sentence, correctAnswer, options } = this._buildSentence(
      template,
      subjectObj,
      possession,
      formType,
      isHaveGot
    );

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        subject: subjectObj.pronoun,
        possession,
        formType,
        isHaveGot,
        correctAnswer
      }
    };
  }

  /**
   * Build sentence with correct have/has form
   * @private
   */
  _buildSentence(template, subjectObj, possession, formType, isHaveGot) {
    const subject = subjectObj.pronoun;
    const haveForm = subjectObj.haveForm; // have/has
    const isThirdPerson = haveForm === 'has';

    // Capitalize subject
    const capitalizedSubject = template.startsWith('{{subject}}') ||
                                template.startsWith('{{do}}') ||
                                template.startsWith('{{have}}')
      ? subject.charAt(0).toUpperCase() + subject.slice(1)
      : subject;

    let sentence, correctAnswer, options;

    if (formType === 'positive') {
      if (isHaveGot) {
        // "have/has got" structure
        correctAnswer = haveForm;
        sentence = template
          .replace('{{subject}}', capitalizedSubject)
          .replace('{{have}}', '____')
          .replace('{{possession}}', possession);
        options = ['have', 'has'];
      } else {
        // Simple "have/has"
        correctAnswer = haveForm;
        sentence = template
          .replace('{{subject}}', capitalizedSubject)
          .replace('{{have}}', '____')
          .replace('{{possession}}', possession);
        options = ['have', 'has'];
      }

    } else if (formType === 'negative') {
      if (isHaveGot) {
        // "have/has not got"
        correctAnswer = haveForm;
        sentence = template
          .replace('{{subject}}', capitalizedSubject)
          .replace('{{have}}', '____')
          .replace('{{possession}}', possession);
        options = ['have', 'has'];
      } else {
        // "do/does not have"
        const doForm = isThirdPerson ? 'does' : 'do';
        correctAnswer = doForm;
        sentence = template
          .replace('{{subject}}', capitalizedSubject)
          .replace('{{do}}', '____')
          .replace('{{have}}', 'have')
          .replace('{{possession}}', possession);
        options = ['do', 'does'];
      }

    } else { // question
      if (isHaveGot) {
        // "Have/Has ... got?"
        correctAnswer = haveForm.charAt(0).toUpperCase() + haveForm.slice(1);
        sentence = template
          .replace('{{have}}', '____')
          .replace('{{subject}}', subject)
          .replace('{{possession}}', possession);
        options = ['Have', 'Has'];
      } else {
        // "Do/Does ... have?"
        const doForm = isThirdPerson ? 'Does' : 'Do';
        correctAnswer = doForm;
        sentence = template
          .replace('{{do}}', '____')
          .replace('{{subject}}', subject)
          .replace('{{have}}', 'have')
          .replace('{{possession}}', possession);
        options = ['Do', 'Does'];
      }
    }

    // Ensure unique options
    options = [...new Set(options)];
    if (options.length < 3) {
      // Add common mistake
      if (formType === 'question') {
        options.push(isThirdPerson ? 'Do' : 'Does');
      } else {
        options.push(isThirdPerson ? 'have' : 'has');
      }
    }

    return {
      sentence,
      correctAnswer,
      options: this._shuffle(options)
    };
  }

  /**
   * Select subject avoiding recent
   * @private
   */
  _selectSubject() {
    const allSubjects = [...this.subjects.singular, ...this.subjects.plural];
    const available = allSubjects.filter(s => !this._recentSubjects.includes(s.pronoun));
    
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
   * Select possession avoiding recent
   * @private
   */
  _selectPossession() {
    const available = this.allPossessions.filter(p => !this._recentPossessions.includes(p));
    
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
   * Update difficulty
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
   * Enhanced feedback
   * @override
   */
  getFeedback(isCorrect) {
    if (isCorrect) {
      return ['Perfect! 🎯', 'Correct! ✅', 'Excellent! ⭐', 'Great! 🔥'][Math.floor(Math.random() * 4)];
    }

    const { subject, formType, isHaveGot, correctAnswer } = this.state.currentQuestion.metadata;
    
    let tip = '';
    if (formType === 'positive' || (formType === 'negative' && isHaveGot)) {
      tip = subject === 'I' || subject === 'you' || subject === 'we' || subject === 'they'
        ? 'Use <strong>have</strong> with I/you/we/they'
        : 'Use <strong>has</strong> with he/she/it';
    } else if (formType === 'negative' && !isHaveGot) {
      tip = subject === 'he' || subject === 'she' || subject === 'it'
        ? 'Use <strong>does not</strong> with he/she/it'
        : 'Use <strong>do not</strong> with I/you/we/they';
    } else {
      tip = isHaveGot
        ? (subject === 'he' || subject === 'she' ? '<strong>Has</strong> for he/she/it' : '<strong>Have</strong> for I/you/we/they')
        : (subject === 'he' || subject === 'she' ? '<strong>Does</strong> for he/she/it' : '<strong>Do</strong> for I/you/we/they');
    }

    return `
      <div>Wrong. Correct: <strong>${correctAnswer}</strong></div>
      <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
        💡 Tip: ${tip}
      </div>
    `;
  }

  /**
   * Shuffle array
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

// Export
if (typeof window !== 'undefined') {
  window.HaveGotTrainer = HaveGotTrainer;
}
