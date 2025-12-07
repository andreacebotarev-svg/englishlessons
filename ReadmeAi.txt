# 🎯 ПОЛНАЯ ИНСТРУКЦИЯ ДЛЯ НЕЙРОСЕТИ: ОБРАЗОВАТЕЛЬНЫЙ WEB-ПРОЕКТ

***

## 📖 ЧТО ЭТО ЗА ПРОЕКТ?

Ты работаешь над **интерактивным веб-приложением для изучения английского языка**. Это система уроков, где каждый урок — это отдельный HTML-файл, который:

1. **Загружает контент из JSON** (тексты, слова, грамматика, тесты)
2. **Делает каждое слово озвучиваемым** (Text-to-Speech через Google API)
3. **Предоставляет интерактивные упражнения** (квизы, карточки, грамматические правила)
4. **Сохраняет прогресс пользователя** (в LocalStorage браузера)

### Целевая аудитория:
- Школьники и студенты (уровни A0-C1)
- Самостоятельное изучение английского
- Работает на компьютерах, планшетах, смартфонах

### Технологии:
- **Только Vanilla JavaScript** (никаких фреймворков)
- **HTML5 + CSS3** (современные стандарты)
- **JSON** для хранения данных уроков
- **Google TTS API** для озвучки + Web Speech API как fallback

***

## 🏗️ АРХИТЕКТУРА ПРОЕКТА

### Структура файлов:

```
project/
│
├── index.html              # Портал входа (ввод номера урока)
│
├── data/                   # Папка с данными уроков
│   ├── 263.json            # Урок №263
│   ├── 264.json            # Урок №264
│   └── ...
│
└── dist/                   # Папка с готовыми HTML-файлами
    ├── 263.html            # Полностью автономный файл урока
    ├── 264.html
    └── ...
```

### Принцип работы:

```
Пользователь → index.html → вводит "263" 
                ↓
         dist/263.html загружается
                ↓
         JavaScript внутри 263.html делает fetch('../data/263.json')
                ↓
         JSON парсится → строится интерфейс
                ↓
         Пользователь видит готовый урок
```

***

## 📄 КЛЮЧЕВЫЕ КОМПОНЕНТЫ

### 1. JSON-ФАЙЛ (data/XXX.json)

**Это источник данных**. Он содержит:
- Заголовок урока
- Тексты для чтения (с подсветкой ключевых слов)
- Словарь (слова + переводы + примеры)
- Грамматические правила
- Тестовые вопросы (минимум 15)

**Структура JSON:**

```json
{
  "title": "How does the law affect you?",
  "subtitle": "Ages and Rights",
  "colors": ["#00838F", "#F5F5F7"],
  
  "meta": {
    "level": "B1",
    "tags": ["reading", "vocabulary", "law"],
    "theme": "dark",
    "duration": 30
  },
  
  "content": {
    "reading": [
      {
        "type": "paragraph",
        "title": "Voting",
        "text": "In most countries you can vote when you are 18...",
        "highlight": ["vote", "election", "politician"]
      }
    ],
    
    "vocabulary": {
      "words": [
        {
          "en": "vote",
          "ru": "голосовать",
          "transcription": "[vəʊt]",
          "example": "You can vote when you turn 18.",
          "part_of_speech": "verb"
        }
      ],
      "phrases": [
        {
          "en": "get married",
          "ru": "пожениться",
          "context": "Legal action"
        }
      ]
    },
    
    "grammar": {
      "title": "Modal Verbs: can/must",
      "explanation_ru": "Modal verbs выражают возможность или обязанность...",
      "rules": [
        {
          "pattern": "Subject + can + verb",
          "examples_positive": ["You can vote at 18"],
          "examples_negative": ["You cannot drink alcohol"]
        }
      ]
    }
  },
  
  "quiz": [
    {
      "q": "At what age can you vote in most countries?",
      "opts": ["16", "18", "21", "25"],
      "correct": 1,
      "fb": "Correct! In most countries, the voting age is 18.",
      "type": "comprehension"
    }
  ]
}
```

