/**
 * PRESENT SIMPLE RECOGNITION GENERATOR
 * "Which sentence is correct?" for Present Simple
 */

class PresentSimpleRecognitionGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', auxiliary: 'do', usesBase: true },
      { pronoun: 'you', auxiliary: 'do', usesBase: true },
      { pronoun: 'he', auxiliary: 'does', usesBase: false },
      { pronoun: 'she', auxiliary: 'does', usesBase: false },
      { pronoun: 'it', auxiliary: 'does', usesBase: false },
      { pronoun: 'we', auxiliary: 'do', usesBase: true },
      { pronoun: 'they', auxiliary: 'do', usesBase: true }
    ];

    this.verbs = [
      { base: 'work', s: 'works' },
      { base: 'play', s: 'plays' },
      { base: 'study', s: 'studies' },
      { base: 'go', s: 'goes' },
      { base: 'watch', s: 'watches' },
      { base: 'teach', s: 'teaches' },
      { base: 'live', s: 'lives' },
      { base: 'like', s: 'likes' },
      { base: 'read', s: 'reads' },
      { base: 'write', s: 'writes' },
      { base: 'speak', s: 'speaks' },
      { base: 'eat', s: 'eats' },
      { base: 'drink', s: 'drinks' },
      { base: 'sleep', s: 'sleeps' },
      { base: 'run', s: 'runs' }
    ];

    this.complements = [
      'every day', 'often', 'sometimes', 'usually', 'always',
      'at school', 'at home', 'hard', 'well', 'a lot'
    ];
  }

  generate(difficulty = 'easy') {
    const subject = this._randomItem(this.subjects);
    const verb = this._randomItem(this.verbs);
    const complement = this._randomItem(this.complements);

    const pronoun = this._capitalize(subject.pronoun);
    const correctVerb = subject.usesBase ? verb.base : verb.s;
    const correctSentence = `${pronoun} ${correctVerb} ${complement}`;

    // Generate wrong options
    const wrongVerb = subject.usesBase ? verb.s : verb.base;
    const wrongOptions = [
      `${pronoun} ${wrongVerb} ${complement}`,
      `${pronoun} ${verb.base}s ${complement}`,
      `${pronoun} ${verb.base}es ${complement}`
    ].filter((opt, i, arr) => arr.indexOf(opt) === i).slice(0, 3);

    const options = this._shuffle([correctSentence, ...wrongOptions]);

    return {
      question: 'Which sentence is <strong>correct</strong>?',
      options,
      correctIndex: options.indexOf(correctSentence),
      metadata: {
        type: 'recognition',
        difficulty,
        pronoun: subject.pronoun,
        verb: verb.base
      }
    };
  }

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
  window.PresentSimpleRecognitionGenerator = PresentSimpleRecognitionGenerator;
}
