/**
 * PRESENT SIMPLE FILL-IN GENERATOR
 * Subject-verb agreement with do/does
 */

class PresentSimpleFillInGenerator {
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
      { base: 'have', s: 'has' },
      { base: 'do', s: 'does' },
      { base: 'teach', s: 'teaches' },
      { base: 'live', s: 'lives' },
      { base: 'like', s: 'likes' }
    ];

    this.templates = {
      easy: [
        '{pronoun} ____ every day',
        '{pronoun} ____ at school',
        '{pronoun} often ____',
        '{pronoun} ____ well'
      ],
      medium: [
        '{pronoun} {aux} not ____ often',
        '{pronoun} {aux}n\'t ____ much',
        '____ {pronoun} ____ every day?',
        'How often {aux} {pronoun} ____?'
      ],
      hard: [
        '{pronoun} {aux}n\'t usually ____',
        'Why {aux} {pronoun} ____ so much?',
        '{pronoun} rarely ____',
        'When {aux} {pronoun} ____?'
      ]
    };
  }

  generate(difficulty = 'easy') {
    const subject = this._randomItem(this.subjects);
    const verb = this._randomItem(this.verbs);
    const templates = this.templates[difficulty] || this.templates.easy;
    const template = this._randomItem(templates);

    const pronoun = this._capitalize(subject.pronoun);
    const correctVerb = subject.usesBase ? verb.base : verb.s;
    const aux = subject.auxiliary;

    // Fill template
    let sentence = template
      .replace('{pronoun}', pronoun)
      .replace('{aux}', aux);

    // Determine if we need verb or auxiliary
    const needsAuxiliary = template.includes('{aux}');
    const correctAnswer = needsAuxiliary ? aux : correctVerb;

    sentence = sentence.replace('____', '<span class="blank">____</span>');

    // Generate options
    let options;
    if (needsAuxiliary) {
      options = this._shuffle(['do', 'does']);
    } else {
      options = this._shuffle([verb.base, verb.s, `${verb.base}es`].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3));
    }

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        type: 'fill-in',
        difficulty,
        pronoun: subject.pronoun,
        verb: verb.base,
        correctAnswer
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
  window.PresentSimpleFillInGenerator = PresentSimpleFillInGenerator;
}
