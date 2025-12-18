/**
 * FILL-IN-BLANK QUESTION GENERATOR
 * Generates "I ____ happy" questions with dynamic templates.
 */

class FillInGenerator {
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

    // Template pools by difficulty
    this.templates = {
      easy: [
        '{{pronoun}} ____ a student',
        '{{pronoun}} ____ happy',
        '{{pronoun}} ____ tired',
        '{{pronoun}} ____ ready',
        '{{pronoun}} ____ at home',
        '{{pronoun}} ____ very tall',
        '{{pronoun}} ____ from Japan',
        '{{pronoun}} ____ my friend',
        '{{pronoun}} ____ a teacher',
        '{{pronoun}} ____ hungry'
      ],
      medium: [
        '{{pronoun}} ____ not ready',
        '{{pronoun}} ____ always late',
        '{{pronoun}} ____ never wrong',
        '{{pronoun}} ____ not here today',
        '{{pronoun}} ____ very busy now',
        '{{pronoun}} ____ not feeling well',
        '{{pronoun}} ____ usually quiet',
        '{{pronoun}} ____ not happy',
        '{{pronoun}} ____ still waiting',
        '{{pronoun}} ____ often tired'
      ],
      hard: [
        '{{pronoun}} ____ about to leave',
        '{{pronoun}} ____ supposed to call',
        '{{pronoun}} ____ being very careful',
        '{{pronoun}} ____ going to win',
        '{{pronoun}} ____ getting better',
        '{{pronoun}} ____ always complaining',
        '{{pronoun}} ____ constantly working',
        '{{pronoun}} ____ trying to help',
        '{{pronoun}} ____ planning to move',
        '{{pronoun}} ____ learning English'
      ]
    };
  }

  generate(difficulty = 'easy') {
    const pronouns = Object.keys(this.verbMap);
    const pronoun = pronouns[Math.floor(Math.random() * pronouns.length)];
    const correctVerb = this.verbMap[pronoun];

    const pool = this.templates[difficulty] || this.templates.easy;
    const template = pool[Math.floor(Math.random() * pool.length)];

    const sentence = template
      .replace('{{pronoun}}', this._capitalize(pronoun))
      .replace('____', '<span class="blank">____</span>');

    const options = this._shuffle(['am', 'is', 'are']);

    return {
      question: sentence,
      options,
      correctIndex: options.indexOf(correctVerb),
      metadata: { 
        type: 'fill-in', 
        pronoun, 
        correctVerb,
        difficulty,
        generatedFrom: 'FillInGenerator'
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
  window.FillInGenerator = FillInGenerator;
}
