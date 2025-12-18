/**
 * HAVE GOT CONTEXT GENERATOR
 * Dialogues about possessions (family/pets/objects)
 */

class HaveGotContextGenerator {
  constructor() {
    this.dialogueTemplates = [
      {
        pattern: 'family',
        template: [
          '<p><strong>A:</strong> {Verb1} {subject1} got any siblings?</p>',
          '<p><strong>B:</strong> Yes, {subject1} {verb1} got {object}.</p>'
        ]
      },
      {
        pattern: 'pets',
        template: [
          '<p><strong>A:</strong> {Verb2} {subject2} {verb2} got a pet?</p>',
          '<p><strong>B:</strong> Yes, {subject2} {verb2} got {object}.</p>'
        ]
      },
      {
        pattern: 'items',
        template: [
          '<p><strong>A:</strong> What {verb1} {subject1} got?</p>',
          '<p><strong>B:</strong> {Subject1} {verb1} got {object}.</p>'
        ]
      }
    ];

    this.subjects = [
      { pronoun: 'you', verb: 'have', pair: { pronoun: 'I', verb: 'have' } },
      { pronoun: 'he', verb: 'has', pair: { pronoun: 'he', verb: 'has' } },
      { pronoun: 'she', verb: 'has', pair: { pronoun: 'she', verb: 'has' } },
      { pronoun: 'they', verb: 'have', pair: { pronoun: 'they', verb: 'have' } }
    ];

    this.objects = {
      family: ['a brother', 'two sisters', 'a sister and a brother'],
      pets: ['a dog', 'a cat', 'two cats'],
      items: ['a car', 'a bike', 'a new phone']
    };
  }

  generate(difficulty = 'hard') {
    const dialogueTemplate = this._randomItem(this.dialogueTemplates);
    const subject = this._randomItem(this.subjects);
    const object = this._randomItem(this.objects[dialogueTemplate.pattern]);

    let dialogue = dialogueTemplate.template.join('\n');

    // Replace placeholders
    dialogue = dialogue
      .replace(/{subject1}/g, subject.pronoun)
      .replace(/{Subject1}/g, this._capitalize(subject.pronoun))
      .replace(/{verb1}/g, subject.verb)
      .replace(/{Verb1}/g, this._capitalize(subject.verb))
      .replace(/{subject2}/g, subject.pair.pronoun)
      .replace(/{verb2}/g, subject.pair.verb)
      .replace(/{Verb2}/g, this._capitalize(subject.pair.verb))
      .replace(/{object}/g, object);

    // Convert verbs to blanks
    const blanks = [];
    const verbRegex = new RegExp(`\\b(${subject.verb}|${this._capitalize(subject.verb)})\\b`, 'g');
    dialogue = dialogue.replace(verbRegex, (match) => {
      blanks.push(match);
      return '____';
    });

    const correctAnswer = blanks.join(' / ');
    const wrongOptions = this._generateWrongCombinations(blanks, subject.verb);

    const options = this._shuffle([correctAnswer, ...wrongOptions]);

    return {
      question: `<div style="margin-bottom: 1rem; font-weight: 600;">Complete the dialogue:</div><div class="dialogue">${dialogue}</div>`,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        type: 'context',
        difficulty,
        explanation: `Correct: ${correctAnswer}`
      }
    };
  }

  _generateWrongCombinations(correctBlanks, correctVerb) {
    const wrongVerb = correctVerb === 'have' ? 'has' : 'have';
    const wrong = [];

    for (let i = 0; i < 3; i++) {
      const combination = correctBlanks.map((blank) => {
        if (Math.random() < 0.4) {
          const isCapitalized = blank[0] === blank[0].toUpperCase();
          return isCapitalized ? this._capitalize(wrongVerb) : wrongVerb;
        }
        return blank;
      }).join(' / ');

      if (!wrong.includes(combination) && combination !== correctBlanks.join(' / ')) {
        wrong.push(combination);
      }
    }

    return wrong.slice(0, 3);
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
  window.HaveGotContextGenerator = HaveGotContextGenerator;
}
