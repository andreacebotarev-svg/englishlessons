/**
 * ERROR CORRECTION QUESTION GENERATOR
 * Generates "Find the error" questions by injecting wrong verb forms.
 */

class ErrorCorrectionGenerator {
  constructor(config = {}) {
    this.verbMap = config.verbMap || {
      'I': 'am',
      'you': 'are',
      'he': 'is',
      'she': 'is',
      'it': 'is',
      'we': 'are',
      'they': 'are'
    };

    this.templates = [
      '{{pronoun}} {{wrongVerb}} a teacher',
      '{{pronoun}} {{wrongVerb}} at home',
      '{{pronoun}} {{wrongVerb}} very happy',
      '{{pronoun}} {{wrongVerb}} my friend',
      '{{pronoun}} {{wrongVerb}} always busy',
      '{{pronoun}} {{wrongVerb}} ready now',
      '{{pronoun}} {{wrongVerb}} from Russia',
      '{{pronoun}} {{wrongVerb}} a student',
      '{{pronoun}} {{wrongVerb}} tired today',
      '{{pronoun}} {{wrongVerb}} here'
    ];

    this.errorExplanations = {
      'I': "'I' always uses 'am'",
      'you': "'You' always uses 'are' (singular and plural)",
      'he': "Use 'is' with 3rd person singular (he/she/it)",
      'she': "Use 'is' with 3rd person singular (he/she/it)",
      'it': "Use 'is' with 3rd person singular (he/she/it)",
      'we': "Use 'are' with plural subjects (we/they)",
      'they': "Use 'are' with plural subjects (we/they)"
    };
  }

  generate() {
    const pronouns = Object.keys(this.verbMap);
    const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
    const correctVerb = this.verbMap[pronoun];
    const wrongVerbs = ['am', 'is', 'are'].filter(v => v !== correctVerb);
    const wrongVerb = wrongVerbs[Math.floor(Math.random() * wrongVerbs.length)];

    const template = this.templates[Math.floor(Math.random() * this.templates.length)];
    
    const sentence = template
      .replace('{{pronoun}}', this._capitalize(pronoun))
      .replace('{{wrongVerb}}', `<span class="error-highlight">${wrongVerb}</span>`);

    const options = [
      `Change '${wrongVerb}' to '${correctVerb}'`,
      `Change '${this._capitalize(pronoun)}' to another pronoun`,
      `Add 'not' after '${wrongVerb}'`,
      'No error'
    ];

    return {
      question: `<div style="margin-bottom: 1rem;">Find and fix the error:</div><div class="error-sentence">${sentence}</div>`,
      options: this._shuffle(options),
      correctIndex: this._shuffle(options).indexOf(options[0]),
      metadata: {
        type: 'error-correction',
        pronoun,
        correctVerb,
        wrongVerb,
        explanation: this.errorExplanations[pronoun],
        generatedFrom: 'ErrorCorrectionGenerator'
      }
    };
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

if (typeof window !== 'undefined') {
  window.ErrorCorrectionGenerator = ErrorCorrectionGenerator;
}
