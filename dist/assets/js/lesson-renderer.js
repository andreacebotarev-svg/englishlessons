/**
 * LESSON RENDERER MODULE
 * Handles UI rendering and DOM manipulation
 */

class LessonRenderer {
  constructor(lessonData, tts, storage) {
    this.data = lessonData;
    this.tts = tts;
    this.storage = storage;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Render reading content with clickable words
   * @param {Array} myWords - Currently saved words
   * @returns {string} HTML string
   */
  renderReading(myWords) {
    const reading = this.data.content?.reading;
    if (!reading || !Array.isArray(reading) || reading.length === 0) {
      return '<p class="text-soft">No reading content available.</p>';
    }

    const allText = reading.map(para => para.text).join(' ');
    const wordCount = allText.split(/\s+/).length;

    // Build vocabulary map
    const vocabMap = {};
    if (this.data.vocabulary?.words) {
      this.data.vocabulary.words.forEach(item => {
        const word = item.en.toLowerCase();
        vocabMap[word] = {
          word: item.en,
          definition: item.ru,
          phonetic: item.transcription || ''
        };
      });
    }

    // Process text to make words clickable
    const processText = (text) => {
      return text.replace(/\b[\w']+\b/g, (word) => {
        const normalized = word.toLowerCase().replace(/[.,!?;:()]/g, '');
        if (vocabMap[normalized]) {
          const isSaved = myWords.some(w => w.word.toLowerCase() === normalized);
          const savedClass = isSaved ? ' saved' : '';
          const item = vocabMap[normalized];
          return `<span class="word-clickable${savedClass}" 
                      data-word="${this.escapeHTML(item.word)}" 
                      data-definition="${this.escapeHTML(item.definition)}" 
                      data-phonetic="${this.escapeHTML(item.phonetic)}">${this.escapeHTML(word)}</span>`;
        }
        return this.escapeHTML(word);
      });
    };

    const processedParagraphs = reading.map(para => {
      if (para.type === 'list') {
        const items = para.text.split('\n').filter(line => line.trim());
        return `<ul style="padding-left: 20px; margin-bottom: 12px;">${items.map(item => `<li>${processText(item)}</li>`).join('')}</ul>`;
      }
      return `<p class="reading-paragraph">${processText(para.text)}</p>`;
    }).join('');

    return `
      <div class="card-header">
        <h2 class="card-title">📖 Reading</h2>
      </div>
      <div class="reading-controls">
        <div class="reading-controls-left">
          <button class="primary-btn secondary" onclick="window.lessonEngine.speakAllReading()">
            <span>🔊</span> Listen
          </button>
        </div>
        <div class="reading-controls-right">
          ${wordCount} words
        </div>
      </div>
      <div class="reading-body">
        ${processedParagraphs}
      </div>
    `;
  }

  /**
   * Render vocabulary list or flashcards
   * @param {string} mode - 'list' or 'flashcard'
   * @param {Array} myWords - Currently saved words
   * @returns {string} HTML string
   */
  renderVocabulary(mode, myWords) {
    const vocabulary = this.data.vocabulary?.words;
    const phrases = this.data.vocabulary?.phrases;

    if (!vocabulary || !Array.isArray(vocabulary) || vocabulary.length === 0) {
      return '<p class="text-soft">No vocabulary available.</p>';
    }

    const header = `
      <div class="card-header">
        <h2 class="card-title">📚 Vocabulary</h2>
        <div class="vocab-mode-toggle">
          <button class="vocab-mode-btn ${mode === 'list' ? 'active' : ''}" data-mode="list">
            List
          </button>
          <button class="vocab-mode-btn ${mode === 'flashcard' ? 'active' : ''}" data-mode="flashcard">
            Flashcards
          </button>
        </div>
      </div>
    `;

    if (mode === 'list') {
      return header + this.renderVocabList(vocabulary, phrases, myWords);
    } else {
      return header + this.renderFlashcard(vocabulary, 0);
    }
  }

  /**
   * Render vocabulary list
   */
  renderVocabList(vocabulary, phrases, myWords) {
    const vocabItems = vocabulary.map(item => {
      const { en: word, transcription: phonetic, ru: definition, example, part_of_speech } = item;
      const isSaved = myWords.some(w => w.word.toLowerCase() === word.toLowerCase());

      const safeWord = this.escapeHTML(word).replace(/'/g, "\\'");
      const safeDef = this.escapeHTML(definition).replace(/'/g, "\\'");
      const safePhonetic = this.escapeHTML(phonetic || '').replace(/'/g, "\\'");

      return `
        <div class="vocab-item">
          <div class="vocab-top-line">
            <div>
              <span class="vocab-word">${this.escapeHTML(word)}</span>
              ${phonetic ? `<span class="vocab-phonetic">${this.escapeHTML(phonetic)}</span>` : ''}
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="icon-btn primary" onclick="window.lessonEngine.speakWord('${safeWord}')" aria-label="Speak word">
                <span>🔊</span>
              </button>
              <button class="icon-btn ${isSaved ? 'danger' : ''}" 
                      onclick="window.lessonEngine.toggleWordFromVocab('${safeWord}', '${safeDef}', '${safePhonetic}')"
                      aria-label="${isSaved ? 'Remove word' : 'Save word'}">
                <span>${isSaved ? '❌' : '⭐'}</span>
              </button>
            </div>
          </div>
          <div class="vocab-definition">${this.escapeHTML(definition)}</div>
          ${example ? `<div class="vocab-example">"${this.escapeHTML(example)}"</div>` : ''}
          ${part_of_speech ? `<div class="vocab-tags"><span class="tag">${this.escapeHTML(part_of_speech)}</span></div>` : ''}
        </div>
      `;
    }).join('');

    const phrasesSection = phrases && Array.isArray(phrases) && phrases.length > 0 ? `
      <div class="mt-md">
        <h3 class="card-subtitle" style="margin-bottom: 8px;">💬 Common Phrases</h3>
        ${phrases.map(phrase => {
          const safePhrase = this.escapeHTML(phrase.en).replace(/'/g, "\\'");
          return `
            <div class="vocab-item">
              <div class="vocab-top-line">
                <span class="vocab-word">${this.escapeHTML(phrase.en)}</span>
                <button class="icon-btn primary" onclick="window.lessonEngine.tts.speak('${safePhrase}')" aria-label="Speak phrase">
                  <span>🔊</span>
                </button>
              </div>
              <div class="vocab-definition">${this.escapeHTML(phrase.ru)}</div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '';

    return `
      <div class="vocab-layout">
        <div>
          <div class="vocab-list">
            ${vocabItems}
          </div>
        </div>
        <div>
          ${phrasesSection}
        </div>
      </div>
    `;
  }

  /**
   * Render single flashcard
   */
  renderFlashcard(vocabulary, index) {
    if (index >= vocabulary.length) {
      index = 0;
    }

    const item = vocabulary[index];
    const total = vocabulary.length;
    const safeWord = this.escapeHTML(item.en).replace(/'/g, "\\'");

    return `
      <div class="vocab-layout">
        <div>
          <div class="flashcard-shell">
            <div class="flashcard" id="flashcard">
              <div class="flashcard-face flashcard-front">
                <div class="flashcard-label">Word</div>
                <div class="flashcard-word">${this.escapeHTML(item.en)}</div>
                ${item.transcription ? `<div class="flashcard-definition">${this.escapeHTML(item.transcription)}</div>` : ''}
                <div style="margin-top: auto; font-size: 0.8rem; color: var(--text-soft);">
                  Click to reveal definition
                </div>
              </div>
              <div class="flashcard-face flashcard-back">
                <div class="flashcard-label">Definition</div>
                <div class="flashcard-word">${this.escapeHTML(item.ru)}</div>
                ${item.example ? `<div class="flashcard-definition" style="margin-top: 12px; font-size: 0.85rem;">"${this.escapeHTML(item.example)}"</div>` : ''}
              </div>
            </div>
            <div class="flashcard-controls">
              <button class="icon-btn" onclick="window.lessonEngine.prevFlashcard()" aria-label="Previous">
                <span>⬅</span>
              </button>
              <span class="flashcard-index">${index + 1} / ${total}</span>
              <button class="icon-btn" onclick="window.lessonEngine.nextFlashcard()" aria-label="Next">
                <span>➡</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render grammar section
   */
  renderGrammar() {
    const grammar = this.data.grammar;

    if (!grammar || Object.keys(grammar).length === 0) {
      return '<p class="text-soft">No grammar content available.</p>';
    }

    // Simple rendering - can be enhanced based on grammar structure
    return `
      <div class="card-header">
        <h2 class="card-title">✏️ Grammar</h2>
      </div>
      <div class="mt-md">
        <p class="text-soft">Grammar content rendering in progress...</p>
      </div>
    `;
  }

  /**
   * Render quiz
   */
  renderQuiz(quizState) {
    const quiz = this.data.quiz;

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return '<p class="text-soft">No quiz available.</p>';
    }

    if (quizState.completed) {
      return this.renderQuizResults(quizState);
    }

    const question = quiz.questions[quizState.currentQuestionIndex];
    const progress = Math.round(((quizState.currentQuestionIndex + 1) / quiz.questions.length) * 100);

    return `
      <div class="card-header">
        <h2 class="card-title">⚡ Quiz</h2>
        <div class="quiz-progress">Question ${quizState.currentQuestionIndex + 1} / ${quiz.questions.length}</div>
      </div>
      <div class="quiz-body">
        <p class="quiz-question">${this.escapeHTML(question.question)}</p>
        <div class="quiz-options" id="quiz-options">
          ${question.options.map((opt, i) => `
            <button class="quiz-option" onclick="window.lessonEngine.selectQuizAnswer(${i})">
              ${this.escapeHTML(opt)}
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback"></div>
      </div>
      <div class="quiz-footer">
        <div class="quiz-progress">${progress}% Complete</div>
      </div>
    `;
  }

  /**
   * Render quiz results
   */
  renderQuizResults(quizState) {
    const total = quizState.answers.length;
    const correct = quizState.answers.filter(a => a.correct).length;
    const percentage = Math.round((correct / total) * 100);

    return `
      <div class="card-header">
        <h2 class="card-title">🏆 Quiz Complete!</h2>
      </div>
      <div class="mt-md" style="text-align: center;">
        <div style="font-size: 3rem; margin: 20px 0;">${percentage}%</div>
        <p style="font-size: 1.1rem; margin-bottom: 20px;">You scored ${correct} out of ${total}</p>
        <button class="primary-btn" onclick="window.lessonEngine.resetQuiz()">
          <span>🔄</span> Try Again
        </button>
      </div>
    `;
  }

  /**
   * Render sidebar with saved words
   */
  renderSidebar(myWords) {
    if (myWords.length === 0) {
      return `
        <div class="sidebar-empty">
          No saved words yet. Click on words in the reading to add them here.
        </div>
      `;
    }

    return myWords.map(word => {
      const safeWord = this.escapeHTML(word.word).replace(/'/g, "\\'");
      return `
        <div class="sidebar-word">
          <div class="sidebar-word-main">
            <span class="sidebar-word-text">${this.escapeHTML(word.word)}</span>
          </div>
          <div class="sidebar-word-meta">${this.escapeHTML(word.definition)}</div>
          <div class="sidebar-actions">
            <button class="icon-btn primary" onclick="window.lessonEngine.speakWord('${safeWord}')" aria-label="Speak">
              <span>🔊</span>
            </button>
            <button class="icon-btn danger" onclick="window.lessonEngine.removeWord('${safeWord}')" aria-label="Remove">
              <span>❌</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}