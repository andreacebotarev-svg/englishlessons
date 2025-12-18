/**
 * ERROR CORRECTION GENERATOR
 * Auto-generates sentences with wrong verb forms
 */

class ErrorCorrectionGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', correctVerb: 'am', wrongVerbs: ['is', 'are'] },
      { pronoun: 'you', correctVerb: 'are', wrongVerbs: ['am', 'is'] },
      { pronoun: 'he', correctVerb: 'is', wrongVerbs: ['am', 'are'] },
      { pronoun: 'she', correctVerb: 'is', wrongVerbs: ['am', 'are'] },
      { pronoun: 'it', correctVerb: 'is', wrongVerbs: ['am', 'are'] },
      { pronoun: 'we', correctVerb: 'are', wrongVerbs: ['am', 'is'] },
      { pronoun: 'they', correctVerb: 'are', wrongVerbs: ['am', 'is'] }
    ];

    this.predicates = [
      'happy', 'a teacher', 'at home', 'ready', 'students',
      'tired', 'my friend', 'busy', 'here', 'late'
    ];

    this.explanations = {
      'I': '\'I\' always uses "am"',
      'you': '\'You\' always uses "are"',
      'he': 'He/She/It uses "is"',
      'she': 'He/She/It uses "is"',
      'it': 'He/She/It uses "is"',
      'we': 'We/They use "are"',
      'they': 'We/They use "are"'
    };
  }

  generate(difficulty = 'medium') {
    const subject = this._randomItem(this.subjects);
    const predicate = this._randomItem(this.predicates);
    const wrongVerb = this._randomItem(subject.wrongVerbs);

    const pronoun = this._capitalize(subject.pronoun);
    const sentence = `${pronoun} <span class="error-highlight">${wrongVerb}</span> ${predicate}`;

    // Generate fix options
    const correctFix = `Change '${wrongVerb}' to '${subject.correctVerb}'`;
    const wrongOptions = [
      `Change '${pronoun}' to another pronoun`,
      `Add 'not' after '${wrongVerb}'`,
      'No error'
    ];

    const options = this._shuffle([correctFix, ...wrongOptions]);

    return {
      question: `<div style="margin-bottom: 1rem;">Find and fix the error:</div><div class="error-sentence">${sentence}</div>`,
      options,
      correctIndex: options.indexOf(correctFix),
      metadata: {
        type: 'error-correction',
        difficulty,
        explanation: this.explanations[subject.pronoun],
        correctVerb: subject.correctVerb
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
  window.ErrorCorrectionGenerator = ErrorCorrectionGenerator;
}
