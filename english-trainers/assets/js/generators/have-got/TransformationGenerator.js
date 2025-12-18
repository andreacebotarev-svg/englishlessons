/**
 * HAVE GOT TRANSFORMATION GENERATOR
 * Positive→Negative/Question
 */

class HaveGotTransformationGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', verb: 'have', negative: 'haven\'t' },
      { pronoun: 'you', verb: 'have', negative: 'haven\'t' },
      { pronoun: 'he', verb: 'has', negative: 'hasn\'t' },
      { pronoun: 'she', verb: 'has', negative: 'hasn\'t' },
      { pronoun: 'we', verb: 'have', negative: 'haven\'t' },
      { pronoun: 'they', verb: 'have', negative: 'haven\'t' }
    ];

    this.objects = ['a brother', 'a dog', 'a car', 'a phone', 'a bike'];
    this.transformations = ['negative', 'question'];
  }

  generate(difficulty = 'hard') {
    const subject = this._randomItem(this.subjects);
    const object = this._randomItem(this.objects);
    const transformType = this._randomItem(this.transformations);

    const pronoun = this._capitalize(subject.pronoun);
    const sourceSentence = `${pronoun} ${subject.verb} got ${object}`;

    let instruction, correctAnswer, wrongOptions;

    if (transformType === 'negative') {
      instruction = 'Make this sentence <strong>negative</strong>:';
      correctAnswer = `${pronoun} ${subject.negative} got ${object}`;
      wrongOptions = [
        `${pronoun} ${subject.verb} not got ${object}`,
        `${pronoun} not ${subject.verb} got ${object}`,
        `${pronoun} don't have got ${object}`
      ];
    } else {
      instruction = 'Make this a <strong>question</strong>:';
      correctAnswer = `${this._capitalize(subject.verb)} ${subject.pronoun} got ${object}?`;
      wrongOptions = [
        `${pronoun} ${subject.verb} got ${object}?`,
        `Do ${subject.pronoun} ${subject.verb} got ${object}?`,
        `${pronoun} got ${object}?`
      ];
    }

    const options = this._shuffle([correctAnswer, ...wrongOptions]);

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
        hint: transformType === 'negative' ? 'Use haven\'t/hasn\'t got' : 'Have/Has + subject + got'
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
  window.HaveGotTransformationGenerator = HaveGotTransformationGenerator;
}