***

### 2. HTML-ФАЙЛ (dist/XXX.html)

**Это автономное приложение**. Один файл содержит ВСЁ:

#### A. HEAD секция:
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Loading Lesson...</title>
    
    <style>
        /* ВСЕ СТИЛИ (800-1000 строк) */
    </style>
</head>
```

#### B. BODY секция:
```html
<body>
    <!-- Loader (показывается при загрузке) -->
    <div class="loader-container" id="loader">
        <div class="loader"></div>
    </div>
    
    <!-- Основной контейнер (заполняется JS) -->
    <div id="app"></div>
    
    <script>
        /* ВСЯ ЛОГИКА (1000-1500 строк) */
    </script>
</body>
```

***

## 🎨 СТИЛИ (CSS)

### Обязательные секции в `<style>`:

#### 1. CSS Variables (Цветовая схема)
```css
:root {
    /* Базовые цвета */
    --bg: #0f0f12;              /* Фон страницы */
    --surface: #1C1C1E;         /* Фон карточек */
    --text: #E5E5EA;            /* Основной текст */
    --text-muted: #8E8E93;      /* Второстепенный текст */
    
    /* Акценты (берутся из JSON colors) */
    --accent-1: #FF6B6B;        /* Первый цвет */
    --accent-2: #4ECDC4;        /* Второй цвет */
    
    /* Семантические цвета */
    --success: #34C759;         /* Правильный ответ */
    --error: #FF3B30;           /* Ошибка */
    --warning: #FF9500;         /* Предупреждение */
    
    /* Размеры */
    --border-radius: 12px;
    --transition: 0.3s ease;
}
```

#### 2. Layout (Структура страницы)
```css
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
}

.loader-container {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    z-index: 9999;
}

header {
    background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
    padding: 2rem 1rem;
    text-align: center;
    color: white;
}

.nav-container {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--surface);
    overflow-x: auto;
}

.content-section {
    display: none;
    padding: 1.5rem;
    animation: fadeIn 0.3s;
}

.content-section.active {
    display: block;
}
```

#### 3. Components (UI элементы)

**Карточки слов:**
```css
.vocab-card {
    background: var(--surface);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: transform var(--transition);
}

.vocab-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}
```

**Кнопки квиза:**
```css
.quiz-option {
    width: 100%;
    padding: 1rem;
    margin: 0.5rem 0;
    background: var(--surface);
    border: 2px solid transparent;
    border-radius: var(--border-radius);
    color: var(--text);
    cursor: pointer;
    transition: all var(--transition);
}

.quiz-option:hover {
    border-color: var(--accent-1);
}

.quiz-option.correct {
    background: var(--success);
    border-color: var(--success);
    color: white;
}

.quiz-option.incorrect {
    background: var(--error);
    border-color: var(--error);
    color: white;
}
```

**Flashcards (карточки для запоминания):**
```css
.flashcard {
    width: 100%;
    height: 300px;
    perspective: 1000px;
}

.flashcard-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.flashcard.flipped .flashcard-inner {
    transform: rotateY(180deg);
}

.flashcard-front, .flashcard-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
}

.flashcard-back {
    transform: rotateY(180deg);
}
```

#### 4. Animations
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.loader {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255,255,255,0.1);
    border-top-color: var(--accent-1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
```

#### 5. Responsive Design
```css
@media (max-width: 768px) {
    header { padding: 1.5rem 1rem; }
    .nav-tab { font-size: 0.85rem; padding: 0.6rem 1rem; }
    .vocab-card { padding: 1rem; }
    .flashcard { height: 250px; }
}
```

***

## ⚙️ JAVASCRIPT ЛОГИКА

### Основные блоки кода:

#### 1. Определение ID урока
```javascript
// Извлекаем номер из имени файла (263.html → "263")
const lessonId = window.location.pathname.match(/(\d+)\.html$/)?.[1];

if (!lessonId) {
    showError('Unable to determine lesson number');
}
```

