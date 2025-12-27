/**
 * PRESENT SIMPLE TRANSFORMATION GENERATOR
 * Positive→Negative/Question with do/does
 */

class PresentSimpleTransformationGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', auxiliary: 'do', usesBase: true },
      { pronoun: 'you', auxiliary: 'do', usesBase: true },
      { pronoun: 'he', auxiliary: 'does', usesBase: false },
      { pronoun: 'she', auxiliary: 'does', usesBase: false },
      { pronoun: 'we', auxiliary: 'do', usesBase: true },
      { pronoun: 'they', auxiliary: 'do', usesBase: true }
    ];

    this.verbs = [
      { base: 'work', s: 'works' },
      { base: 'play', s: 'plays' },
      { base: 'study', s: 'studies' },
      { base: 'like', s: 'likes' },
      { base: 'live', s: 'lives' },
      { base: 'watch', s: 'watches' }
    ];

    this.complements = ['every day', 'at home', 'often', 'there', 'hard'];
    this.transformations = ['negative', 'question'];
  }

  generate(difficulty = 'hard') {
    const subject = this._randomItem(this.subjects);
    const verb = this._randomItem(this.verbs);
    const complement = this._randomItem(this.complements);
    const transformType = this._randomItem(this.transformations);

    const pronoun = this._capitalize(subject.pronoun);
    const verbForm = subject.usesBase ? verb.base : verb.s;
    const sourceSentence = `${pronoun} ${verbForm} ${complement}`;

    let instruction, correctAnswer, wrongOptions;

    if (transformType === 'negative') {
      instruction = 'Make this sentence <strong>negative</strong>:';
      correctAnswer = `${pronoun} ${subject.auxiliary} not ${verb.base} ${complement}`;
      wrongOptions = [
        `${pronoun} not ${verbForm} ${complement}`,
        `${pronoun} ${subject.auxiliary}n't ${verbForm} ${complement}`,
        `${pronoun} don't ${verbForm} ${complement}`
      ];
    } else {
      instruction = 'Make this a <strong>question</strong>:';
      correctAnswer = `${this._capitalize(subject.auxiliary)} ${subject.pronoun} ${verb.base} ${complement}?`;
      wrongOptions = [
        `${pronoun} ${subject.auxiliary} ${verb.base} ${complement}?`,
        `${this._capitalize(subject.auxiliary)} ${pronoun} ${verbForm} ${complement}?`,
        `${pronoun} ${verbForm} ${complement}?`
      ];
    }

    const options = this._shuffle([correctAnswer, ...wrongOptions.filter((opt, i, arr) => arr.indexOf(opt) === i)].slice(0, 4));

    return {
      question: `
        <div style="margin-bottom: 0.5rem;">${instruction}</div>
        <div class="transformation-sentence" style="font-size: 1.1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; margin: 1rem 0;">
          "${sourceSentence}"
        </div>
      `,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        type: 'transformation',
        difficulty,
        transformType,
        hint: transformType === 'negative' ? 'Use do/does + not + base verb' : 'Do/Does + subject + base verb'
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
  window.PresentSimpleTransformationGenerator = PresentSimpleTransformationGenerator;
}
