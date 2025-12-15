/**
 * LESSON RENDERER MODULE
 * Handles UI rendering and DOM manipulation
 * Updated: Auto-insert images after paragraphs
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
   * Make all words in text interactive (clickable)
   * @param {string} text
   * @returns {string}
   */
  makeWordsInteractive(text) {
    // Regex to match words (letters and apostrophes)
    const wordRegex = /\b([a-zA-Z]+(?:'[a-zA-Z]+)?)\b/g;
    
    return text.replace(wordRegex, (match, word) => {
      // Skip very short words (a, I, is, to, etc.)
      if (word.length <= 2) {
        return this.escapeHTML(match);
      }
      
      const normalized = word.toLowerCase();
      
      // Create interactive word span
      return `<span class="interactive-word" 
                    data-word="${this.escapeHTML(normalized)}"
                    onclick="window.lessonEngine.showWordPopup('${this.escapeHTML(normalized)}', event)">
                ${this.escapeHTML(match)}
              </span>`;
    });
  }

  /**
   * Render reading content with clickable words AND automatic images
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

    // Get lesson ID for image paths - prioritize lessonEngine's ID
    const lessonId = window.lessonEngine?.lessonId || this.data.id;

    // Build vocabulary map for special highlighting
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

    // Process text to make words clickable (ALL WORDS now!)
    const processText = (text) => {
      return this.makeWordsInteractive(text);
    };

    // 🔥 IMAGE COUNTER - starts from 1
    let imageCounter = 1;

    const processedParagraphs = reading.map((para, index) => {
      let paraHTML = '';

      // Handle different paragraph types
      if (para.type === 'list') {
        const items = para.text.split('\n').filter(line => line.trim());
        paraHTML = `<ul style="padding-left: 20px; margin-bottom: 12px;">${items.map(item => `<li>${processText(item)}</li>`).join('')}</ul>`;
      } else if (para.type === 'fact') {
        // Special styling for fact boxes
        paraHTML = `
          <div style="margin: 16px 0; padding: 12px; background: rgba(79, 140, 255, 0.1); border-left: 3px solid var(--accent); border-radius: 8px;">
            ${para.title ? `<div style="font-weight: 600; font-size: 0.85rem; color: var(--accent); margin-bottom: 6px;">${this.escapeHTML(para.title)}</div>` : ''}
            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">${processText(para.text)}</p>
          </div>
        `;
      } else {
        // Regular paragraph
        paraHTML = `
          ${para.title ? `<h3 style="font-size: 1rem; font-weight: 600; margin: 16px 0 8px 0; color: var(--text-main);">${this.escapeHTML(para.title)}</h3>` : ''}
          <p class="reading-paragraph">${processText(para.text)}</p>
        `;
      }

      // 🔥 INSERT IMAGE AFTER PARAGRAPH (skip facts and lists)
      if (para.type !== 'fact' && para.type !== 'list') {
        const imageHTML = `
          <div class="reading-image-container" style="margin: var(--space-xl) 0;">
            <img class="reading-image" 
                 src="../images/${lessonId}(${imageCounter}).jpg" 
                 alt="Illustration for paragraph ${imageCounter}"
                 onerror="if(!this.dataset.fallback){this.dataset.fallback='1'; this.src=this.src.replace('.jpg','.jpeg');} else {this.parentElement.style.display='none';}"
                 loading="lazy"
                 style="width: 100%; max-width: 600px; height: auto; 
                        border-radius: var(--radius-lg); margin: 0 auto; 
                        display: block; box-shadow: var(--shadow-lg); 
                        transition: transform var(--transition-base);"
                 onmouseover="this.style.transform='scale(1.02)'"
                 onmouseout="this.style.transform='scale(1)'">
          </div>
        `;
        imageCounter++;
        return paraHTML + imageHTML;
      }

      return paraHTML;
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
   * @param {number} flashcardIndex - Index for flashcard mode
   * @returns {string} HTML string
   */
  renderVocabulary(mode, myWords, flashcardIndex = 0) {
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
      return header + this.renderFlashcard(vocabulary, flashcardIndex);
    }
  }

  /**
   * Render vocabulary list
   */
  renderVocabList(vocabulary, phrases, myWords) {
    const vocabItems = vocabulary.map(item => {
      const { en: word, transcription: phonetic, ru: definition, example, part_of_speech, image } = item;
      const isSaved = myWords.some(w => w.word.toLowerCase() === word.toLowerCase());

      const safeWord = this.escapeHTML(word).replace(/'/g, "\\'");
      const safeDef = this.escapeHTML(definition).replace(/'/g, "\\'");
      const safePhonetic = this.escapeHTML(phonetic || '').replace(/'/g, "\\'");

      return `
        <div class="vocab-item">
          ${image ? `<div style="margin-bottom: 8px;"><img src="../images/${image}" alt="${this.escapeHTML(word)}" style="max-width: 100%; height: auto; border-radius: 8px;" onerror="this.style.display='none'"></div>` : ''}
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
              ${phrase.context ? `<div class="vocab-example" style="font-style: italic;">Context: ${this.escapeHTML(phrase.context)}</div>` : ''}
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
    if (!vocabulary || vocabulary.length === 0) {
      return '<p class="text-soft">No vocabulary for flashcards.</p>';
    }

    // Normalize index
    index = Math.max(0, Math.min(index, vocabulary.length - 1));

    const item = vocabulary[index];
    const total = vocabulary.length;
    const safeWord = this.escapeHTML(item.en).replace(/'/g, "\\'");

    return `
      <div class="vocab-layout">
        <div>
          <div class="flashcard-shell">
            <div class="flashcard" id="flashcard" onclick="window.lessonEngine.flipFlashcard()" style="cursor: pointer;">
              <div class="flashcard-face flashcard-front">
                ${item.image ? `<div style="margin-bottom: 12px;"><img src="../images/${item.image}" alt="${this.escapeHTML(item.en)}" style="max-width: 100%; max-height: 120px; object-fit: contain; border-radius: 8px;" onerror="this.style.display='none'"></div>` : ''}
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
                ${item.part_of_speech ? `<div style="margin-top: 8px;"><span class="tag">${this.escapeHTML(item.part_of_speech)}</span></div>` : ''}
              </div>
            </div>
            <div class="flashcard-controls">
              <button class="icon-btn" onclick="window.lessonEngine.prevFlashcard(); event.stopPropagation();" aria-label="Previous">
                <span>⬅</span> Prev
              </button>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span class="flashcard-index">${index + 1} / ${total}</span>
                <button class="icon-btn primary" onclick="window.lessonEngine.speakWord('${safeWord}'); event.stopPropagation();" aria-label="Speak">
                  <span>🔊</span>
                </button>
              </div>
              <button class="icon-btn" onclick="window.lessonEngine.nextFlashcard(); event.stopPropagation();" aria-label="Next">
                Next <span>➡</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render grammar section with rules and examples
   */
  renderGrammar() {
    const grammar = this.data.grammar;

    if (!grammar || Object.keys(grammar).length === 0) {
      return '<p class="text-soft">No grammar content available.</p>';
    }

    const { title, explanation, rules, examples } = grammar;

    // Render rules section
    const rulesHTML = rules && Array.isArray(rules) ? rules.map(rule => {
      const examplesList = rule.examples && Array.isArray(rule.examples) 
        ? `<ul style="padding-left: 20px; margin-top: 8px;">
            ${rule.examples.map(ex => `<li style="margin-bottom: 4px; color: var(--text-soft);">${this.escapeHTML(ex)}</li>`).join('')}
          </ul>`
        : '';
      
      return `
        <div style="padding: 12px; background: rgba(9, 13, 32, 0.5); border-radius: var(--radius-md); margin-bottom: 12px; border-left: 3px solid var(--accent);">
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--accent); margin-bottom: 6px;">
            ${this.escapeHTML(rule.rule)}
          </div>
          ${examplesList}
        </div>
      `;
    }).join('') : '';

    // Render examples section
    const examplesHTML = examples ? `
      <div style="margin-top: 20px;">
        <h3 style="font-size: 1rem; font-weight: 650; color: var(--text-main); margin-bottom: 12px;">📝 Practice Examples</h3>
        ${examples.affirmative && examples.affirmative.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">Affirmative</div>
            <ul style="padding-left: 20px;">
              ${examples.affirmative.map(ex => `<li style="margin-bottom: 6px; line-height: 1.5;">${this.escapeHTML(ex)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${examples.negative && examples.negative.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">Negative</div>
            <ul style="padding-left: 20px;">
              ${examples.negative.map(ex => `<li style="margin-bottom: 6px; line-height: 1.5;">${this.escapeHTML(ex)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${examples.questions && examples.questions.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">Questions</div>
            <ul style="padding-left: 20px;">
              ${examples.questions.map(ex => `<li style="margin-bottom: 6px; line-height: 1.5;">${this.escapeHTML(ex)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    ` : '';

    return `
      <div class="card-header">
        <h2 class="card-title">✏️ Grammar</h2>
      </div>
      <div style="margin-top: var(--space-md);">
        ${title ? `<h3 style="font-size: 1.1rem; font-weight: 650; color: var(--text-main); margin-bottom: 12px;">${this.escapeHTML(title)}</h3>` : ''}
        ${explanation ? `<p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">${this.escapeHTML(explanation)}</p>` : ''}
        ${rulesHTML}
        ${examplesHTML}
      </div>
    `;
  }

  /**
   * Render quiz - supports both array and object with questions
   */
  renderQuiz(quizState) {
    let quiz = this.data.quiz;

    // Handle both formats: array or object with questions
    if (!quiz) {
      return '<p class="text-soft">No quiz available.</p>';
    }

    // If quiz is array, wrap it
    let questions = Array.isArray(quiz) ? quiz : (quiz.questions || []);

    if (questions.length === 0) {
      return '<p class="text-soft">No quiz available.</p>';
    }

    if (quizState.completed) {
      return this.renderQuizResults(quizState, questions.length);
    }

    const question = questions[quizState.currentQuestionIndex];
    const progress = Math.round(((quizState.currentQuestionIndex + 1) / questions.length) * 100);

    // Support both 'q'/'question' and 'opts'/'options'
    const questionText = question.question || question.q || 'No question text';
    const options = question.options || question.opts || [];

    return `
      <div class="card-header">
        <h2 class="card-title">⚡ Quiz</h2>
        <div class="quiz-progress">Question ${quizState.currentQuestionIndex + 1} / ${questions.length}</div>
      </div>
      <div class="quiz-body">
        <p class="quiz-question">${this.escapeHTML(questionText)}</p>
        <div class="quiz-options" id="quiz-options">
          ${options.map((opt, i) => `
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
  renderQuizResults(quizState, totalQuestions) {
    const total = totalQuestions || quizState.answers.length;
    const correct = quizState.answers.filter(a => a.correct).length;
    const percentage = Math.round((correct / total) * 100);

    let emoji = '🎉';
    let message = 'Excellent!';
    if (percentage < 60) {
      emoji = '💪';
      message = 'Keep practicing!';
    } else if (percentage < 80) {
      emoji = '👍';
      message = 'Good job!';
    }

    return `
      <div class="card-header">
        <h2 class="card-title">🏆 Quiz Complete!</h2>
      </div>
      <div class="mt-md" style="text-align: center;">
        <div style="font-size: 3rem; margin: 20px 0;">${emoji}</div>
        <div style="font-size: 2rem; font-weight: 600; margin-bottom: 8px;">${percentage}%</div>
        <p style="font-size: 1.1rem; margin-bottom: 8px;">${message}</p>
        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 20px;">You scored ${correct} out of ${total}</p>
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