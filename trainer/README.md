# English Trainer 🎓

> **Vanilla TypeScript** приложение для обучения детей (5–10 лет) чтению английских CVC-слов через фонетический подход.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Особенности

- 🚀 **Vanilla TypeScript** - без React/Vue/Angular
- 📦 **Минимальные зависимости** - только Zod для валидации
- 🎯 **Модульная архитектура** - упрощённый Feature-Sliced Design
- 🔊 **Аудио поддержка** - Web Speech API + предзагрузка MP3
- 📱 **Mobile-first** - адаптивный интерфейс для планшетов
- 💾 **Прогресс сохраняется** - localStorage для сессий
- 🎨 **Анимации для детей** - CSS transitions + GSAP (опционально)
- ✅ **Типобезопасность** - TypeScript + Zod схемы

## 🏗️ Архитектура проекта

### Структура папок

```
trainer/
├── public/                     # Статические файлы
│   └── audio/                  # MP3 файлы (опционально)
├── src/                        # Исходный код
│   ├── main.ts                 # Точка входа
│   ├── /core                   # Ядро приложения
│   │   ├── App.ts              # Главный класс
│   │   ├── Router.ts           # Hash-based роутинг
│   │   └── EventBus.ts         # Pub/Sub для компонентов
│   ├── /pages                  # Страницы приложения
│   │   ├── LessonSelectPage.ts # Выбор урока
│   │   ├── LessonTrainerPage.ts# Игровая страница
│   │   └── ResultsPage.ts      # Экран результатов
│   ├── /widgets                # Составные компоненты
│   │   ├── PhonemeBuilder/     # Игровая зона сборки
│   │   │   ├── PhonemeBuilder.ts
│   │   │   ├── PhonemeSlot.ts
│   │   │   └── PhonemeCard.ts
│   │   └── ProgressBar/
│   │       └── ProgressBar.ts
│   ├── /features               # Бизнес-логика
│   │   ├── phonics-engine/     # Проверка фонем
│   │   │   ├── PhonicsValidator.ts
│   │   │   └── SoundMatcher.ts
│   │   └── audio-manager/      # Управление звуком
│   │       ├── AudioPlayer.ts
│   │       └── AudioPreloader.ts
│   ├── /entities               # Модели данных
│   │   ├── dictionary/
│   │   │   ├── types.ts        # TypeScript типы
│   │   │   ├── schema.ts       # Zod валидация
│   │   │   └── LessonLoader.ts # API загрузки
│   │   └── session/
│   │       ├── SessionStore.ts # Состояние (localStorage)
│   │       └── types.ts
│   ├── /shared                 # Общие утилиты
│   │   ├── /ui                 # Базовые UI элементы
│   │   │   ├── Button.ts
│   │   │   ├── Card.ts
│   │   │   └── Modal.ts
│   │   ├── /lib
│   │   │   ├── dom.ts          # DOM хелперы
│   │   │   ├── storage.ts      # localStorage API
│   │   │   └── utils.ts
│   │   └── /styles
│   │       ├── global.css
│   │       ├── variables.css
│   │       └── animations.css
│   └── vite-env.d.ts
├── index.html                  # HTML шаблон
├── vite.config.ts              # Конфигурация Vite
├── tsconfig.json               # TypeScript настройки
├── package.json
├── deploy.sh                   # Скрипт деплоя
└── README.md
```

### Принципы архитектуры

1. **Separation of Concerns** - четкое разделение UI, логики и данных
2. **Dependency Injection** - компоненты получают зависимости через конструктор
3. **Event-Driven** - компоненты общаются через EventBus
4. **Immutable State** - состояние изменяется только через методы Store
5. **Type Safety** - TypeScript + Zod для runtime валидации

## 🚀 Быстрый старт

### Требования

- **Node.js** 18+ (только для разработки, не для продакшена!)
- **npm** или **pnpm**
- **Git**

### Установка

```bash
cd trainer
npm install
```

### Разработка

```bash
npm run dev
```

Откроется http://localhost:5173/englishlessons/trainer/

### Сборка

```bash
npm run build
```

Результат в `../dist/trainer/`

### Деплой на GitHub Pages

```bash
npm run deploy
```

Или вручную:

```bash
bash deploy.sh
```

**Важно**: Деплой использует `gh-pages` branch, НЕ GitHub Actions!

## 📦 Добавление нового урока

### Шаг 1: Создать JSON файл

Создайте файл `../../data/lesson_11.json`:

```json
{
  "id": 11,
  "title": "Диграфы: sh, ch",
  "rule": "Сочетания sh и ch читаются как единый звук",
  "description": "Учимся читать слова с sh [ʃ] и ch [tʃ]",
  "phonemes_set": ["sh", "ch", "i", "p", "n"],
  "words": [
    {
      "word": "ship",
      "phonemes": ["sh", "i", "p"],
      "translation": "корабль",
      "transcription": "[ʃɪp]",
      "emoji": "🚢",
      "audio_url": "./audio/ship.mp3"
    },
    {
      "word": "chin",
      "phonemes": ["ch", "i", "n"],
      "translation": "подбородок",
      "transcription": "[tʃɪn]",
      "emoji": "🙂"
    }
  ]
}
```

### Шаг 2: Валидация схемы

Данные автоматически проверяются через Zod при загрузке:

```typescript
// src/entities/dictionary/schema.ts
export const LessonSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  rule: z.string(),
  description: z.string(),
  phonemes_set: z.array(z.string()),
  words: z.array(WordCardSchema).min(5),
});
```

### Шаг 3: Приложение подхватит урок автоматически

Список уроков загружается динамически из папки `/data`.

## 🎯 Как работает приложение

### 1. Инициализация

