/**
 * HAVE GOT ERROR CORRECTION GENERATOR
 * Wrong have/has forms
 */

class HaveGotErrorCorrectionGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'he', correct: 'has', wrong: 'have' },
      { pronoun: 'she', correct: 'has', wrong: 'have' },
      { pronoun: 'it', correct: 'has', wrong: 'have' },
      { pronoun: 'they', correct: 'have', wrong: 'has' },
      { pronoun: 'we', correct: 'have', wrong: 'has' },
      { pronoun: 'I', correct: 'have', wrong: 'has' }
    ];

    this.objects = {
      family: ['a brother', 'a sister', 'two brothers'],
      pets: ['a dog', 'a cat', 'two cats'],
      items: ['a car', 'a bike', 'a phone']
    };
  }

  generate(difficulty = 'medium') {
    const subject = this._randomItem(this.subjects);
    const category = this._randomItem(Object.keys(this.objects));
    const object = this._randomItem(this.objects[category]);

    const pronoun = this._capitalize(subject.pronoun);
    const sentence = `${pronoun} <span class="error-highlight">${subject.wrong}</span> got ${object}`;

    const correctFix = `Change '${subject.wrong}' to '${subject.correct}'`;
    const wrongOptions = [
      `Change '${pronoun}' to another pronoun`,
      `Remove 'got'`,
      'No error'
    ];

    const options = this._shuffle([correctFix, ...wrongOptions]);

    const explanation = subject.correct === 'has'
      ? 'He/She/It uses "has got"'
      : 'I/You/We/They use "have got"';

    return {
      question: `<div style="margin-bottom: 1rem;">Find and fix the error:</div><div class="error-sentence">${sentence}</div>`,
      options,
      correctIndex: options.indexOf(correctFix),
      metadata: {
        type: 'error-correction',
        difficulty,
        explanation
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
  window.HaveGotErrorCorrectionGenerator = HaveGotErrorCorrectionGenerator;
}
