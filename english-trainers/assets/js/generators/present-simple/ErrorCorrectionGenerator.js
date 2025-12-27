/**
 * PRESENT SIMPLE ERROR CORRECTION GENERATOR
 * Wrong verb forms (work/works, do/does)
 */

class PresentSimpleErrorCorrectionGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'he', correct: 's', wrong: 'base' },
      { pronoun: 'she', correct: 's', wrong: 'base' },
      { pronoun: 'it', correct: 's', wrong: 'base' },
      { pronoun: 'they', correct: 'base', wrong: 's' },
      { pronoun: 'we', correct: 'base', wrong: 's' },
      { pronoun: 'I', correct: 'base', wrong: 's' }
    ];

    this.verbs = [
      { base: 'work', s: 'works' },
      { base: 'play', s: 'plays' },
      { base: 'study', s: 'studies' },
      { base: 'go', s: 'goes' },
      { base: 'watch', s: 'watches' },
      { base: 'teach', s: 'teaches' },
      { base: 'like', s: 'likes' },
      { base: 'live', s: 'lives' }
    ];

    this.complements = ['every day', 'at school', 'often', 'hard', 'well'];
  }

  generate(difficulty = 'medium') {
    const subject = this._randomItem(this.subjects);
    const verb = this._randomItem(this.verbs);
    const complement = this._randomItem(this.complements);

    const pronoun = this._capitalize(subject.pronoun);
    const wrongVerb = subject.wrong === 'base' ? verb.base : verb.s;
    const correctVerb = subject.correct === 'base' ? verb.base : verb.s;

    const sentence = `${pronoun} <span class="error-highlight">${wrongVerb}</span> ${complement}`;

    const correctFix = `Change '${wrongVerb}' to '${correctVerb}'`;
    const wrongOptions = [
      `Change '${pronoun}' to another pronoun`,
      `Add 'not' after '${wrongVerb}'`,
      'No error'
    ];

    const options = this._shuffle([correctFix, ...wrongOptions]);

    const explanation = subject.correct === 's' 
      ? 'He/She/It uses verb + s/es'
      : 'I/You/We/They use base verb form';

    return {
      question: `<div style="margin-bottom: 1rem;">Find and fix the error:</div><div class="error-sentence">${sentence}</div>`,
      options,
      correctIndex: options.indexOf(correctFix),
      metadata: {
        type: 'error-correction',
        difficulty,
        explanation,
        correctVerb
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
  window.PresentSimpleErrorCorrectionGenerator = PresentSimpleErrorCorrectionGenerator;
}
