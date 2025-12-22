# 🏗️ Архитектура English Phonics Trainer

## Оглавление

- [Общая архитектура](#общая-архитектура)
- [Feature-Sliced Design](#feature-sliced-design)
- [Ключевые паттерны](#ключевые-паттерны)
- [Поток данных](#поток-данных)
- [Жизненный цикл компонентов](#жизненный-цикл-компонентов)
- [Принципы проектирования](#принципы-проектирования)

---

## Общая архитектура

### Диаграмма зависимостей

```
┌─────────────────────────────────────────┐
│              main.ts                    │
│         (Entry Point)                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│            core/App                     │
│  ┌────────────┬──────────────┐         │
│  │   Router   │  EventBus    │         │
│  └────┬───────┴───────┬──────┘         │
└───────┼───────────────┼────────────────┘
        │               │
        ▼               ▼
┌───────────────┐ ┌────────────────┐
│    pages/     │ │   widgets/     │
│               │ │                │
│ LessonSelect  │ │ PhonemeBuilder │
│ LessonTrainer │ │ WordDisplay    │
│ Results       │ │ ProgressBar    │
└───────┬───────┘ └────────┬───────┘
        │                  │
        └────────┬─────────┘
                 ▼
        ┌─────────────────┐
        │   features/     │
        │                 │
        │ phonics-engine  │
        │ audio-manager   │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   entities/     │
        │                 │
        │ dictionary      │
        │ session         │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   shared/       │
        │                 │
        │ ui/ lib/ styles │
        └─────────────────┘
```

### Принцип слоёв

```
Правило: Слой может зависеть только от нижележащих слоёв

┌─────────────────────────────────────┐
│  app/          (Инициализация)      │ ⬆️ Высший уровень
├─────────────────────────────────────┤
│  pages/        (Роуты)              │
├─────────────────────────────────────┤
│  widgets/      (Композиция)         │
├─────────────────────────────────────┤
│  features/     (Бизнес-логика)      │
├─────────────────────────────────────┤
│  entities/     (Модели данных)      │
├─────────────────────────────────────┤
│  shared/       (Утилиты)            │ ⬇️ Базовый уровень
└─────────────────────────────────────┘

❌ pages не может импортировать из widgets
✅ widgets может импортировать из features, entities, shared
✅ features может импортировать из entities, shared
```

---

## Feature-Sliced Design

### Структура слайса

Каждый слайс имеет единую структуру:

```typescript
slice_name/
├── index.ts              // Public API
├── ClassName.ts          // Основной класс
├── types.ts              // TypeScript типы
├── ClassName.test.ts     // Тесты
└── ClassName.css         // Стили (если нужны)
```

### Публичный API (index.ts)

```typescript
// widgets/PhonemeBuilder/index.ts

// Экспортируем только то, что нужно снаружи
export { PhonemeBuilder } from './PhonemeBuilder';
export type { PhonemeBuilderConfig } from './types';

// НЕ экспортируем внутренние детали
// PhonemeSlot, PhonemeCard остаются приватными
```

### Пример слайса: PhonemeBuilder

```
widgets/PhonemeBuilder/
├── index.ts                      # Public API
├── PhonemeBuilder.ts             # Main widget class
├── PhonemeSlot.ts                # Internal component
├── PhonemeCard.ts                # Internal component
├── types.ts                      # TypeScript interfaces
├── PhonemeBuilder.test.ts        # Unit tests
└── PhonemeBuilder.css            # Styles
```

---

## Ключевые паттерны

### 1. Component Pattern (Класс-компонент)

Все UI компоненты следуют единому паттерну:

```typescript
export class ComponentName {
  private element: HTMLElement;
  private state: ComponentState;
  private cleanup: Array<() => void> = [];
  
  constructor(
    private container: HTMLElement,
    private config: ComponentConfig
  ) {
    this.element = this.createElement();
    this.state = this.getInitialState();
    this.attachEventListeners();
  }
  
  // Создание DOM элемента
  private createElement(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'component-name';
    return element;
  }
  
  // Начальное состояние
  private getInitialState(): ComponentState {
    return { /* ... */ };
  }
  
  // Подписка на события
  private attachEventListeners(): void {
    const cleanup = on(this.element, 'click', this.handleClick);
    this.cleanup.push(cleanup);
  }
  
  // Рендеринг
  render(): void {
    this.container.appendChild(this.element);
    this.updateView();
  }
  
  // Обновление отображения
  private updateView(): void {
    // Обновить DOM на основе this.state
  }
  
  // Обновление состояния
  setState(partial: Partial<ComponentState>): void {
    this.state = { ...this.state, ...partial };
    this.updateView();
  }
  
  // Очистка
  destroy(): void {
    this.cleanup.forEach(fn => fn());
    this.element.remove();
  }
}
```

### 2. Observer Pattern (Управление состоянием)

```typescript
export class Store<T> {
  private state: T;
  private listeners = new Set<(state: T) => void>();
  
  constructor(initialState: T) {
    this.state = initialState;
  }
  
  // Подписка на изменения
  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    listener(this.state); // Вызов сразу
    
    return () => this.listeners.delete(listener);
  }
  
  // Получение состояния
  getState(): Readonly<T> {
    return { ...this.state };
  }
  
  // Изменение состояния
  protected setState(updater: (state: T) => T): void {
    this.state = updater(this.state);
    this.notify();
  }
  
  // Уведомление подписчиков
  private notify(): void {
    this.listeners.forEach(listener => {
      listener(this.state);
    });
  }
}
```

### 3. Event Bus Pattern (Межкомпонентная связь)

```typescript
export class EventBus {
  private events = new Map<string, Set<EventHandler>>();
  
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler);
    
    // Возвращаем функцию отписки
    return () => {
      this.events.get(event)?.delete(handler);
    };
  }
  
  emit<T = any>(event: string, data?: T): void {
    const handlers = this.events.get(event);
    if (!handlers) return;
    
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }
  
  once<T = any>(event: string, handler: EventHandler<T>): void {
    const unsubscribe = this.on(event, (data: T) => {
      handler(data);
      unsubscribe();
    });
  }
}
```

### 4. Router Pattern (Навигация)

```typescript
export class Router {
  private routes = new Map<string, PageClass>();
  private currentPage: Page | null = null;
  
  constructor(
    private container: HTMLElement,
    private basePath: string = '/trainer'
  ) {}
  
  register(path: string, PageClass: PageClass): void {
    this.routes.set(path, PageClass);
  }
  
  navigate(path: string): void {
    window.location.hash = path;
  }
  
  async start(): Promise<void> {
    window.addEventListener('hashchange', () => {
      this.render(this.getCurrentPath());
    });
    
    await this.render(this.getCurrentPath());
  }
  
  private getCurrentPath(): string {
    return window.location.hash.slice(1) || '/';
  }
  
  private async render(path: string): Promise<void> {
    // Размонтировать предыдущую страницу
    if (this.currentPage) {
      this.currentPage.destroy();
    }
    
    // Найти роут
    const PageClass = this.matchRoute(path);
    if (!PageClass) {
      this.show404();
      return;
    }
    
    // Создать и отобразить новую страницу
    this.currentPage = new PageClass(this.container);
    await this.currentPage.render();
  }
  
  private matchRoute(path: string): PageClass | null {
    // Простое сопоставление
    if (this.routes.has(path)) {
      return this.routes.get(path)!;
    }
    
    // Сопоставление с параметрами (например, /lesson/:id)
    for (const [pattern, PageClass] of this.routes) {
      const match = this.matchPattern(path, pattern);
      if (match) return PageClass;
    }
    
    return null;
  }
  
  private matchPattern(path: string, pattern: string): boolean {
    const pathParts = path.split('/');
    const patternParts = pattern.split('/');
    
    if (pathParts.length !== patternParts.length) return false;
    
    return patternParts.every((part, i) => {
      return part.startsWith(':') || part === pathParts[i];
    });
  }
}
```

---

## Поток данных

### Однонаправленный поток данных

```
┌─────────────────────────────────────────┐
│         User Interaction                │
│  (Click, Input, Touch, etc.)            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Event Handler                   │
│  (onClick, onInput, etc.)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Store.setState()                │
│  (Update application state)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Store.notify()                  │
│  (Notify all subscribers)               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Component.updateView()             │
│  (Re-render UI based on new state)      │
└─────────────────────────────────────────┘
```

### Пример потока данных

```typescript
// 1. Пользователь кликает на фонему
phonemeCard.element.addEventListener('click', () => {
  
  // 2. Вызывается обработчик
  this.handlePhonemeClick(phoneme);
});

private handlePhonemeClick(phoneme: string): void {
  
  // 3. Обновляется состояние в Store
  sessionStore.addPhoneme(phoneme);
}

// 4. Store уведомляет подписчиков
class SessionStore extends Store<SessionState> {
  addPhoneme(phoneme: string): void {
    this.setState(state => ({
      ...state,
      selectedPhonemes: [...state.selectedPhonemes, phoneme]
    }));
  }
}

// 5. Компонент обновляет UI
const unsubscribe = sessionStore.subscribe(state => {
  this.updateSlots(state.selectedPhonemes);
});
```

---

## Жизненный цикл компонентов

### Page Lifecycle

```typescript
export abstract class Page {
  constructor(container: HTMLElement) {
    // 1. Инициализация
    this.container = container;
  }
  
  async render(): Promise<void> {
    // 2. Загрузка данных
    await this.loadData();
    
    // 3. Создание DOM
    this.createElement();
    
    // 4. Подписка на события
    this.attachEventListeners();
    
    // 5. Отображение
    this.mount();
  }
  
  destroy(): void {
    // 6. Очистка
    this.cleanup();
    this.unmount();
  }
  
  protected abstract loadData(): Promise<void>;
  protected abstract createElement(): void;
  protected abstract attachEventListeners(): void;
  protected abstract mount(): void;
  protected abstract cleanup(): void;
  protected abstract unmount(): void;
}
```

### Widget Lifecycle

```typescript
export class Widget {
  // 1. Создание экземпляра
  constructor(config: WidgetConfig) {
    this.config = config;
    this.state = this.getInitialState();
  }
  
  // 2. Монтирование
  mount(container: HTMLElement): void {
    this.createElement();
    this.attachEventListeners();
    container.appendChild(this.element);
    this.onMount();
  }
  
  // 3. Обновление
  update(newConfig: Partial<WidgetConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }
  
  // 4. Размонтирование
  unmount(): void {
    this.onUnmount();
    this.cleanup();
    this.element.remove();
  }
  
  protected onMount(): void {}
  protected onUnmount(): void {}
}
```

---

## Принципы проектирования

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)

```typescript
// ❌ BAD: Класс делает слишком много
class LessonPage {
  loadLesson() { /* ... */ }
  validateAnswer() { /* ... */ }
  playAudio() { /* ... */ }
  saveProgress() { /* ... */ }
}

// ✅ GOOD: Разделяем ответственность
class LessonPage {
  constructor(
    private lessonLoader: LessonLoader,
    private phonicsValidator: PhonicsValidator,
    private audioPlayer: AudioPlayer,
    private progressManager: ProgressManager
  ) {}
}
```

#### 2. Open/Closed Principle (OCP)

```typescript
// ✅ GOOD: Открыто для расширения, закрыто для модификации
abstract class BasePage {
  async render(): Promise<void> {
    await this.loadData();
    this.createElement();
    this.mount();
  }
  
  protected abstract loadData(): Promise<void>;
  protected abstract createElement(): void;
}

class LessonPage extends BasePage {
  protected async loadData(): Promise<void> {
    this.lesson = await lessonLoader.load(this.lessonId);
  }
  
  protected createElement(): void {
    // Специфичная реализация
  }
}
```

#### 3. Dependency Inversion Principle (DIP)

```typescript
// ✅ GOOD: Зависимость от абстракции
interface AudioPlayer {
  play(url: string): Promise<void>;
  stop(): void;
}

class Widget {
  constructor(private audioPlayer: AudioPlayer) {}
  
  async playSound(): Promise<void> {
    await this.audioPlayer.play(this.soundUrl);
  }
}

// Можем подставить любую реализацию
const widget1 = new Widget(new WebAudioPlayer());
const widget2 = new Widget(new HTML5AudioPlayer());
```

### Composition over Inheritance

```typescript
// ✅ GOOD: Композиция
class PhonemeBuilder {
  private slots: PhonemeSlot[];
  private cards: PhonemeCard[];
  private validator: PhonicsValidator;
  
  constructor() {
    this.slots = [];
    this.cards = [];
    this.validator = new PhonicsValidator();
  }
}

// ❌ BAD: Глубокая иерархия наследования
class BaseBuilder { }
class AbstractPhonemeBuilder extends BaseBuilder { }
class PhonemeBuilder extends AbstractPhonemeBuilder { }
```

### Immutability

```typescript
// ✅ GOOD: Иммутабельные обновления
class SessionStore {
  private state: SessionState;
  
  addPhoneme(phoneme: string): void {
    this.state = {
      ...this.state,
      selectedPhonemes: [...this.state.selectedPhonemes, phoneme]
    };
    this.notify();
  }
}

// ❌ BAD: Мутация состояния
class SessionStore {
  addPhoneme(phoneme: string): void {
    this.state.selectedPhonemes.push(phoneme); // Мутация!
    this.notify();
  }
}
```

---

## Performance Considerations

### Event Delegation

```typescript
// ✅ GOOD: Один обработчик на родителе
class PhonemeGrid {
  private attachEventListeners(): void {
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.phoneme-card');
      
      if (card) {
        const phoneme = card.dataset.phoneme!;
        this.handleClick(phoneme);
      }
    });
  }
}

// ❌ BAD: Обработчик на каждой карточке
class PhonemeGrid {
  private attachEventListeners(): void {
    this.cards.forEach(card => {
      card.element.addEventListener('click', () => {
        this.handleClick(card.phoneme);
      });
    });
  }
}
```

### Debouncing & Throttling

```typescript
// Утилиты в shared/lib/utils.ts
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

---

## Заключение

Эта архитектура обеспечивает:

✅ **Масштабируемость** - легко добавлять новые функции  
✅ **Поддерживаемость** - чёткое разделение ответственностей  
✅ **Тестируемость** - каждый модуль изолирован  
✅ **Производительность** - минимальный оверхед  
✅ **Типобезопасность** - TypeScript + Zod  

---

**Следующие шаги**: [API Documentation](./API.md)
