/**
 * RECOGNITION QUESTION GENERATOR
 * Auto-generates "Which sentence is correct?" questions
 */

class RecognitionGenerator {
  constructor() {
    // Data pools for procedural generation
    this.subjects = [
      { pronoun: 'I', verb: 'am', translation: 'я' },
      { pronoun: 'you', verb: 'are', translation: 'ты/вы' },
      { pronoun: 'he', verb: 'is', translation: 'он' },
      { pronoun: 'she', verb: 'is', translation: 'она' },
      { pronoun: 'it', verb: 'is', translation: 'оно' },
      { pronoun: 'we', verb: 'are', translation: 'мы' },
      { pronoun: 'they', verb: 'are', translation: 'они' }
    ];

    this.predicates = [
      'happy', 'tired', 'ready', 'hungry', 'busy', 'late',
      'at home', 'at school', 'at work', 'here', 'there',
      'a student', 'a teacher', 'a doctor', 'friends', 'students'
    ];

    this.wrongVerbs = ['am', 'is', 'are', 'be'];
  }

  /**
   * Generate recognition question
   * @param {string} difficulty - lvl0, easy, medium, hard
   * @returns {Object} question object
   */
  generate(difficulty = 'easy') {
    const subject = this._randomItem(this.subjects);
    const predicate = this._randomItem(this.predicates);
    
    // Build correct sentence
    const pronoun = this._capitalize(subject.pronoun);
    const correctSentence = `${pronoun} ${subject.verb} ${predicate}`;

    // Generate 3 wrong variants
    const wrongOptions = this.wrongVerbs
      .filter(v => v !== subject.verb)
      .map(v => `${pronoun} ${v} ${predicate}`)
      .slice(0, 3);

    const options = this._shuffle([correctSentence, ...wrongOptions]);

    return {
      question: 'Which sentence is <strong>correct</strong>?',
      options,
      correctIndex: options.indexOf(correctSentence),
      metadata: {
        type: 'recognition',
        difficulty,
        pronoun: subject.pronoun,
        translation: subject.translation
      }
    };
  }

  // Utility methods
  _randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _shuffle(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

if (typeof window !== 'undefined') {
  window.RecognitionGenerator = RecognitionGenerator;
}