#### 2. Загрузка JSON
```javascript
let lessonData = null;

async function loadLesson() {
    try {
        const response = await fetch(`../data/${lessonId}.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        lessonData = await response.json();
        initLesson(lessonData);
        
    } catch (error) {
        showError(`Failed to load lesson: ${error.message}`);
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadLesson);
```

#### 3. Инициализация урока
```javascript
function initLesson(data) {
    // 3.1 Установить заголовок
    document.title = data.title;
    document.querySelector('#lessonTitle').textContent = data.title;
    document.querySelector('#lessonSubtitle').textContent = data.subtitle || '';
    
    // 3.2 Применить цвета из JSON
    if (data.colors && data.colors.length >= 2) {
        document.documentElement.style.setProperty('--accent-1', data.colors[0]);
        document.documentElement.style.setProperty('--accent-2', data.colors[1]);
    }
    
    // 3.3 Применить тему (dark/light/playful)
    if (data.meta?.theme) {
        document.body.setAttribute('data-theme', data.meta.theme);
    }
    
    // 3.4 Построить HTML интерфейс
    const app = document.getElementById('app');
    app.innerHTML = buildInterface(data);
    
    // 3.5 Настроить обработчики событий
    setupEventListeners();
    
    // 3.6 Загрузить сохранённые слова
    loadMyWords();
    
    // 3.7 Скрыть loader
    document.getElementById('loader').style.display = 'none';
    app.classList.add('loaded');
}
```

#### 4. Построение интерфейса
```javascript
function buildInterface(data) {
    return `
        <header>
            <h1 id="lessonTitle">${data.title}</h1>
            <p id="lessonSubtitle">${data.subtitle || ''}</p>
            <div class="lesson-meta">
                <span class="badge">${data.meta.level}</span>
                <span class="badge">${data.meta.duration || 30} min</span>
            </div>
        </header>
        
        <nav class="nav-container">
            <button class="nav-tab active" onclick="switchTab('reading')">📖 Reading</button>
            <button class="nav-tab" onclick="switchTab('vocabulary')">📚 Vocabulary</button>
            <button class="nav-tab" onclick="switchTab('grammar')">✏️ Grammar</button>
            <button class="nav-tab" onclick="switchTab('quiz')">⚡ Quiz</button>
        </nav>
        
        <main>
            <section class="content-section active" id="section-reading">
                ${renderReading(data.content.reading)}
            </section>
            
            <section class="content-section" id="section-vocabulary">
                ${renderVocabulary(data.content.vocabulary)}
            </section>
            
            <section class="content-section" id="section-grammar">
                ${renderGrammar(data.content.grammar)}
            </section>
            
            <section class="content-section" id="section-quiz">
                ${renderQuiz(data.quiz)}
            </section>
        </main>
        
        <aside class="sidebar" id="sidebar">
            <button class="sidebar-toggle" onclick="toggleSidebar()">
                💾 My Words (<span id="wordCount">0</span>)
            </button>
            <div class="sidebar-content" id="sidebarContent"></div>
        </aside>
    `;
}
```

#### 5. Рендеринг Reading секции
```javascript
function renderReading(readingBlocks) {
    let html = '';
    
    readingBlocks.forEach((block, index) => {
        html += `
            <div class="reading-block" data-type="${block.type}">
                ${block.title ? `<h3>${block.title}</h3>` : ''}
                
                ${block.audio_paragraph ? `
                    <button class="listen-btn" onclick="speakText('${escapeJS(block.text)}')">
                        🔊 Listen to paragraph
                    </button>
                ` : ''}
                
                <div class="reading-text">
                    ${processTextWithHighlights(block.text, block.highlight || [])}
                </div>
            </div>
        `;
    });
    
    return html;
}

