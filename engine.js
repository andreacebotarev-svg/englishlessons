/**
 * EDUCATIONAL APP ENGINE v3.4
 * Logic: JSON Data -> HTML Builder -> Interactivity
 */

// ========================================================
// 1. INITIALIZATION & DATA FETCHING
// ========================================================

// Определяем ID урока из URL
const pathParts = window.location.pathname.split('/');
const fileName = pathParts[pathParts.length - 1];
const lessonId = fileName.replace('.html', '') || '263'; 

console.log(`Starting Engine for Lesson ID: ${lessonId}`);

// Загружаем JSON (с анти-кэшем)
const dataUrl = `../data/${lessonId}.json?v=${new Date().getTime()}`;

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
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="text-align:center; padding:40px; color:#FF3B30; font-family:sans-serif;">
                    <h3>Error loading lesson</h3>
                    <p>Could not load data from de>${dataUrl}</code></p>
                    <p><small>${error.message}</small></p>
                </div>
            `;
        }
    });


// ========================================================
// 2. CORE BUILDER FUNCTION
// ========================================================

function buildLesson(data) {
    const app = document.getElementById('app');
    if (!app) return;

    // A. Настройка Страницы (Meta & Theme)
    document.title = data.title || 'Lesson';

    // Применяем цвета из JSON
    if (data.colors && data.colors.length > 0) {
        const root = document.documentElement.style;
        root.setProperty('--accent', data.colors[0]); 
        root.setProperty('--p', data.colors[0]);      
        if (data.colors[1]) root.setProperty('--s', data.colors[1]);
        
        // Генерируем оттенки
        root.setProperty('--accent-soft', data.colors[0] + '1A'); // 10%
        root.setProperty('--accent-strong', data.colors[0] + '33'); // 20%
    }

    // Тема
    if (data.theme && data.theme !== 'default') {
        document.body.classList.add(`theme-${data.theme}`);
    }

    // B. Сортировка Контента
    const readContent = [];
    const vocabContent = [];
    const quizContent = [];

    (data.content || []).forEach(item => {
        if (item.type === 'vocab') vocabContent.push(item);
        else if (item.type === 'quiz') quizContent.push(item);
        else readContent.push(item); // block, fact, phrase
    });

    // C. Генерация HTML
    let html = '';

    // --- Header ---
    html += `
        <header>
            <h1 class="lesson-title">${data.title || 'Untitled'}</h1>
            ${data.subtitle ? `<div class="lesson-subtitle">${data.subtitle}</div>` : ''}
        </header>
    `;

    // --- Tabs Navigation ---
    // Показываем табы только если есть контент
    if (readContent.length || vocabContent.length || quizContent.length) {
        html += `
            <div class="nav-container">
                <div class="nav">
                    <button class="tab-btn active" onclick="switchTab('read')" 
                            style="${readContent.length ? '' : 'display:none;'}">
                        📖 Learn
                    </button>
                    <button class="tab-btn" onclick="switchTab('vocab')" 
                            style="${vocabContent.length ? '' : 'display:none;'}">
                        🔤 Vocab
                    </button>
                    <button class="tab-btn" onclick="switchTab('quiz')" 
                            style="${quizContent.length ? '' : 'display:none;'}">
                        ✅ Quiz
                    </button>
                </div>
            </div>
        `;
    }

    // --- Tab 1: Read ---
    html += `<div id="tab-read" class="section active">`;
    if (readContent.length) {
        readContent.forEach((item, idx) => {
            const delay = `style="animation-delay: ${idx * 0.1}s"`;
            if (item.type === 'block') html += buildBlock(item, delay);
            else if (item.type === 'fact') html += buildFact(item, delay);
            else if (item.type === 'phrase') html += buildPhrases(item, delay);
        });
    } else {
        html += `<div class="block"><p style="color:var(--text-sub)">No reading content.</p></div>`;
    }
    html += `</div>`;

    // --- Tab 2: Vocab ---
    html += `<div id="tab-vocab" class="section">`;
    if (vocabContent.length) {
        vocabContent.forEach(item => html += buildVocab(item));
    } else {
        html += `<div class="block"><p style="color:var(--text-sub)">No vocabulary list.</p></div>`;
    }
    html += `</div>`;

    // --- Tab 3: Quiz ---
    html += `<div id="tab-quiz" class="section">`;
    if (quizContent.length) {
        quizContent.forEach(item => html += buildQuiz(item));
    } else {
        html += `<div class="block"><p style="color:var(--text-sub)">No quiz available.</p></div>`;
    }
    html += `</div>`;

    // D. Вставка и Финализация
    app.innerHTML = html;
    
    // Небольшая задержка для плавности
    requestAnimationFrame(() => {
        app.classList.add('loaded');
    });
}


// ========================================================
// 3. HTML GENERATORS
// ========================================================

function buildBlock(item, style) {
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


// ========================================================
// 4. INTERACTIVITY & UTILITIES
// ========================================================

// --- Tab Switching ---
window.switchTab = function(tabName) {
    // Скрываем все секции
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    // Активируем нужную
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.classList.add('active');
    
    // Обновляем кнопки
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));
    
    // Простой маппинг кнопок (0=Read, 1=Vocab, 2=Quiz)
    if(tabName === 'read' && btns[0]) btns[0].classList.add('active');
    if(tabName === 'vocab' && btns[1]) btns[1].classList.add('active');
    if(tabName === 'quiz' && btns[2]) btns[2].classList.add('active');
};

// --- Text Processing ---
// Превращает [hl]word[/hl] в <span class="hl">word</span> и делает слова кликабельными
function processText(text) {
    if (!text) return '';
    
    // Заменяем теги подсветки на временные маркеры
    let processed = text.replace(/\[hl\]/g, '___HL___').replace(/\[\/hl\]/g, '___HL_END___');
    
    // Разбиваем текст на токены (слова и знаки препинания)
    return processed.split(/(\s+|[.,!?;:()"])/).map(token => {
        if (!token.trim() || token.includes('___')) return token;
        
        // Если это слово (содержит буквы)
        if (/[a-zA-Z0-9]/.test(token)) {
            const safe = token.replace(/'/g, "\\'");
            return `<span class="word" onclick="speakText('${safe}', this)">${token}</span>`;
        }
        return token;
    }).join('')
      // Восстанавливаем теги подсветки
      .replace(/___HL___/g, '<span class="hl">')
      .replace(/___HL_END___/g, '</span>');
}

// --- TTS (Text-to-Speech) ---
window.speakText = function(text, el) {
    if (!window.speechSynthesis) return;
    
    // Остановить предыдущее
    window.speechSynthesis.cancel();
    
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; 
    u.rate = 0.9; // Чуть медленнее для обучения
    
    // Попытка найти хороший голос
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google US')) || 
                      voices.find(v => v.lang === 'en-US');
    if (preferred) u.voice = preferred;

    // Визуальный эффект
    if (el) {
        // Сбросить активные классы с других слов
        document.querySelectorAll('.word.active').forEach(w => w.classList.remove('active'));
        
        el.classList.add('active');
        if (el.classList.contains('v-item')) el.style.transform = 'scale(0.95)';
        
        u.onend = () => {
            el.classList.remove('active');
            if (el.classList.contains('v-item')) el.style.transform = '';
        };
    }
    
    window.speechSynthesis.speak(u);
};

// Чтение целого блока
window.readBlock = function(btn) {
    const block = btn.closest('.block');
    // Берем только чистый текст (без HTML тегов)
    const text = block.querySelector('.reading-text').innerText;
    
    if (btn.classList.contains('playing')) {
        window.speechSynthesis.cancel();
        btn.innerHTML = '▶ Listen';
        btn.classList.remove('playing');
    } else {
        // Сброс всех других кнопок Listen
        document.querySelectorAll('.listen-btn').forEach(b => {
            b.classList.remove('playing');
            b.innerHTML = '▶ Listen';
        });
        
        btn.classList.add('playing');
        btn.innerHTML = '⏹ Stop';
        
        // Используем speakText, но передаем кнопку как элемент для callback
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = 0.9;
        u.onend = () => {
            btn.classList.remove('playing');
            btn.innerHTML = '▶ Listen';
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    }
};

// --- Quiz Logic ---
window.checkQuiz = function(btn, correctIndex) {
    const parent = btn.closest('.quiz-card');
    const allBtns = parent.querySelectorAll('.opt-btn');
    const fb = parent.querySelector('.fb');
    const myIndex = parseInt(btn.dataset.index);
    
    // Разрешаем менять ответ? (Пока да, просто сбрасываем стили)
    allBtns.forEach(b => b.classList.remove('good', 'bad'));
    
    fb.style.display = 'block';
    // Сброс анимации
    fb.style.animation = 'none';
    fb.offsetHeight; /* trigger reflow */
    fb.style.animation = null; 

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
