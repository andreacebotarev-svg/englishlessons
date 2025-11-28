/**
 * EDUCATIONAL APP ENGINE v3.3
 * Builder: Connects JSON data -> HTML Structure -> CSS Styling
 */

// 1. АВТО-ОПРЕДЕЛЕНИЕ ID УРОКА
// Берет имя файла (например, "263.html" -> "263")
const pathParts = window.location.pathname.split('/');
const fileName = pathParts[pathParts.length - 1];
const lessonId = fileName.replace('.html', '') || '263'; 

// Добавляем ?v=... чтобы браузер не кэшировал старую версию JSON
const dataUrl = `../data/${lessonId}.json?v=${new Date().getTime()}`;

// 2. ЗАГРУЗКА ДАННЫХ
fetch(dataUrl)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        buildLesson(data);
    })
    .catch(error => {
        console.error('Engine Error:', error);
        document.getElementById('app').innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--accent-error)">
                <h3>Error loading lesson</h3>
                <p>Check console or try refreshing.</p>
            </div>
        `;
    });

/* --- ГЛАВНАЯ ФУНКЦИЯ СТРОИТЕЛЬСТВА --- */

function buildLesson(data) {
    // A. Настройка Страницы (Meta & Theme)
    document.title = data.title || 'Lesson';

    // Применяем цвета из JSON (переопределяем CSS переменные)
    if (data.colors && data.colors.length > 0) {
        const root = document.documentElement.style;
        root.setProperty('--accent', data.colors[0]); // Основной цвет
        root.setProperty('--p', data.colors[0]);      // Primary
        if (data.colors[1]) root.setProperty('--s', data.colors[1]); // Secondary
        
        // Генерируем полупрозрачные оттенки для кнопок
        root.setProperty('--accent-soft', data.colors[0] + '1A'); // 10% прозрачности
        root.setProperty('--accent-strong', data.colors[0] + '33'); // 20% прозрачности
    }

    // Включаем тему (если есть в JSON, иначе Dark по умолчанию или из системы)
    if (data.theme && data.theme !== 'default') {
        document.body.classList.add(`theme-${data.theme}`);
    }

    // B. Генерация HTML-структуры
    let html = '';

    // 1. Header (Шапка)
    html += `
        <header>
            <h1 class="lesson-title">${data.title || 'Untitled'}</h1>
            ${data.subtitle ? `<div class="lesson-subtitle">${data.subtitle}</div>` : ''}
        </header>
    `;

    // 2. Навигация по Табам (Tabs) - соответствие CSS .tabs-nav
    // Сортируем данные
    const readContent = [];
    const vocabContent = [];
    const quizContent = [];

    (data.content || []).forEach(item => {
        if (item.type === 'vocab') vocabContent.push(item);
        else if (item.type === 'quiz') quizContent.push(item);
        else readContent.push(item); // block, fact, phrase
    });

    // Генерируем табы только если есть контент
    if (readContent.length || vocabContent.length || quizContent.length) {
        html += `
            <div class="nav-container">
                <div class="nav">
                    <button class="tab-btn ${readContent.length ? 'active' : ''}" 
                            onclick="switchTab('read')" 
                            style="${readContent.length ? '' : 'display:none'}">
                        📖 Learn
                    </button>
                    <button class="tab-btn ${vocabContent.length ? '' : 'disabled'}" 
                            onclick="switchTab('vocab')" 
                            style="${vocabContent.length ? '' : 'display:none'}">
                        🔤 Vocab
                    </button>
                    <button class="tab-btn ${quizContent.length ? '' : 'disabled'}" 
                            onclick="switchTab('quiz')" 
                            style="${quizContent.length ? '' : 'display:none'}">
                        ✅ Quiz
                    </button>
                </div>
            </div>
        `;
    }

    // 3. Контент Вкладок
    // -- TAB 1: READ --
    html += `<div id="tab-read" class="section ${readContent.length ? 'active' : ''}">`;
    if (readContent.length) {
        readContent.forEach((item, idx) => {
            const delay = `style="animation-delay: ${idx * 0.05}s"`;
            if (item.type === 'block') html += buildBlock(item, delay);
            else if (item.type === 'fact') html += buildFact(item, delay);
            else if (item.type === 'phrase') html += buildPhrases(item, delay);
        });
    } else {
        html += `<div class="block"><p>No reading content.</p></div>`;
    }
    html += `</div>`;

    // -- TAB 2: VOCAB --
    html += `<div id="tab-vocab" class="section">`;
    if (vocabContent.length) {
        vocabContent.forEach(item => html += buildVocab(item));
    } else {
        html += `<div class="block"><p>No vocabulary list.</p></div>`;
    }
    html += `</div>`;

    // -- TAB 3: QUIZ --
    html += `<div id="tab-quiz" class="section">`;
    if (quizContent.length) {
        quizContent.forEach(item => html += buildQuiz(item));
    } else {
        html += `<div class="block"><p>No quiz available.</p></div>`;
    }
    html += `</div>`;

    // C. Вставка в DOM
    const app = document.getElementById('app');
    app.innerHTML = html;
    
    // Удаляем класс загрузки, если он был
    app.classList.add('loaded');
}

/* --- ФУНКЦИИ-СТРОИТЕЛИ (Генерируют HTML под CSS классы) --- */

function buildBlock(item, style) {
    // CSS классы: .block, .block-header, .listen-btn, .reading-text
    return `
        <div class="block" ${style}>
            <div class="block-header">
                <h3 class="block-title">${item.title || ''}</h3>
                <button class="listen-btn" onclick="readBlock(this)">▶ Listen</button>
            </div>
            <div class="reading-text interactive-text">
                ${processText(item.text || '')}
            </div>
        </div>
    `;
}

function buildFact(item, style) {
    // CSS классы: .block--fact, .fact-box
    return `
        <div class="block block--fact" ${style}>
            <div class="fact-box">
                <div class="fact-box__title">💡 FACT</div>
                <div class="fact-box__text interactive-text">
                    ${processText(item.text || '')}
                </div>
            </div>
        </div>
    `;
}

function buildVocab(item) {
    // CSS классы: .grid, .v-item
    if (!item.items) return '';
    const cards = item.items.map(w => `
        <div class="v-item" onclick="speakText('${w.en.replace(/'/g, "\\'")}', this)">
            <span class="en">${w.en}</span>
            <span class="ru">${w.ru}</span>
        </div>
    `).join('');

    return `
        <div class="block">
            <h3 class="block-title">Vocabulary</h3>
            <div class="grid">${cards}</div>
        </div>
    `;
}

function buildPhrases(item, style) {
    // CSS классы: .p-list, .p-item
    if (!item.items) return '';
    const rows = item.items.map(ph => `
        <div class="p-item" onclick="speakText('${ph.en.replace(/'/g, "\\'")}', this)">
            <div class="p-text-group">
                <div class="p-en">${ph.en}</div>
                <div class="p-ru">${ph.ru}</div>
            </div>
            <div class="p-icon">▶</div>
        </div>
    `).join('');

    return `
        <div class="block" ${style}>
            <h3 class="block-title">Phrases</h3>
            <div class="p-list">${rows}</div>
        </div>
    `;
}

function buildQuiz(item) {
    // CSS классы: .quiz-card (или .q-item), .opt-btn
    const optionsHtml = item.options.map((opt, idx) => `
        <button class="opt-btn" 
                data-index="${idx}" 
                onclick="checkQuiz(this, ${item.answer})">
            ${opt}
        </button>
    `).join('');

    const feedbackSafe = (item.feedback || '').replace(/"/g, '&quot;');

    return `
        <div class="quiz-card" data-feedback="${feedbackSafe}">
            <div class="quiz-question">${item.question}</div>
            <div class="quiz-options">${optionsHtml}</div>
            <div class="fb" style="display:none;"></div>
        </div>
    `;
}

/* --- ИНТЕРАКТИВНОСТЬ И УТИЛИТЫ --- */

// Переключение вкладок
window.switchTab = function(tabName) {
    // Скрываем все секции
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Обновляем кнопки
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));
    
    // Находим нужную кнопку (простой маппинг по индексу)
    if(tabName === 'read') btns[0].classList.add('active');
    if(tabName === 'vocab') btns[1].classList.add('active');
    if(tabName === 'quiz') btns[2].classList.add('active');
};

// Обработка текста: [hl]...[/hl] -> <span class="hl">
function processText(text) {
    if (!text) return '';
    let processed = text.replace(/\[hl\]/g, '___HL___').replace(/\[\/hl\]/g, '___HL_END___');
    
    // Разбиваем на слова, чтобы сделать их кликабельными
    return processed.split(/(\s+|[.,!?;:()"])/).map(token => {
        if (!token.trim() || token.includes('___')) return token;
        // Если это слово (буквы/цифры)
        if (/[a-zA-Z0-9]/.test(token)) {
            const safe = token.replace(/'/g, "\\'");
            return `<span class="word" onclick="speakText('${safe}', this)">${token}</span>`;
        }
        return token;
    }).join('')
      .replace(/___HL___/g, '<span class="hl">')
      .replace(/___HL_END___/g, '</span>');
}

// Text-to-Speech (Озвучка)
window.speakText = function(text, el) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.9;
    
    // Попытка найти хороший голос
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) 
                        || voices.find(v => v.name.includes('Samantha'))
                        || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) u.voice = preferredVoice;

    // Визуальный эффект нажатия
    if (el) {
        el.classList.add('active'); // Для слов
        if (el.classList.contains('v-item')) el.style.transform = 'scale(0.95)'; // Для карточек
        
        u.onend = () => {
            setTimeout(() => {
                el.classList.remove('active');
                if (el.classList.contains('v-item')) el.style.transform = '';
            }, 200);
        };
    }
    window.speechSynthesis.speak(u);
};

window.readBlock = function(btn) {
    const block = btn.closest('.block');
    const text = block.querySelector('.reading-text').innerText;
    
    if (btn.classList.contains('playing')) {
        window.speechSynthesis.cancel();
        btn.classList.remove('playing');
        btn.innerHTML = '▶ Listen';
    } else {
        // Сброс других кнопок
        document.querySelectorAll('.listen-btn').forEach(b => {
            b.classList.remove('playing');
            b.innerHTML = '▶ Listen';
        });
        
        btn.classList.add('playing');
        btn.innerHTML = '⏹ Stop';
        window.speakText(text, null);
    }
};

// Логика Квиза
window.checkQuiz = function(btn, correctIndex) {
    const parent = btn.closest('.quiz-card');
    const allBtns = parent.querySelectorAll('.opt-btn');
    const fb = parent.querySelector('.fb');
    const myIndex = parseInt(btn.dataset.index);
    
    // Блокируем повторные клики
    allBtns.forEach(b => b.disabled = true);
    
    // Сброс
    allBtns.forEach(b => b.classList.remove('good', 'bad'));
    fb.style.display = 'block';
    
    if (myIndex === correctIndex) {
        btn.classList.add('good');
        fb.innerText = parent.dataset.feedback || 'Correct!';
        fb.style.color = 'var(--accent-success)';
        fb.style.background = 'var(--accent-success-bg)';
    } else {
        btn.classList.add('bad');
        fb.innerText = 'Try again!';
        fb.style.color = 'var(--accent-error)';
        fb.style.background = 'var(--accent-error-bg)';
    }
};

// Fix for Chrome voice loading async issue
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
