/**
 * HAVE GOT RECOGNITION GENERATOR
 * "Which sentence is correct?" for have got/has got
 */

class HaveGotRecognitionGenerator {
  constructor() {
    this.subjects = [
      { pronoun: 'I', verb: 'have' },
      { pronoun: 'you', verb: 'have' },
      { pronoun: 'he', verb: 'has' },
      { pronoun: 'she', verb: 'has' },
      { pronoun: 'it', verb: 'has' },
      { pronoun: 'we', verb: 'have' },
      { pronoun: 'they', verb: 'have' }
    ];

    this.objects = {
      family: ['a brother', 'a sister', 'two brothers', 'three sisters'],
      pets: ['a dog', 'a cat', 'two cats', 'a hamster', 'a parrot'],
      items: ['a car', 'a bike', 'a laptop', 'a phone', 'a tablet']
    };
  }

  generate(difficulty = 'easy') {
    const subject = this._randomItem(this.subjects);
    const category = this._randomItem(Object.keys(this.objects));
    const object = this._randomItem(this.objects[category]);

    const pronoun = this._capitalize(subject.pronoun);
    const correctSentence = `${pronoun} ${subject.verb} got ${object}`;

    // Generate wrong options
    const wrongVerb = subject.verb === 'have' ? 'has' : 'have';
    const wrongOptions = [
      `${pronoun} ${wrongVerb} got ${object}`,
      `${pronoun} ${subject.verb} ${object}`,
      `${pronoun} got ${object}`
    ];

    const options = this._shuffle([correctSentence, ...wrongOptions]);

    return {
      question: 'Which sentence is <strong>correct</strong>?',
      options,
      correctIndex: options.indexOf(correctSentence),
      metadata: {
        type: 'recognition',
        difficulty,
        pronoun: subject.pronoun,
        verb: subject.verb
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
  window.HaveGotRecognitionGenerator = HaveGotRecognitionGenerator;
}
