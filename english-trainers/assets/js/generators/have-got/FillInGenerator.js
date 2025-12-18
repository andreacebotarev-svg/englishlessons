/**
 * HAVE GOT FILL-IN GENERATOR
 * have/has got with possessions
 */

class HaveGotFillInGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', verb: 'have', negative: 'haven\'t' },
      { pronoun: 'you', verb: 'have', negative: 'haven\'t' },
      { pronoun: 'he', verb: 'has', negative: 'hasn\'t' },
      { pronoun: 'she', verb: 'has', negative: 'hasn\'t' },
      { pronoun: 'it', verb: 'has', negative: 'hasn\'t' },
      { pronoun: 'we', verb: 'have', negative: 'haven\'t' },
      { pronoun: 'they', verb: 'have', negative: 'haven\'t' }
    ];

    this.objects = {
      family: ['a brother', 'a sister', 'any siblings'],
      pets: ['a dog', 'a cat', 'any pets'],
      items: ['a car', 'a bike', 'a phone', 'a laptop']
    };

    this.templates = {
      easy: [
        '{pronoun} ____ got {object}',
        '{pronoun} ____ got {object} at home'
      ],
      medium: [
        '{pronoun} ____ got {object}',
        '____ {pronoun} got {object}?'
      ],
      hard: [
        '{pronoun} {negative} got {object}',
        'How many ____ {pronoun} got?'
      ]
    };
  }

  generate(difficulty = 'easy') {
    const subject = this._randomItem(this.subjects);
    const category = this._randomItem(Object.keys(this.objects));
    const object = this._randomItem(this.objects[category]);
    const templates = this.templates[difficulty] || this.templates.easy;
    const template = this._randomItem(templates);

    const pronoun = this._capitalize(subject.pronoun);

    // Determine what to fill
    const needsQuestion = template.startsWith('____') || template.includes('How many');
    const needsNegative = template.includes('{negative}');
    const correctAnswer = needsQuestion ? this._capitalize(subject.verb) : (needsNegative ? subject.negative : subject.verb);

    let sentence = template
      .replace('{pronoun}', pronoun)
      .replace('{object}', object)
      .replace('{negative}', subject.negative)
      .replace('____', '<span class="blank">____</span>');

    // Generate options
    let options;
    if (needsNegative) {
      options = this._shuffle(['haven\'t', 'hasn\'t', 'have not']);
    } else {
      options = this._shuffle(['have', 'has', 'had']);
    }

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        type: 'fill-in',
        difficulty,
        pronoun: subject.pronoun,
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
  window.HaveGotFillInGenerator = HaveGotFillInGenerator;
}
