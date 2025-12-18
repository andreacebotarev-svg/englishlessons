/**
 * CONTEXT/DIALOGUE GENERATOR
 * Procedural dialogue generation with multiple blanks
 */

class ContextGenerator {
  constructor() {
    this.dialogueTemplates = [
      {
        pattern: 'location',
        template: [
          '<p><strong>A:</strong> Where {verb1} {subject1}?</p>',
          '<p><strong>B:</strong> {Subject1} {verb1} at {location}.</p>'
        ]
      },
      {
        pattern: 'readiness',
        template: [
          '<p><strong>A:</strong> {Verb2} {subject2} ready?</p>',
          '<p><strong>B:</strong> Yes, {subject3} {verb3} ready!</p>'
        ]
      },
      {
        pattern: 'activity',
        template: [
          '<p><strong>A:</strong> What {verb1} {subject1} doing?</p>',
          '<p><strong>B:</strong> {Subject1} {verb1} {activity}.</p>'
        ]
      },
      {
        pattern: 'status',
        template: [
          '<p><strong>A:</strong> {Verb1} {subject1} {adjective}?</p>',
          '<p><strong>B:</strong> No, {subject1} {verb1} not {adjective}.</p>'
        ]
      }
    ];

    this.subjects = [
      { pronoun: 'you', verb: 'are', pair: { pronoun: 'I', verb: 'am' } },
      { pronoun: 'he', verb: 'is', pair: { pronoun: 'he', verb: 'is' } },
      { pronoun: 'she', verb: 'is', pair: { pronoun: 'she', verb: 'is' } },
      { pronoun: 'they', verb: 'are', pair: { pronoun: 'they', verb: 'are' } },
      { pronoun: 'we', verb: 'are', pair: { pronoun: 'we', verb: 'are' } }
    ];

    this.vocabulary = {
      location: ['school', 'home', 'work', 'the park', 'the store'],
      activity: ['studying', 'working', 'playing', 'reading', 'cooking'],
      adjective: ['happy', 'tired', 'busy', 'ready', 'late']
    };
  }

  generate(difficulty = 'hard') {
    const dialogueTemplate = this._randomItem(this.dialogueTemplates);
    const subject = this._randomItem(this.subjects);
    
    // Build dialogue
    let dialogue = dialogueTemplate.template.join('\n');

    // Replace placeholders
    dialogue = dialogue
      .replace(/{subject1}/g, subject.pronoun)
      .replace(/{Subject1}/g, this._capitalize(subject.pronoun))
      .replace(/{verb1}/g, subject.verb)
      .replace(/{Verb1}/g, this._capitalize(subject.verb))
      .replace(/{subject2}/g, subject.pair.pronoun)
      .replace(/{Verb2}/g, this._capitalize(subject.pair.verb))
      .replace(/{subject3}/g, subject.pair.pronoun)
      .replace(/{verb3}/g, subject.pair.verb);

    // Fill vocabulary
    if (dialogueTemplate.pattern === 'location') {
      dialogue = dialogue.replace('{location}', this._randomItem(this.vocabulary.location));
    } else if (dialogueTemplate.pattern === 'activity') {
      dialogue = dialogue.replace('{activity}', this._randomItem(this.vocabulary.activity));
    } else if (dialogueTemplate.pattern === 'status') {
      dialogue = dialogue.replace(/{adjective}/g, this._randomItem(this.vocabulary.adjective));
    }

    // Convert verbs to blanks
    const blanks = [];
    dialogue = dialogue.replace(/\{verb1\}/g, () => {
      blanks.push(subject.verb);
      return '____';
    });
    dialogue = dialogue.replace(/\{Verb2\}/g, () => {
      blanks.push(this._capitalize(subject.pair.verb));
      return '____';
    });
    dialogue = dialogue.replace(/\{verb3\}/g, () => {
      blanks.push(subject.pair.verb);
      return '____';
    });

    // Generate answer (verb combination)
    const correctAnswer = blanks.join(' / ');
    const wrongOptions = this._generateWrongCombinations(blanks);

    const options = this._shuffle([correctAnswer, ...wrongOptions]);

    return {
      question: `<div style="margin-bottom: 1rem; font-weight: 600;">Complete the dialogue:</div><div class="dialogue">${dialogue}</div>`,
      options,
      correctIndex: options.indexOf(correctAnswer),
      metadata: {
        type: 'context',
        difficulty,
        explanation: `Correct verbs: ${correctAnswer}`
      }
    };
  }

  _generateWrongCombinations(correctVerbs) {
    const allVerbs = ['am', 'is', 'are', 'Am', 'Is', 'Are'];
    const wrong = [];

    // Generate 3 plausible wrong combinations
    while (wrong.length < 3) {
      const combination = correctVerbs.map((v, i) => {
        // 50% chance to swap with wrong verb
        if (Math.random() < 0.5) {
          const wrongVerb = this._randomItem(allVerbs.filter(av => av.toLowerCase() !== v.toLowerCase()));
          return v === v.toUpperCase() ? this._capitalize(wrongVerb) : wrongVerb.toLowerCase();
        }
        return v;
      }).join(' / ');

      if (!wrong.includes(combination) && combination !== correctVerbs.join(' / ')) {
        wrong.push(combination);
      }
    }

    return wrong;
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
  window.ContextGenerator = ContextGenerator;
}
