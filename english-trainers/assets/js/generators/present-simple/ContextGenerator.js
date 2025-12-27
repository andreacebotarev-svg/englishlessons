/**
 * PRESENT SIMPLE CONTEXT GENERATOR
 * Dialogues about daily routines and habits
 */

class PresentSimpleContextGenerator {
  constructor() {
    this.dialogueTemplates = [
      {
        pattern: 'routine',
        template: [
          '<p><strong>A:</strong> What {aux1} {subject1} do every morning?</p>',
          '<p><strong>B:</strong> {Subject1} {verb1} and then {verb2}.</p>'
        ]
      },
      {
        pattern: 'hobby',
        template: [
          '<p><strong>A:</strong> {Aux2} {subject2} like sports?</p>',
          '<p><strong>B:</strong> Yes, {subject2} {verb1} every weekend.</p>'
        ]
      },
      {
        pattern: 'frequency',
        template: [
          '<p><strong>A:</strong> How often {aux1} {subject1} {activity}?</p>',
          '<p><strong>B:</strong> {Subject1} {verb1} {frequency}.</p>'
        ]
      }
    ];

    this.subjects = [
      { pronoun: 'you', auxiliary: 'do', pair: { pronoun: 'I', auxiliary: 'do' } },
      { pronoun: 'he', auxiliary: 'does', pair: { pronoun: 'he', auxiliary: 'does' } },
      { pronoun: 'she', auxiliary: 'does', pair: { pronoun: 'she', auxiliary: 'does' } },
      { pronoun: 'they', auxiliary: 'do', pair: { pronoun: 'they', auxiliary: 'do' } }
    ];

    this.verbs = [
      { base: 'play', s: 'plays', meaning: 'sports/games' },
      { base: 'study', s: 'studies', meaning: 'at library' },
      { base: 'work', s: 'works', meaning: 'hard' },
      { base: 'watch', s: 'watches', meaning: 'TV' },
      { base: 'go', s: 'goes', meaning: 'to school' }
    ];

    this.vocabulary = {
      activity: ['go to school', 'play sports', 'study English', 'watch TV'],
      frequency: ['every day', 'twice a week', 'often', 'sometimes', 'rarely']
    };
  }

  generate(difficulty = 'hard') {
    const dialogueTemplate = this._randomItem(this.dialogueTemplates);
    const subject = this._randomItem(this.subjects);
    const verb = this._randomItem(this.verbs);

    // Determine verb form
    const verbForm = subject.auxiliary === 'does' ? verb.s : verb.base;

    let dialogue = dialogueTemplate.template.join('\n');

    // Replace placeholders
    dialogue = dialogue
      .replace(/{subject1}/g, subject.pronoun)
      .replace(/{Subject1}/g, this._capitalize(subject.pronoun))
      .replace(/{aux1}/g, subject.auxiliary)
      .replace(/{Aux1}/g, this._capitalize(subject.auxiliary))
      .replace(/{subject2}/g, subject.pair.pronoun)
      .replace(/{Aux2}/g, this._capitalize(subject.pair.auxiliary))
      .replace(/{verb1}/g, verbForm)
      .replace(/{verb2}/g, this._randomItem(this.verbs)[subject.auxiliary === 'does' ? 's' : 'base']);

    // Fill vocabulary
    if (dialogueTemplate.pattern === 'frequency') {
      dialogue = dialogue
        .replace('{activity}', this._randomItem(this.vocabulary.activity))
        .replace('{frequency}', this._randomItem(this.vocabulary.frequency));
    }

    // Convert verbs/auxiliaries to blanks
    const blanks = [];
    const auxRegex = new RegExp(`\\b(${subject.auxiliary}|${this._capitalize(subject.auxiliary)})\\b`, 'g');
    dialogue = dialogue.replace(auxRegex, (match) => {
      blanks.push(match);
      return '____';
    });

    // Generate answer
    const correctAnswer = blanks.join(' / ');
    const wrongOptions = this._generateWrongCombinations(blanks, subject.auxiliary);

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

  _generateWrongCombinations(correctBlanks, correctAux) {
    const wrongAux = correctAux === 'do' ? 'does' : 'do';
    const wrong = [];

    // Generate 3 plausible wrongs
    for (let i = 0; i < 3; i++) {
      const combination = correctBlanks.map((blank, idx) => {
        if (Math.random() < 0.4) {
          const isCapitalized = blank[0] === blank[0].toUpperCase();
          return isCapitalized ? this._capitalize(wrongAux) : wrongAux;
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
  window.PresentSimpleContextGenerator = PresentSimpleContextGenerator;
}
