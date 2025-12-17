# 🎮 English Trainers

**Interactive grammar practice** with game-based learning, adaptive difficulty, and instant feedback.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://andreacebotarev-svg.github.io/english-trainers/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/andreacebotarev-svg/english-trainers.git

# Open in browser (no build step required)
open index.html
```

**Live demo:** [https://andreacebotarev-svg.github.io/english-trainers/](https://andreacebotarev-svg.github.io/english-trainers/)

---

## 🎯 Available Trainers

### 🔵 To Be Trainer
- **Focus:** am/is/are forms
- **Difficulty:** 3 levels (easy/medium/hard)
- **Templates:** 15+ sentence patterns
- **Features:** Weighted pronoun randomization, context-aware feedback

### 🟢 Present Simple Trainer
- **Focus:** Subject-verb agreement, do/does
- **Verbs:** 18 irregular verbs (go/goes, have/has, study/studies)
- **Forms:** Positive, negative, question
- **Features:** Third-person singular rules, automatic difficulty scaling

### 🟣 Have/Have Got Trainer
- **Focus:** British vs American possession forms
- **Vocabulary:** 45+ items (family, pets, objects, abilities)
- **Structures:** Both "have got" and "have" with do/does
- **Features:** Dual-form support, semantic categorization

---

## 🏛️ Architecture

### Design Patterns

#### 1. **Template Method Pattern**
```javascript
class Trainer {
  // Abstract method (must override)
  generateQuestion() {
    throw new Error('Implement in child class');
  }
  
  // Concrete methods (inherited)
  start() { /* ... */ }
  submitAnswer(index) { /* ... */ }
}

class ToBeTrainer extends Trainer {
  generateQuestion() {
    // Custom implementation
  }
}
```

#### 2. **State Machine**
```
IDLE → PLAYING → FEEDBACK → GAME_OVER
           ↑           ↓
           ←───────────┘
```

#### 3. **Observer Pattern**
```javascript
trainer.on('answer', ({ isCorrect }) => {
  // React to events
});

trainer.emit('answer', data);
```

#### 4. **Dependency Injection**
```javascript
const trainer = new ToBeTrainer({
  maxLives: 3,
  streakBonus: 10,
  timerMode: false
});
```

---

## 📁 Project Structure

```
english-trainers/
├── index.html                  # Hub page with trainer cards
├── to-be.html                  # To Be trainer page
├── present-simple.html         # Present Simple trainer page
├── have-got.html               # Have/Have Got trainer page
├── assets/
│   ├── css/
│   │   ├── core.css            # Variables, reset, typography
│   │   ├── components.css      # Buttons, cards, progress bars
│   │   └── trainers.css        # Trainer-specific layouts
│   └── js/
│       ├── trainer-base.js     # Abstract Trainer class (state machine)
│       └── modules/
│           ├── to-be.js           # ToBeTrainer implementation
│           ├── present-simple.js  # PresentSimpleTrainer
│           └── have-got.js        # HaveGotTrainer
└── README.md
```

---

## 🔧 Adding a New Trainer

### Step 1: Create Module

```javascript
// assets/js/modules/your-trainer.js
class YourTrainer extends Trainer {
  constructor(config = {}) {
    super({
      name: 'Your Trainer',
      maxLives: 3,
      ...config
    });
    
    // Your data structures
    this.questions = [...];
  }
  
  // REQUIRED: Implement question generation
  generateQuestion() {
    return {
      question: 'Your question text',
      options: ['Option 1', 'Option 2', 'Option 3'],
      correctIndex: 0,
      metadata: { /* custom data */ }
    };
  }
  
  // OPTIONAL: Override feedback
  getFeedback(isCorrect) {
    return isCorrect ? 'Correct! 🎯' : 'Wrong. Try again!';
  }
}
```

### Step 2: Create HTML Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Trainer | English Trainers</title>
  <link rel="stylesheet" href="assets/css/core.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/trainers.css">
</head>
<body>
  <!-- Stats bar with #score, #streak, #lives -->
  <!-- Main container with #question-container -->
  
  <script src="assets/js/trainer-base.js"></script>
  <script src="assets/js/modules/your-trainer.js"></script>
  <script>
    window.trainer = new YourTrainer();
    trainer.init();
  </script>
</body>
</html>
```

### Step 3: Add to Hub

Edit `index.html` and add a card:

```html
<a href="your-trainer.html" class="trainer-card">
  <span class="trainer-icon">🔴</span>
  <h2>Your Trainer</h2>
  <p>Description here</p>
  <div class="trainer-stats">
    <!-- Stats -->
  </div>
</a>
```

---

## ⚡ Performance Optimizations

### 1. **RAF Batching**
DOM updates grouped into single animation frame:
```javascript
_scheduleUpdate(component) {
  this._pendingUpdates.add(component);
  if (!this._rafHandle) {
    this._rafHandle = requestAnimationFrame(() => {
      this._flushUpdates();
    });
  }
}
```

### 2. **Lazy DOM Cache**
```javascript
_cacheDOMElements() {
  this._dom = {
    questionContainer: document.getElementById('question-container'),
    score: document.getElementById('score'),
    // ... cached once on init
  };
}
```

### 3. **Debounced Resize**
```javascript
_handleResize() {
  clearTimeout(this._resizeDebounce);
  this._resizeDebounce = setTimeout(() => {
    this.emit('resize');
  }, 150);
}
```

### 4. **Recency Filters**
Avoid question repeats with LRU cache:
```javascript
this._recentPronouns = ['he', 'she', 'it'];
const available = pronouns.filter(p => !this._recentPronouns.includes(p));
```

---

## 🎨 Features

✅ **Adaptive Difficulty** — Auto-scales based on performance  
✅ **Weighted Randomization** — Prevents monotonous patterns  
✅ **Streak System** — Bonus points at 5/10/15/20 combos  
✅ **Lives System** — 3 hearts, game over on 0  
✅ **Event System** — Hook into game lifecycle  
✅ **State Machine** — Immutable state updates  
✅ **Grammar Tips** — Context-aware feedback  
✅ **Accessibility** — ARIA labels, semantic HTML  
✅ **Responsive** — Mobile-first design  

---

## 🛠️ Tech Stack

- **Vanilla JS** — No frameworks, zero dependencies
- **ES6 Classes** — OOP with inheritance
- **CSS Variables** — Theming system
- **CSS Grid/Flexbox** — Modern layouts
- **RAF API** — 60fps animations

---

## 📝 License

MIT © [andreacebotarev-svg](https://github.com/andreacebotarev-svg)

---

## 🤝 Contributing

PRs welcome! To add a new trainer:

1. Fork the repo
2. Create module in `assets/js/modules/`
3. Follow the pattern in existing trainers
4. Test on mobile + desktop
5. Submit PR with demo GIF

---

## 💬 Contact

Questions? Open an [issue](https://github.com/andreacebotarev-svg/english-trainers/issues) or reach out!