// Делаем слова кликабельными
function processTextWithHighlights(text, highlightWords) {
    let processed = text;
    
    highlightWords.forEach(word => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        processed = processed.replace(regex, 
            `<span class="word clickable" onclick="speakWord('$1')" 
                   onmouseenter="showQuickTranslation(event, '$1')">$1</span>`
        );
    });
    
    return processed;
}
```

#### 6. Рендеринг Vocabulary секции
```javascript
function renderVocabulary(vocab) {
    let html = `
        <div class="vocab-controls">
            <button class="mode-btn active" onclick="switchVocabMode('list')">📝 List</button>
            <button class="mode-btn" onclick="switchVocabMode('flashcards')">🎴 Flashcards</button>
        </div>
    `;
    
    // LIST MODE
    html += '<div class="vocab-mode active" id="vocab-list"><div class="vocab-grid">';
    
    vocab.words.forEach((word, index) => {
        html += `
            <div class="vocab-card">
                <div class="word-en" onclick="speakWord('${word.en}')">
                    ${word.en}
                    <span class="phonetic">${word.transcription || ''}</span>
                </div>
                <div class="word-ru">${word.ru}</div>
                <div class="word-example">"${word.example}"</div>
                <div class="word-meta">
                    <span class="pos">${word.part_of_speech}</span>
                </div>
                <button class="save-btn" onclick="saveWord('${word.en}', '${word.ru}', '${escapeJS(word.example)}')">
                    💾 Save
                </button>
            </div>
        `;
    });
    
    html += '</div></div>';
    
    // FLASHCARDS MODE
    html += '<div class="vocab-mode" id="vocab-flashcards">';
    
    vocab.words.forEach((word, index) => {
        html += `
            <div class="flashcard ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="flashcard-inner" onclick="flipCard(${index})">
                    <div class="flashcard-front">
                        <div class="flashcard-word">${word.en}</div>
                        <div class="flashcard-hint">Click to reveal translation</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="flashcard-translation">${word.ru}</div>
                        <div class="flashcard-example">${word.example}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        <div class="flashcard-controls">
            <button onclick="previousCard()">← Previous</button>
            <span id="cardCounter">1 / ${vocab.words.length}</span>
            <button onclick="nextCard()">Next →</button>
        </div>
    `;
    html += '</div>';
    
    // PHRASES
    if (vocab.phrases && vocab.phrases.length > 0) {
        html += '<div class="phrases-section"><h3>🗣️ Useful Phrases</h3>';
        vocab.phrases.forEach(phrase => {
            html += `
                <div class="phrase-item" onclick="speakText('${escapeJS(phrase.en)}')">
                    <div class="phrase-en">${phrase.en}</div>
                    <div class="phrase-ru">${phrase.ru}</div>
                    ${phrase.context ? `<div class="phrase-context">${phrase.context}</div>` : ''}
                </div>
            `;
        });
        html += '</div>';
    }
    
    return html;
}
```

#### 7. Рендеринг Grammar секции
```javascript
function renderGrammar(grammar) {
    if (!grammar || !grammar.title) {
        return '<p class="no-content">No grammar content for this lesson.</p>';
    }
    
    let html = `
        <div class="grammar-container">
            <h2>${grammar.title}</h2>
            
            <div class="grammar-explanation">
                <h3>📖 Explanation</h3>
                <p>${grammar.explanation_ru}</p>
            </div>
    `;
    
    // Rules
    if (grammar.rules) {
        grammar.rules.forEach(rule => {
            html += `
                <div class="grammar-rule">
                    <div class="rule-pattern">${rule.pattern}</div>
                    <div class="rule-description">${rule.description}</div>
                    
                    ${rule.examples_positive ? `
                        <div class="examples-group">
                            <h4>✅ Affirmative</h4>
                            ${rule.examples_positive.map(ex => `<div class="example">${ex}</div>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${rule.examples_negative ? `
                        <div class="examples-group">
                            <h4>❌ Negative</h4>
                            ${rule.examples_negative.map(ex => `<div class="example">${ex}</div>`).join('')}
                        </div>
                    ` : ''}
                    
                    ${rule.examples_question ? `
                        <div class="examples-group">
                            <h4>❓ Questions</h4>
                            ${rule.examples_question.map(ex => `<div class="example">${ex}</div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }
    
    // Common Mistakes
    if (grammar.common_mistakes) {
        html += '<div class="mistakes-section"><h3>⚠️ Common Mistakes</h3>';
        grammar.common_mistakes.forEach(mistake => {
            html += `
                <div class="mistake-item">
                    <div class="mistake-wrong">❌ ${mistake.wrong}</div>
                    <div class="mistake-correct">✅ ${mistake.correct}</div>
                    <div class="mistake-why">${mistake.explanation}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}
```

#### 8. Рендеринг Quiz секции
```javascript
let quizScore = { correct: 0, total: 0 };

function renderQuiz(questions) {
    quizScore.total = questions.length;
    let html = `
        <div class="quiz-header">
            <h2>Practice Quiz</h2>
            <div class="quiz-score">
                Score: <span id="quizScore">0 / ${questions.length}</span>
            </div>
        </div>
    `;
    
    questions.forEach((q, qIndex) => {
        html += `
            <div class="quiz-question" id="question-${qIndex}">
                <div class="question-number">Question ${qIndex + 1} / ${questions.length}</div>
                <div class="question-text">${q.q}</div>
                <div class="question-options">
        `;
        
        q.opts.forEach((option, oIndex) => {
            html += `
                <button class="quiz-option" onclick="checkAnswer(${qIndex}, ${oIndex}, ${q.correct})">
                    ${option}
                </button>
            `;
        });
        
        html += `
                </div>
                <div class="question-feedback" id="feedback-${qIndex}"></div>
            </div>
        `;
    });
    
    return html;
}

function checkAnswer(qIndex, selectedIndex, correctIndex) {
    const questionEl = document.getElementById(`question-${qIndex}`);
    const options = questionEl.querySelectorAll('.quiz-option');
    const feedbackEl = document.getElementById(`feedback-${qIndex}`);
    
    // Блокируем повторные клики
    options.forEach(btn => btn.disabled = true);
    
    const isCorrect = (selectedIndex === correctIndex);
    
    if (isCorrect) {
        options[selectedIndex].classList.add('correct');
        feedbackEl.innerHTML = `
            <div class="feedback-correct">
                ✅ Correct! ${lessonData.quiz[qIndex].fb}
            </div>
        `;
        quizScore.correct++;
        vibrate(200);
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[correctIndex].classList.add('correct');
        feedbackEl.innerHTML = `
            <div class="feedback-incorrect">
                ❌ Incorrect. ${lessonData.quiz[qIndex].fb}
            </div>
        `;
        vibrate([100, 50, 100]);
    }
    
    feedbackEl.style.display = 'block';
    updateQuizScore();
}

function updateQuizScore() {
    document.getElementById('quizScore').textContent = 
        `${quizScore.correct} / ${quizScore.total}`;
}
```

#### 9. Text-to-Speech (Озвучка)
```javascript
// Озвучить слово через Google TTS
function speakWord(text) {
    const cleanText = text.trim();
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(cleanText)}`;
    
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
        console.warn('Google TTS failed, using fallback:', err);
        speakWithBrowserAPI(cleanText);
    });
}

// Озвучить текст/предложение
function speakText(text) {
    if (text.length > 200) {
        speakWithBrowserAPI(text);
    } else {
        speakWord(text);
    }
}

// Fallback: встроенный синтезатор браузера
function speakWithBrowserAPI(text) {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel(); // Остановить предыдущий звук
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        // Попытка найти качественный голос
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.lang.startsWith('en') && v.name.includes('Female')
        );
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
    } else {
        console.warn('Speech synthesis not supported');
    }
}

// Инициализация голосов (для Chrome)
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
```

#### 10. My Words (Сохранение слов)
```javascript
let myWords = [];

function loadMyWords() {
    const saved = localStorage.getItem('myWords');
    myWords = saved ? JSON.parse(saved) : [];
    updateWordsSidebar();
}

function saveWord(word, translation, example) {
    // Проверка на дубликаты
    if (myWords.some(w => w.word === word)) {
        showNotification(`"${word}" already saved!`);
        return;
    }
    
    const wordObj = {
        id: `word_${Date.now()}`,
        word: word,
        translation: translation,
        example: example,
        savedAt: new Date().toISOString()
    };
    
    myWords.push(wordObj);
    localStorage.setItem('myWords', JSON.stringify(myWords));
    
    updateWordsSidebar();
    showNotification(`"${word}" saved!`);
    vibrate(100);
}

function updateWordsSidebar() {
    document.getElementById('wordCount').textContent = myWords.length;
    
    const container = document.getElementById('sidebarContent');
    
    if (myWords.length === 0) {
        container.innerHTML = '<p class="no-words">No saved words yet. Click 💾 to save!</p>';
        return;
    }
    
    let html = '<div class="saved-words-list">';
    myWords.forEach(item => {
        html += `
            <div class="saved-word">
                <div class="saved-word-en" onclick="speakWord('${item.word}')">
                    ${item.word}
                </div>
                <div class="saved-word-ru">${item.translation}</div>
                <button class="remove-word-btn" onclick="removeWord('${item.id}')">🗑️</button>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function removeWord(wordId) {
    myWords = myWords.filter(w => w.id !== wordId);
    localStorage.setItem('myWords', JSON.stringify(myWords));
    updateWordsSidebar();
}
```

#### 11. Вспомогательные функции
```javascript
// Переключение табов
function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${tabName}`).classList.add('active');
}

// Экранирование текста для JS
function escapeJS(str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, ' ');
}

// Вибрация (для мобильных)
function vibrate(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Уведомления
function showNotification(message) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// Показать ошибку
function showError(message) {
    const loader = document.getElementById('loader');
    loader.innerHTML = `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <h2>Error Loading Lesson</h2>
            <p>${message}</p>
            <button onclick="location.reload()">Try Again</button>
        </div>
    `;
}

// Переключение sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Flashcards навигация
let currentCard = 0;

function flipCard(index) {
    const card = document.querySelector(`.flashcard[data-index="${index}"]`);
    card.classList.toggle('flipped');
}

function nextCard() {
    const totalCards = lessonData.content.vocabulary.words.length;
    currentCard = (currentCard + 1) % totalCards;
    updateFlashcard();
}

function previousCard() {
    const totalCards = lessonData.content.vocabulary.words.length;
    currentCard = (currentCard - 1 + totalCards) % totalCards;
    updateFlashcard();
}

function updateFlashcard() {
    document.querySelectorAll('.flashcard').forEach((card, index) => {
        card.classList.toggle('active', index === currentCard);
        card.classList.remove('flipped');
    });
    
    const totalCards = lessonData.content.vocabulary.words.length;
    document.getElementById('cardCounter').textContent = 
        `${currentCard + 1} / ${totalCards}`;
}

// Vocabulary mode switch
function switchVocabMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchVocabMode('${mode}')"]`).classList.add('active');
    
    if (mode === 'list') {
        document.getElementById('vocab-list').classList.add('active');
        document.getElementById('vocab-flashcards').classList.remove('active');
    } else {
        document.getElementById('vocab-list').classList.remove('active');
        document.getElementById('vocab-flashcards').classList.add('active');
    }
}
```

***

## 🚫 ЧТО ДЕЛАТЬ **СТРОГО ЗАПРЕЩЕНО**

### ❌ КАТЕГОРИЯ 1: СТРУКТУРА КОДА

1. **НЕ создавать внешние файлы**
   - ❌ Не создавай `style.css`
   - ❌ Не создавай `engine.js`
   - ❌ Не создавай `utils.js`
   - ✅ Весь код только в **одном HTML-файле**

2. **НЕ использовать библиотеки/фреймворки**
   - ❌ Никаких jQuery
   - ❌ Никаких React/Vue/Angular
   - ❌ Никаких Bootstrap/Tailwind
   - ✅ Только **Vanilla JavaScript + чистый CSS**

3. **НЕ изменять структуру JSON**
   - ❌ Не меняй названия полей
   - ❌ Не меняй типы данных
   - ❌ Не удаляй обязательные поля
   - ✅ JSON структура **зафиксирована**

***

### ❌ КАТЕГОРИЯ 2: КОНТЕНТ

4. **НЕ СОКРАЩАТЬ ТЕКСТ**
   - ❌ Не пересказывай текст из `reading`
   - ❌ Не упрощай формулировки
   - ❌ Не удаляй "лишние" детали
   - ✅ Текст переносится **ДОСЛОВНО** из учебника

5. **НЕ СОКРАЩАТЬ КОД**
   - ❌ Не пиши комментарии типа `// ... rest of the code`
   - ❌ Не пропускай функции с пометкой "аналогично"
   - ❌ Не говори "код слишком длинный"
   - ✅ Код должен быть **ПОЛНЫМ и рабочим**

6. **НЕ ВЫДУМЫВАТЬ ДАННЫЕ**
   - ❌ Не добавляй свои примеры
   - ❌ Не придумывай вопросы для квиза
   - ❌ Не меняй переводы слов
   - ✅ Только то, что **есть в учебнике/JSON**

***

### ❌ КАТЕГОРИЯ 3: СТИЛИ И ДИЗАЙН

7. **НЕ использовать inline стили**
   - ❌ Не пиши `style="color: red"` в HTML
   - ❌ Не дублируй стили в разных местах
   - ✅ Все стили только в **блоке `<style>`**

8. **НЕ нарушать accessibility**
   - ❌ Не забывай `alt` для картинок
   - ❌ Не используй только цвет для обозначения ошибок
   - ❌ Не делай слишком мелкий текст
   - ✅ Минимум контраст 4.5:1 для текста

9. **НЕ игнорировать мобильные устройства**
   - ❌ Не делай фиксированные размеры в px
   - ❌ Не забывай `@media` запросы
   - ❌ Не делай кнопки меньше 44x44px
   - ✅ Дизайн должен быть **responsive**

***

### ❌ КАТЕГОРИЯ 4: ФУНКЦИОНАЛЬНОСТЬ

10. **НЕ блокировать UI**
    - ❌ Не используй `alert()` / `confirm()`
    - ❌ Не делай синхронные долгие операции
    - ❌ Не забывай показывать loader
    - ✅ Всё **асинхронно** (async/await)

11. **НЕ игнорировать ошибки**
    - ❌ Не оставляй пустые `catch()` блоки
    - ❌ Не игнорируй ошибки fetch
    - ❌ Не молчи при проблемах с TTS
    - ✅ Всегда показывай **понятное сообщение** пользователю

12. **НЕ полагаться только на Google TTS**
    - ❌ Не думай, что Google API всегда работает
    - ✅ Обязательно делай **fallback** на Web Speech API

***

### ❌ КАТЕГОРИЯ 5: ПРОИЗВОДИТЕЛЬНОСТЬ

13. **НЕ создавать memory leaks**
    - ❌ Не забывай отменять `speechSynthesis`
    - ❌ Не создавай бесконечные setInterval
    - ❌ Не оставляй висеть event listeners
    - ✅ Очищай ресурсы при переключении табов

14. **НЕ грузить всё сразу**
    - ❌ Не рендери все 50 вопросов квиза сразу
    - ❌ Не создавай 100 DOM элементов за раз
    - ✅ Используй **ленивую загрузку** где возможно

***

### ❌ КАТЕГОРИЯ 6: БЕЗОПАСНОСТЬ

15. **НЕ забывать про XSS**
    - ❌ Не вставляй пользовательский ввод напрямую через `innerHTML`
    - ❌ Не используй `eval()`
    - ✅ Всегда **экранируй** текст через `escapeJS()`

16. **НЕ хранить чувствительные данные**
    - ❌ Не храни пароли в LocalStorage
    - ❌ Не отправляй токены в URL
    - ✅ LocalStorage только для **словаря пользователя**

***

## ✅ ЧТО ДЕЛАТЬ **ОБЯЗАТЕЛЬНО**

### ✅ КАТЕГОРИЯ 1: КАЧЕСТВО КОДА

1. **Комментировать сложные места**
   ```javascript
   // Экранируем текст для безопасной вставки в onclick
   function escapeJS(str) { ... }
   ```

2. **Использовать понятные имена**
   - ✅ `renderVocabulary()` вместо `rV()`
   - ✅ `quizScore` вместо `qs`

3. **Разбивать на функции**
   - Каждая функция делает **одну вещь**
   - Максимум 50-70 строк на функцию

***

### ✅ КАТЕГОРИЯ 2: UX/UI

4. **Показывать feedback пользователю**
   - Loader при загрузке
   - Анимация при правильном ответе
   - Вибрация на мобильных

5. **Делать понятные сообщения об ошибках**
   ```
   ❌ Плохо: "Error 404"
   ✅ Хорошо: "Lesson 263 not found. Check the lesson number."
   ```

6. **Адаптировать под устройство**
   - На телефоне: большие кнопки, вертикальный layout
   - На планшете: 2 колонки для карточек
   - На десктопе: 3 колонки + sidebar

***

### ✅ КАТЕГОРИЯ 3: ТЕСТИРОВАНИЕ

7. **Проверять в разных браузерах**
   - Chrome (desktop + mobile)
   - Safari (iOS)
   - Firefox

8. **Тестировать offline режим**
   - После первой загрузки урок должен работать без интернета
   - TTS fallback должен срабатывать

9. **Проверять на реальных данных**
   - Короткий текст (50 слов)
   - Длинный текст (500+ слов)
   - Много вопросов (50+)

***

## 📋 ЧЕКЛИСТ ПЕРЕД ОТПРАВКОЙ КОДА

Перед тем как отправить HTML-файл, проверь:

### Структура:
- [ ] Есть `<!DOCTYPE html>`
- [ ] Весь CSS в `<style>`
- [ ] Весь JS в `<script>`
- [ ] Meta-теги на месте

### Стили:
- [ ] CSS Variables определены
- [ ] Responsive @media queries добавлены
- [ ] Анимации работают
- [ ] Темы (dark/light) поддерживаются

### JavaScript:
- [ ] Определение `lessonId` работает
- [ ] `fetch()` оборачивается в `try/catch`
- [ ] Все рендер-функции возвращают HTML
- [ ] TTS имеет fallback
- [ ] LocalStorage работает

### Функциональность:
- [ ] Табы переключаются
- [ ] Слова озвучиваются
- [ ] Квиз проверяет ответы
- [ ] My Words сохраняется
- [ ] Flashcards переключаются

### Безопасность:
- [ ] Текст экранируется (`escapeJS()`)
- [ ] Нет `eval()` или `innerHTML` с пользовательским вводом
- [ ] Нет XSS уязвимостей

***

## 🎯 ИТОГОВАЯ ФОРМУЛА УСПЕХА

```
ОДИН HTML-файл = 
    JSON данные (fetch) +
    Встроенные стили (1000 строк CSS) +
    Встроенная логика (1500 строк JS) +
    Интерактивность (TTS, quiz, карточки) +
    Сохранение прогресса (LocalStorage)
```

**Это полностью автономное приложение**, которое:
- ✅ Работает в любом браузере
- ✅ Работает офлайн (после первой загрузки)
- ✅ Не требует установки
- ✅ Легко распространять (один файл)
- ✅ Легко обновлять (заменить JSON или HTML)

***

**Вопрос для проверки понимания:**  
Повтори своими словами: что делает этот проект и почему всё должно быть в одном HTML-файле?