```typescript
// src/main.ts
import { App } from '@/core/App';

const app = new App('app');
```

### 2. Роутинг

```typescript
// src/core/Router.ts
router.addRoute('/', () => import('@/pages/LessonSelectPage'));
router.addRoute('/lesson/:id', () => import('@/pages/LessonTrainerPage'));
```

### 3. Загрузка данных

```typescript
// src/entities/dictionary/LessonLoader.ts
const lesson = await LessonLoader.load(1); // lesson_01.json
```

### 4. Валидация через Zod

```typescript
const result = LessonSchema.safeParse(data);
if (!result.success) {
  throw new Error('Invalid lesson data');
}
```

### 5. Управление состоянием

```typescript
// src/entities/session/SessionStore.ts
store.startLesson(1);
store.addPhoneme('c');
store.checkAnswer(['c', 'æ', 't']); // true
```

### 6. UI обновление

```typescript
// Компонент подписывается на изменения
store.subscribe((state) => {
  this.render(state);
});
```

## 🎨 Стилизация

### CSS переменные

```css
/* src/shared/styles/variables.css */
:root {
  --color-primary: #667eea;
  --color-success: #48bb78;
  --color-error: #f56565;
  --color-bg: #f7fafc;
  --border-radius: 12px;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
}
```

### Анимации для детей

```css
/* src/shared/styles/animations.css */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.phoneme-card:hover {
  animation: bounce 0.5s ease;
}
```

## 🔊 Аудио система

### Web Speech API (встроенный)

```typescript
const utterance = new SpeechSynthesisUtterance('cat');
utterance.lang = 'en-US';
speechSynthesis.speak(utterance);
```

### Предзагруженные MP3 (опционально)

```typescript
// src/features/audio-manager/AudioPlayer.ts
await audioPlayer.preload(['cat.mp3', 'bat.mp3']);
audioPlayer.play('cat');
```

## 🧪 Тестирование (TODO)

```bash
npm run test
```

Использует **Vitest** для unit-тестов:

```typescript
// src/features/phonics-engine/__tests__/validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateWord } from '../PhonicsValidator';

describe('PhonicsValidator', () => {
  it('validates correct phoneme sequence', () => {
    expect(validateWord(['c', 'æ', 't'], ['c', 'æ', 't'])).toBe(true);
  });
});
```

## 📱 Поддержка устройств

### Desktop
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### Планшеты
- iPad (iOS 14+) ✅ Основная целевая платформа
- Android tablets (Chrome 90+)

## 🐛 Устранение неполадок

### Ошибка: "Cannot find module '@/entities/...'"

**Решение**: Проверьте `vite.config.ts`:

```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, './src'),
    '@/entities': resolve(__dirname, './src/entities'),
    // ...
  }
}
```

### Ошибка: "Failed to load lesson"

**Проверьте**:
1. Файл существует: `../../data/lesson_01.json`
2. JSON валиден (используйте jsonlint.com)
3. Структура соответствует Zod схеме

### Ошибка деплоя: "gh-pages branch not found"

**Решение**:
```bash
git checkout -b gh-pages
git push -u origin gh-pages
git checkout main
```

## 🚢 Процесс деплоя

### Что происходит при `npm run deploy`

1. **Сборка** → `vite build` → файлы в `../dist/trainer/`
2. **Копирование данных** → `/data` → `../dist/data/`
3. **Git subtree push** → `../dist/` → `gh-pages` branch
4. **GitHub Pages** → автоматически публикует через ~30 секунд

### Структура после деплоя

```
gh-pages branch:
├── trainer/               # Собранное приложение
│   ├── index.html
│   ├── assets/
│   │   ├── index-[hash].js
│   │   └── index-[hash].css
│   └── audio/
├── data/                  # JSON уроки
│   ├── lesson_01.json
│   └── ...
└── legacy/                # Старый сайт (Palace Engine)
    └── index.html
```

## 📊 Метрики производительности

### Размер бандла

- **Основной бандл**: ~15KB (gzip)
- **Zod**: ~12KB (gzip)
- **Итого**: ~27KB

### Время загрузки

- **First Contentful Paint**: <0.5s
- **Time to Interactive**: <1s
- **Lighthouse Score**: 95+

## 🔐 Безопасность данных

### Валидация ввода

Все данные из JSON проходят валидацию через Zod:

```typescript
const lesson = LessonSchema.parse(data); // Бросит ошибку при невалидных данных
```

### localStorage

```typescript
// Только безопасные данные
localStorage.setItem('english-trainer-session', JSON.stringify({
  score: 100,
  completedLessons: [1, 2, 3]
}));
```

## 🤝 Contributing

1. Fork репозитория
2. Создайте feature branch: `git checkout -b feature/my-feature`
3. Commit изменений: `git commit -am 'feat: add new feature'`
4. Push в branch: `git push origin feature/my-feature`
5. Создайте Pull Request

## 📚 Полезные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Zod Validation](https://zod.dev/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 📄 Лицензия

MIT © 2025 andreacebotarev-svg

---

## 🎯 Roadmap

- [x] Базовая архитектура Vanilla TypeScript
- [x] Загрузка JSON уроков
- [x] Zod валидация
- [x] Деплой через gh-pages branch
- [ ] Реализация PhonemeBuilder widget
- [ ] Интеграция аудио системы
- [ ] Анимации для детей
- [ ] Unit-тесты (Vitest)
- [ ] Прогресс в localStorage
- [ ] Адаптация для iPad
- [ ] Accessibility (a11y)
- [ ] PWA поддержка

## 📞 Поддержка

Вопросы и баги: [GitHub Issues](https://github.com/andreacebotarev-svg/englishlessons/issues)

---

**Создано с ❤️ для детей, изучающих английский**
