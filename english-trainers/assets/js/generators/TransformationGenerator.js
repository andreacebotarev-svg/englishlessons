/**
 * TRANSFORMATION GENERATOR
 * Positive → Negative / Question / Plural transformations
 */

class TransformationGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', verb: 'am', negative: 'I am not', question: 'Am I' },
      { pronoun: 'you', verb: 'are', negative: 'You are not', question: 'Are you' },
      { pronoun: 'he', verb: 'is', negative: 'He is not', question: 'Is he' },
      { pronoun: 'she', verb: 'is', negative: 'She is not', question: 'Is she' },
      { pronoun: 'it', verb: 'is', negative: 'It is not', question: 'Is it' },
      { pronoun: 'we', verb: 'are', negative: 'We are not', question: 'Are we' },
      { pronoun: 'they', verb: 'are', negative: 'They are not', question: 'Are they' }
    ];

    this.predicates = {
      adjective: ['happy', 'tired', 'ready', 'busy', 'late', 'hungry'],
      location: ['at home', 'at school', 'here', 'there'],
      noun: ['a student', 'a teacher', 'friends', 'students']
    };

    this.transformations = ['negative', 'question'];
  }

  generate(difficulty = 'hard') {
    const subject = this._randomItem(this.subjects);
    const predicateType = this._randomItem(Object.keys(this.predicates));
    const predicate = this._randomItem(this.predicates[predicateType]);
    const transformType = this._randomItem(this.transformations);

    const pronoun = this._capitalize(subject.pronoun);
    const sourceSentence = `${pronoun} ${subject.verb} ${predicate}`;

    let instruction, correctAnswer, wrongOptions;

    if (transformType === 'negative') {
      instruction = 'Make this sentence <strong>negative</strong>:';
      correctAnswer = `${subject.negative} ${predicate}`;
      wrongOptions = [
        `${pronoun} not ${subject.verb} ${predicate}`,
        `${pronoun} ${subject.verb} not ${predicate}`,
        `Not ${pronoun} ${subject.verb} ${predicate}`
      ];
    } else { // question
      instruction = 'Make this a <strong>question</strong>:';
      correctAnswer = `${subject.question} ${predicate}?`;
      wrongOptions = [
        `${pronoun} ${subject.verb} ${predicate}?`,
        `${subject.verb} ${pronoun} ${predicate}?`,
        `${pronoun} ${predicate} ${subject.verb}?`
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
        hint: transformType === 'negative' ? "Place 'not' after 'to be'" : "Move 'to be' before subject"
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
  window.TransformationGenerator = TransformationGenerator;
}
