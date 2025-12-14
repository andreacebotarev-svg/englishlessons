# Архитектура проекта: Интерактивные уроки английского языка

## Оглавление
1. [Обзор проекта](#обзор-проекта)
2. [Архитектурные решения](#архитектурные-решения)
3. [Структура HTML-файла урока](#структура-html-файла-урока)
4. [Система управления состоянием](#система-управления-состоянием)
5. [Модульная архитектура компонентов](#модульная-архитектура-компонентов)
6. [Паттерны и best practices](#паттерны-и-best-practices)
7. [Производительность и оптимизация](#производительность-и-оптимизация)
8. [Будущие улучшения](#будущие-улучшения)

---

## Обзор проекта

### Назначение
Интерактивная образовательная платформа для изучения английского языка, работающая в формате standalone HTML-файлов. Каждый урок — это полностью автономное SPA (Single Page Application), не требующее внешних зависимостей или серверной части.

### Ключевые принципы
- **Self-contained**: Каждый HTML-файл содержит весь необходимый код (HTML, CSS, JS)
- **Zero dependencies**: Без внешних библиотек, фреймворков или CDN
- **Progressive enhancement**: Базовая функциональность работает без JavaScript
- **Mobile-first**: Адаптивный дизайн с приоритетом мобильных устройств
- **Offline-capable**: Полная работоспособность без интернета

---

## Архитектурные решения

### 1. Standalone SPA в одном файле

**Обоснование:**
- Простота распространения (один файл = один урок)
- Нет проблем с CORS или загрузкой ресурсов
- Работает локально без веб-сервера
- Легко архивировать и версионировать

**Компромиссы:**
- Больший размер файла (30-70 KB)
- Дублирование кода между уроками
- Сложнее обновлять глобальные стили/логику

**Решение для масштабирования:**
Создание системы генерации через шаблоны (будущая разработка)

### 2. Vanilla JavaScript вместо фреймворков

**Обоснование:**
- Нулевой overhead на парсинг и выполнение фреймворка
- Полный контроль над производительностью
- Меньший размер файла
- Образовательная ценность для студентов

**Паттерны из фреймворков:**
- Реактивность через Proxy API
- Виртуальный DOM через DocumentFragment
- Компонентная архитектура через классы
- Односторонний поток данных

---

## Структура HTML-файла урока

### Базовый скелет

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Урок #XXX: [Название темы]</title>
    
    <style>
        /* 1. CSS Reset & Variables */
        /* 2. Layout & Grid System */
        /* 3. Component Styles */
        /* 4. Utility Classes */
        /* 5. Responsive Breakpoints */
        /* 6. Dark Mode Support */
    </style>
</head>
<body>
    <!-- Структура контента -->
    <header>
        <!-- Навигация, метаданные урока -->
    </header>
    
    <main>
        <!-- Секции урока -->
    </main>
    
    <footer>
        <!-- Навигация, прогресс -->
    </footer>

    <script>
        /* JavaScript модули */
    </script>
</body>
</html>
```

### Детальная структура для senior-разработчиков

#### 1. CSS Architecture

```css
/* === 1. DESIGN TOKENS === */
:root {
    /* Color System - Семантические цвета */
    --color-primary: #4A90E2;
    --color-success: #4CAF50;
    --color-error: #F44336;
    --color-warning: #FF9800;
    
    /* Typography Scale - Модульная шкала (1.25 ratio) */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    
    /* Spacing System - 8px base */
    --space-1: 0.5rem;   /* 8px */
    --space-2: 1rem;     /* 16px */
    --space-3: 1.5rem;   /* 24px */
    --space-4: 2rem;     /* 32px */
    
    /* Layout Constraints */
    --max-width-content: 800px;
    --max-width-narrow: 600px;
    --gutter: var(--space-3);
    
    /* Z-index Scale */
    --z-dropdown: 100;
    --z-modal: 200;
    --z-tooltip: 300;
}

/* === 2. MODERN CSS RESET === */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* Улучшенный рендеринг текста */
body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

/* Удаление стилей списков */
ul[role="list"], ol[role="list"] {
    list-style: none;
}

/* === 3. LAYOUT PRIMITIVES === */
/* Stack - вертикальное размещение с gap */
.stack {
    display: flex;
    flex-direction: column;
}
.stack > * + * {
    margin-top: var(--stack-gap, var(--space-2));
}

/* Cluster - горизонтальное размещение с переносом */
.cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-gap, var(--space-2));
    justify-content: var(--cluster-justify, flex-start);
    align-items: var(--cluster-align, center);
}

/* Center - центрирование с max-width */
.center {
    max-width: var(--center-max-width, var(--max-width-content));
    margin-inline: auto;
    padding-inline: var(--gutter);
}

/* === 4. COMPONENT PATTERNS === */

/* Card Component */
.card {
    background: var(--card-bg, white);
    border-radius: var(--radius-md, 8px);
    padding: var(--space-3);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: box-shadow 0.2s ease;
}

.card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Button Component */
.btn {
    /* Base styles */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    
    /* Typography */
    font-family: inherit;
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: none;
    
    /* Spacing */
    padding: var(--space-2) var(--space-3);
    
    /* Visual */
    border: 2px solid transparent;
    border-radius: var(--radius-md);
    background: var(--btn-bg, var(--color-primary));
    color: var(--btn-color, white);
    
    /* Interaction */
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn:active:not(:disabled) {
    transform: translateY(0);
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Button Variants */
.btn--secondary {
    --btn-bg: transparent;
    --btn-color: var(--color-primary);
    border-color: currentColor;
}

.btn--success {
    --btn-bg: var(--color-success);
}

.btn--error {
    --btn-bg: var(--color-error);
}

/* === 5. INTERACTIVE STATES === */

/* Focus management для accessibility */
:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 2px;
}

/* Убираем outline для мыши, сохраняем для клавиатуры */
:focus:not(:focus-visible) {
    outline: none;
}

/* === 6. RESPONSIVE TYPOGRAPHY === */
/* Fluid typography using clamp() */
h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
}

h2 {
    font-size: clamp(1.25rem, 3vw, 2rem);
}

/* === 7. UTILITY CLASSES === */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
}

.text-center { text-align: center; }
.text-right { text-align: right; }

/* === 8. MEDIA QUERIES === */
/* Mobile-first approach */
@media (min-width: 768px) {
    :root {
        --gutter: var(--space-4);
    }
}

/* === 9. DARK MODE === */
@media (prefers-color-scheme: dark) {
    :root {
        --color-bg: #1a1a1a;
        --color-text: #e0e0e0;
        --card-bg: #2a2a2a;
    }
    
    body {
        background: var(--color-bg);
        color: var(--color-text);
    }
}

/* === 10. PRINT STYLES === */
@media print {
    .no-print { display: none; }
    .card { box-shadow: none; border: 1px solid #ccc; }
}
```

#### 2. JavaScript Architecture

```javascript
// === ARCHITECTURAL PATTERN: MVC с реактивностью ===

/**
 * 1. STATE MANAGEMENT LAYER
 * Реактивное управление состоянием через Proxy
 */

class ReactiveState {
    constructor(initialState) {
        this.listeners = new Map();
        this.state = this._makeReactive(initialState);
    }
    
    _makeReactive(obj) {
        const self = this;
        return new Proxy(obj, {
            set(target, property, value) {
                const oldValue = target[property];
                target[property] = value;
                
                // Уведомляем подписчиков об изменении
                if (self.listeners.has(property)) {
                    self.listeners.get(property).forEach(callback => {
                        callback(value, oldValue);
                    });
                }
                
                return true;
            }
        });
    }
    
    // Подписка на изменения
    subscribe(property, callback) {
        if (!this.listeners.has(property)) {
            this.listeners.set(property, new Set());
        }
        this.listeners.get(property).add(callback);
        
        // Возвращаем функцию отписки
        return () => {
            this.listeners.get(property).delete(callback);
        };
    }
    
    // Пакетное обновление (debounced)
    batchUpdate(updates) {
        Object.keys(updates).forEach(key => {
            this.state[key] = updates[key];
        });
    }
}

// Пример использования
const lessonState = new ReactiveState({
    currentExercise: 0,
    score: 0,
    answers: [],
    isCompleted: false
});

// Подписка на изменения
lessonState.subscribe('score', (newScore, oldScore) => {
    console.log(`Score updated: ${oldScore} → ${newScore}`);
    updateUI();
});

/**
 * 2. COMPONENT SYSTEM
 * Переиспользуемые UI компоненты
 */

class Component {
    constructor(props = {}) {
        this.props = props;
        this.state = {};
        this.element = null;
        this.mounted = false;
    }
    
    // Lifecycle методы
    render() {
        throw new Error('render() must be implemented');
    }
    
    mount(container) {
        this.element = this.render();
        container.appendChild(this.element);
        this.mounted = true;
        this.onMount();
        return this;
    }
    
    unmount() {
        if (this.mounted && this.element) {
            this.onUnmount();
            this.element.remove();
            this.mounted = false;
        }
    }
    
    update(newProps) {
        this.props = { ...this.props, ...newProps };
        if (this.mounted) {
            const newElement = this.render();
            this.element.replaceWith(newElement);
            this.element = newElement;
        }
    }
    
    // Хуки жизненного цикла
    onMount() {}
    onUnmount() {}
}

/**
 * Пример: Exercise Component
 */
class ExerciseComponent extends Component {
    render() {
        const { question, options, onAnswer } = this.props;
        
        const div = document.createElement('div');
        div.className = 'exercise card';
        
        div.innerHTML = `
            <h3 class="exercise__question">${this._escapeHtml(question)}</h3>
            <div class="exercise__options cluster" role="group">
                ${options.map((opt, idx) => `
                    <button 
                        class="btn btn--secondary exercise__option" 
                        data-index="${idx}"
                        type="button"
                    >
                        ${this._escapeHtml(opt)}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Event delegation
        div.addEventListener('click', (e) => {
            const btn = e.target.closest('.exercise__option');
            if (btn) {
                const index = parseInt(btn.dataset.index);
                onAnswer(index);
            }
        });
        
        return div;
    }
    
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * 3. APPLICATION CONTROLLER
 * Координация компонентов и логики
 */

class LessonController {
    constructor(config) {
        this.config = config;
        this.state = new ReactiveState({
            currentStep: 0,
            userAnswers: [],
            score: 0
        });
        
        this.components = new Map();
        this.init();
    }
    
    init() {
        // Инициализация компонентов
        this.setupComponents();
        
        // Подписка на изменения состояния
        this.state.subscribe('currentStep', (newStep) => {
            this.renderCurrentStep(newStep);
        });
        
        this.state.subscribe('score', (newScore) => {
            this.updateScoreDisplay(newScore);
        });
        
        // Восстановление прогресса из localStorage
        this.loadProgress();
        
        // Автосохранение
        this.setupAutosave();
    }
    
    setupComponents() {
        const exerciseContainer = document.querySelector('#exercise-container');
        
        // Создаем компонент упражнения
        const exercise = new ExerciseComponent({
            question: this.config.exercises[0].question,
            options: this.config.exercises[0].options,
            onAnswer: (index) => this.handleAnswer(index)
        });
        
        this.components.set('exercise', exercise);
        exercise.mount(exerciseContainer);
    }
    
    handleAnswer(answerIndex) {
        const currentExercise = this.config.exercises[this.state.state.currentStep];
        const isCorrect = answerIndex === currentExercise.correctIndex;
        
        // Обновляем состояние
        this.state.state.userAnswers.push({
            exerciseIndex: this.state.state.currentStep,
            answerIndex,
            isCorrect,
            timestamp: Date.now()
        });
        
        if (isCorrect) {
            this.state.state.score += 1;
        }
        
        // Показываем feedback
        this.showFeedback(isCorrect);
        
        // Переход к следующему упражнению
        setTimeout(() => {
            this.nextExercise();
        }, 1500);
    }
    
    nextExercise() {
        if (this.state.state.currentStep < this.config.exercises.length - 1) {
            this.state.state.currentStep += 1;
        } else {
            this.completeLesson();
        }
    }
    
    showFeedback(isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'feedback--success' : 'feedback--error'}`;
        feedback.textContent = isCorrect ? '✓ Правильно!' : '✗ Неправильно';
        
        document.body.appendChild(feedback);
        
        // Анимация появления
        requestAnimationFrame(() => {
            feedback.classList.add('feedback--visible');
        });
        
        // Удаление через 1.5 секунды
        setTimeout(() => {
            feedback.classList.remove('feedback--visible');
            setTimeout(() => feedback.remove(), 300);
        }, 1500);
    }
    
    completeLesson() {
        const percentage = (this.state.state.score / this.config.exercises.length) * 100;
        
        // Сохраняем результат
        this.saveResult({
            lessonId: this.config.id,
            score: this.state.state.score,
            total: this.config.exercises.length,
            percentage,
            timestamp: Date.now(),
            answers: this.state.state.userAnswers
        });
        
        // Показываем экран завершения
        this.showCompletionScreen(percentage);
    }
    
    // Persistence Layer
    saveProgress() {
        const data = {
            currentStep: this.state.state.currentStep,
            userAnswers: this.state.state.userAnswers,
            score: this.state.state.score,
            timestamp: Date.now()
        };
        
        localStorage.setItem(`lesson_${this.config.id}_progress`, JSON.stringify(data));
    }
    
    loadProgress() {
        const saved = localStorage.getItem(`lesson_${this.config.id}_progress`);
        if (saved) {
            const data = JSON.parse(saved);
            // Восстанавливаем только если прошло менее 24 часов
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                this.state.batchUpdate(data);
            }
        }
    }
    
    setupAutosave() {
        // Debounced автосохранение
        let saveTimeout;
        this.state.subscribe('userAnswers', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveProgress();
            }, 1000);
        });
    }
    
    saveResult(result) {
        const results = JSON.parse(localStorage.getItem('lesson_results') || '[]');
        results.push(result);
        // Храним только последние 100 результатов
        if (results.length > 100) {
            results.shift();
        }
        localStorage.setItem('lesson_results', JSON.stringify(results));
    }
}

/**
 * 4. UTILITY FUNCTIONS
 * Переиспользуемые вспомогательные функции
 */

const Utils = {
    // Debounce для оптимизации событий
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle для ограничения частоты вызовов
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Shuffle массива (Fisher-Yates)
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    },
    
    // Sanitization
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    // Pluralization для русского языка
    pluralize(number, one, few, many) {
        const mod10 = number % 10;
        const mod100 = number % 100;
        
        if (mod10 === 1 && mod100 !== 11) return one;
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
        return many;
    },
    
    // Форматирование времени
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
};

/**
 * 5. PERFORMANCE OPTIMIZATION
 * Техники оптимизации производительности
 */

const Performance = {
    // Lazy loading для изображений
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img.lazy').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    // Виртуализация длинных списков
    virtualizeList(items, container, renderItem) {
        const ITEM_HEIGHT = 50;
        const VISIBLE_ITEMS = Math.ceil(container.clientHeight / ITEM_HEIGHT) + 2;
        
        let scrollTop = 0;
        
        const render = () => {
            const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
            const endIndex = startIndex + VISIBLE_ITEMS;
            
            const visibleItems = items.slice(startIndex, endIndex);
            
            const fragment = document.createDocumentFragment();
            visibleItems.forEach((item, index) => {
                const el = renderItem(item);
                el.style.position = 'absolute';
                el.style.top = `${(startIndex + index) * ITEM_HEIGHT}px`;
                fragment.appendChild(el);
            });
            
            container.innerHTML = '';
            container.appendChild(fragment);
            container.style.height = `${items.length * ITEM_HEIGHT}px`;
        };
        
        container.addEventListener('scroll', Utils.throttle(() => {
            scrollTop = container.scrollTop;
            render();
        }, 100));
        
        render();
    },
    
    // RequestIdleCallback fallback
    scheduleWork(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }
};

/**
 * 6. INITIALIZATION
 * Точка входа в приложение
 */

document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация урока
    const lessonConfig = {
        id: 'lesson-xxx',
        title: 'Название урока',
        exercises: [
            // ... данные упражнений
        ]
    };
    
    // Инициализация контроллера
    const lesson = new LessonController(lessonConfig);
    
    // Lazy loading для изображений
    Performance.lazyLoadImages();
    
    // Обработка ошибок
    window.addEventListener('error', (event) => {
        console.error('Application error:', event.error);
        // Отправка в аналитику (если есть)
    });
    
    // Service Worker регистрация (для PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW registered', reg))
            .catch(err => console.log('SW registration failed', err));
    }
});
```

---

## Система управления состоянием

### State Machine для урока

```javascript
/**
 * Конечный автомат состояний урока
 * Обеспечивает предсказуемые переходы между состояниями
 */

const LESSON_STATES = {
    INITIAL: 'initial',
    LOADING: 'loading',
    READY: 'ready',
    IN_PROGRESS: 'in_progress',
    PAUSED: 'paused',
    REVIEWING: 'reviewing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

const LESSON_EVENTS = {
    LOAD: 'load',
    START: 'start',
    ANSWER: 'answer',
    PAUSE: 'pause',
    RESUME: 'resume',
    REVIEW: 'review',
    COMPLETE: 'complete',
    ERROR: 'error',
    RESET: 'reset'
};

class LessonStateMachine {
    constructor() {
        this.state = LESSON_STATES.INITIAL;
        this.transitions = this._defineTransitions();
        this.listeners = new Map();
    }
    
    _defineTransitions() {
        return {
            [LESSON_STATES.INITIAL]: {
                [LESSON_EVENTS.LOAD]: LESSON_STATES.LOADING
            },
            [LESSON_STATES.LOADING]: {
                [LESSON_EVENTS.START]: LESSON_STATES.READY,
                [LESSON_EVENTS.ERROR]: LESSON_STATES.ERROR
            },
            [LESSON_STATES.READY]: {
                [LESSON_EVENTS.START]: LESSON_STATES.IN_PROGRESS
            },
            [LESSON_STATES.IN_PROGRESS]: {
                [LESSON_EVENTS.ANSWER]: LESSON_STATES.IN_PROGRESS,
                [LESSON_EVENTS.PAUSE]: LESSON_STATES.PAUSED,
                [LESSON_EVENTS.COMPLETE]: LESSON_STATES.COMPLETED
            },
            [LESSON_STATES.PAUSED]: {
                [LESSON_EVENTS.RESUME]: LESSON_STATES.IN_PROGRESS,
                [LESSON_EVENTS.RESET]: LESSON_STATES.READY
            },
            [LESSON_STATES.COMPLETED]: {
                [LESSON_EVENTS.REVIEW]: LESSON_STATES.REVIEWING,
                [LESSON_EVENTS.RESET]: LESSON_STATES.READY
            },
            [LESSON_STATES.REVIEWING]: {
                [LESSON_EVENTS.RESET]: LESSON_STATES.READY
            },
            [LESSON_STATES.ERROR]: {
                [LESSON_EVENTS.RESET]: LESSON_STATES.INITIAL
            }
        };
    }
    
    transition(event, payload) {
        const currentTransitions = this.transitions[this.state];
        const nextState = currentTransitions?.[event];
        
        if (!nextState) {
            console.warn(`Invalid transition: ${this.state} -> ${event}`);
            return false;
        }
        
        const prevState = this.state;
        this.state = nextState;
        
        // Уведомляем подписчиков
        this._notify(prevState, nextState, payload);
        
        return true;
    }
    
    on(callback) {
        const id = Symbol();
        this.listeners.set(id, callback);
        return () => this.listeners.delete(id);
    }
    
    _notify(from, to, payload) {
        this.listeners.forEach(callback => {
            callback({ from, to, payload });
        });
    }
}
```

---

## Модульная архитектура компонентов

### Компонентная система

```javascript
/**
 * Базовые переиспользуемые компоненты
 */

// 1. Progressbar Component
class ProgressBar extends Component {
    render() {
        const { current, total, label } = this.props;
        const percentage = (current / total) * 100;
        
        const div = document.createElement('div');
        div.className = 'progress';
        div.setAttribute('role', 'progressbar');
        div.setAttribute('aria-valuenow', current);
        div.setAttribute('aria-valuemin', '0');
        div.setAttribute('aria-valuemax', total);
        div.setAttribute('aria-label', label || 'Progress');
        
        div.innerHTML = `
            <div class="progress__bar" style="width: ${percentage}%"></div>
            <span class="progress__label">${current} / ${total}</span>
        `;
        
        return div;
    }
}

// 2. Modal Component
class Modal extends Component {
    render() {
        const { title, content, onClose } = this.props;
        
        const div = document.createElement('div');
        div.className = 'modal';
        div.setAttribute('role', 'dialog');
        div.setAttribute('aria-modal', 'true');
        div.setAttribute('aria-labelledby', 'modal-title');
        
        div.innerHTML = `
            <div class="modal__overlay"></div>
            <div class="modal__container">
                <header class="modal__header">
                    <h2 id="modal-title">${this._escapeHtml(title)}</h2>
                    <button class="modal__close" aria-label="Close modal">&times;</button>
                </header>
                <div class="modal__content">
                    ${content}
                </div>
            </div>
        `;
        
        // Event listeners
        div.querySelector('.modal__close').addEventListener('click', onClose);
        div.querySelector('.modal__overlay').addEventListener('click', onClose);
        
        // Trap focus внутри модального окна
        this._trapFocus(div);
        
        return div;
    }
    
    _trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        container.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
            
            if (e.key === 'Escape') {
                this.props.onClose();
            }
        });
        
        // Фокус на первом элементе при открытии
        setTimeout(() => firstElement.focus(), 0);
    }
}

// 3. Timer Component
class Timer extends Component {
    constructor(props) {
        super(props);
        this.startTime = Date.now();
        this.elapsed = 0;
        this.interval = null;
    }
    
    onMount() {
        this.interval = setInterval(() => {
            this.elapsed = Date.now() - this.startTime;
            this.update({ elapsed: this.elapsed });
        }, 1000);
    }
    
    onUnmount() {
        clearInterval(this.interval);
    }
    
    render() {
        const { elapsed = 0 } = this.props;
        const formatted = Utils.formatTime(elapsed);
        
        const span = document.createElement('span');
        span.className = 'timer';
        span.textContent = formatted;
        span.setAttribute('aria-live', 'polite');
        
        return span;
    }
}

// 4. Score Display Component
class ScoreDisplay extends Component {
    render() {
        const { score, total } = this.props;
        const percentage = (score / total) * 100;
        
        const div = document.createElement('div');
        div.className = 'score';
        
        let emoji = '😐';
        let message = 'Нормально';
        
        if (percentage >= 90) {
            emoji = '🌟';
            message = 'Отлично!';
        } else if (percentage >= 70) {
            emoji = '😊';
            message = 'Хорошо!';
        } else if (percentage >= 50) {
            emoji = '🙂';
            message = 'Неплохо';
        }
        
        div.innerHTML = `
            <div class="score__emoji">${emoji}</div>
            <div class="score__text">
                <strong>${score}</strong> из <strong>${total}</strong>
            </div>
            <div class="score__message">${message}</div>
            <div class="score__percentage">${percentage.toFixed(0)}%</div>
        `;
        
        return div;
    }
}
```

---

## Паттерны и Best Practices

### 1. Error Handling

```javascript
/**
 * Централизованная обработка ошибок
 */

class ErrorHandler {
    static handle(error, context = {}) {
        console.error('Application error:', error, context);
        
        // Показываем пользователю дружелюбное сообщение
        this.showErrorMessage(this.getUserMessage(error));
        
        // Логируем для разработчика
        this.logError(error, context);
        
        // Отправляем в аналитику (если настроено)
        this.reportError(error, context);
    }
    
    static getUserMessage(error) {
        if (error instanceof NetworkError) {
            return 'Проблемы с подключением. Проверьте интернет.';
        }
        
        if (error instanceof ValidationError) {
            return 'Пожалуйста, проверьте введенные данные.';
        }
        
        return 'Что-то пошло не так. Попробуйте обновить страницу.';
    }
    
    static showErrorMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast--error';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast--visible');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
    
    static logError(error, context) {
        // Структурированное логирование
        const log = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.table(log);
    }
    
    static reportError(error, context) {
        // TODO: интеграция с сервисом отслеживания ошибок
        // Например: Sentry, Rollbar, или собственный endpoint
    }
}

// Глобальный обработчик
window.addEventListener('error', (event) => {
    ErrorHandler.handle(event.error, {
        type: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    ErrorHandler.handle(event.reason, {
        type: 'unhandled-promise'
    });
});
```

### 2. Testing Utilities

```javascript
/**
 * Встроенные утилиты для тестирования
 * Использовать только в development режиме
 */

const TestUtils = {
    // Автоматическое заполнение упражнений (для отладки)
    autoCompleteExercises() {
        const exercises = lessonState.state.exercises;
        exercises.forEach((exercise, index) => {
            setTimeout(() => {
                const correctAnswer = exercise.options[exercise.correctIndex];
                console.log(`Auto-answering ${index + 1}: ${correctAnswer}`);
                // Триггерим правильный ответ
                document.querySelector(`[data-exercise="${index}"] [data-index="${exercise.correctIndex}"]`).click();
            }, index * 1000);
        });
    },
    
    // Проверка accessibility
    checkA11y() {
        const issues = [];
        
        // Проверка alt текстов
        document.querySelectorAll('img:not([alt])').forEach(img => {
            issues.push({ element: img, issue: 'Missing alt attribute' });
        });
        
        // Проверка aria-labels для интерактивных элементов
        document.querySelectorAll('button:not([aria-label]):not(:has(text))').forEach(btn => {
            issues.push({ element: btn, issue: 'Button without label' });
        });
        
        // Проверка контрастности
        // ... более сложная логика
        
        console.table(issues);
        return issues;
    },
    
    // Эмуляция медленного соединения
    simulateSlowNetwork(delay = 3000) {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            await new Promise(resolve => setTimeout(resolve, delay));
            return originalFetch(...args);
        };
    },
    
    // Snapshot состояния
    snapshotState() {
        return JSON.parse(JSON.stringify(lessonState.state));
    },
    
    // Восстановление состояния
    restoreState(snapshot) {
        Object.assign(lessonState.state, snapshot);
    }
};

// Доступ через консоль в development
if (process.env.NODE_ENV === 'development') {
    window.__TEST__ = TestUtils;
}
```

---

## Производительность и оптимизация

### Метрики производительности

```javascript
/**
 * Performance monitoring
 */

class PerformanceMonitor {
    constructor() {
        this.marks = new Map();
        this.measures = [];
    }
    
    // Отметить начало операции
    mark(name) {
        performance.mark(name);
        this.marks.set(name, performance.now());
    }
    
    // Измерить время между отметками
    measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);
        
        const entry = performance.getEntriesByName(name)[0];
        this.measures.push({
            name,
            duration: entry.duration,
            timestamp: Date.now()
        });
        
        return entry.duration;
    }
    
    // Получить метрики производительности страницы
    getPageMetrics() {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        return {
            // Time to First Byte
            ttfb: perfData.responseStart - perfData.requestStart,
            
            // DOM Content Loaded
            dcl: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            
            // Load Complete
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            
            // Total Page Load
            totalLoad: perfData.loadEventEnd - perfData.fetchStart
        };
    }
    
    // Отчет о производительности
    report() {
        console.group('Performance Report');
        console.table(this.getPageMetrics());
        console.table(this.measures);
        console.groupEnd();
    }
}

const perfMonitor = new PerformanceMonitor();

// Использование
document.addEventListener('DOMContentLoaded', () => {
    perfMonitor.mark('app-init-start');
    
    // ... инициализация приложения
    
    perfMonitor.mark('app-init-end');
    perfMonitor.measure('app-initialization', 'app-init-start', 'app-init-end');
    
    // Отчет через 5 секунд после загрузки
    setTimeout(() => {
        perfMonitor.report();
    }, 5000);
});
```

### Оптимизация рендеринга

```javascript
/**
 * Batch DOM updates для избежания layout thrashing
 */

class DOMBatcher {
    constructor() {
        this.reads = [];
        this.writes = [];
        this.scheduled = false;
    }
    
    read(callback) {
        this.reads.push(callback);
        this.schedule();
    }
    
    write(callback) {
        this.writes.push(callback);
        this.schedule();
    }
    
    schedule() {
        if (this.scheduled) return;
        
        this.scheduled = true;
        requestAnimationFrame(() => {
            // Сначала все чтения
            this.reads.forEach(fn => fn());
            this.reads = [];
            
            // Потом все записи
            this.writes.forEach(fn => fn());
            this.writes = [];
            
            this.scheduled = false;
        });
    }
}

const batcher = new DOMBatcher();

// Использование
function updateMultipleElements() {
    const elements = document.querySelectorAll('.element');
    
    elements.forEach(el => {
        // Сначала читаем
        batcher.read(() => {
            const height = el.offsetHeight;
            
            // Потом пишем
            batcher.write(() => {
                el.style.height = `${height * 2}px`;
            });
        });
    });
}
```

---

## Будущие улучшения

### Roadmap

#### Phase 1: Template System (Q1 2026)
- Создание системы шаблонов для генерации HTML-файлов
- CLI инструмент для создания новых уроков
- Автоматизация обновления общих компонентов

#### Phase 2: Progressive Web App (Q2 2026)
- Service Worker для offline работы
- Манифест приложения
- Push уведомления о новых уроках

#### Phase 3: Analytics & Insights (Q3 2026)
- Встроенная аналитика без внешних сервисов
- Дашборд прогресса обучения
- Рекомендации на основе результатов

#### Phase 4: Advanced Interactions (Q4 2026)
- Голосовой ввод для упражнений
- Распознавание речи для произношения
- Геймификация с достижениями

### Технический долг

**Приоритет 1 (Критический):**
- Рефакторинг дублирующегося кода между уроками
- Создание единой системы типов (TypeScript или JSDoc)
- Автоматизированное тестирование

**Приоритет 2 (Высокий):**
- Миграция на Web Components для лучшей изоляции
- Внедрение CSS-in-JS для динамических стилей
- Оптимизация bundle size (code splitting)

**Приоритет 3 (Средний):**
- Документация API компонентов
- Storybook для демонстрации компонентов
- E2E тестирование (Playwright/Cypress)

---

## Заключение

Данная архитектура представляет собой баланс между простотой standalone HTML-файлов и современными паттернами разработки. Код написан с учетом:

- **Maintainability**: Легко поддерживать и расширять
- **Performance**: Оптимизирован для быстрой загрузки и работы
- **Accessibility**: Соответствует стандартам доступности
- **Scalability**: Готов к масштабированию через систему шаблонов
- **Developer Experience**: Понятен и хорошо структурирован

При работе над новыми уроками следуйте этим принципам и паттернам для сохранения консистентности кодовой базы.

---

**Автор:** andreacebotarev-svg  
**Версия:** 1.0.0  
**Дата:** Декабрь 2025
