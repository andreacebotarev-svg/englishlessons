# 🎮 English Trainers

**Interactive grammar practice** with game-based learning, adaptive difficulty, and visual feedback.

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
- **Focus:** am/is/are forms with 5 question types
- **Difficulty:** Manual control (0/Easy/Medium/Hard) + Auto mode
- **Timer:** Optional 10s/15s/30s challenges
- **Features:** Pronoun agreement, contractions, question transformations
- **Effects:** Aurora particles on correct answers, confetti on streaks

### 🟢 Present Simple Trainer
- **Focus:** Subject-verb agreement with do/does
- **Verbs:** 18 irregular verbs (go→goes, have→has, study→studies)
- **Forms:** Positive, negative, question
- **Difficulty:** Auto-scaling (easy→medium→hard based on 75%/85% accuracy)
- **Effects:** Northern lights particles + streak combos

### 🟣 Have/Have Got Trainer
- **Focus:** British possession forms (have got/has got)
- **Vocabulary:** 45+ items (family, pets, objects, abilities)
- **Structures:** Both "have got" and "have" with do/does
- **Features:** Negative forms (haven't/hasn't), questions
- **Effects:** Canvas-based glow animations

---

## 🎨 Visual Effects System

### Aurora Effect (NEW)
Replaces static green flash with **northern lights particles**:

```javascript
// Canvas-based particle system
- 30 particles (20 on mobile) with random colors
- Cyan/blue/purple/green color palette
- Glow effect via ctx.shadowBlur = 15
- Wave trails for depth
- Auto-cleanup after 1.5s
```

**Implementation:**
```javascript
class AuroraEffect {
  trigger(element) {
    this._createCanvas(element);
    this._generateParticles(); // 30 particles with random velocity
    this._animate();           // RAF loop with glow rendering
  }
}
```

### Milestone Effects
- **Streak ≥3:** Aurora + particle burst (layered)
- **Streak 5/10/15/20:** Aurora + confetti explosion
- **Mobile optimized:** Reduced particle count (20 vs 30)

---

## 🏛️ Architecture

### Core Patterns

#### 1. Template Method Pattern
```javascript
class Trainer {
  generateQuestion() { throw new Error('Implement in child'); }
  start() { /* inherited */ }
  submitAnswer(index) { /* inherited */ }
}

class PresentSimpleTrainer extends Trainer {
  generateQuestion() {
    return { question: '...', options: [...], correctIndex: 0 };
  }
}
```

#### 2. State Machine
```
IDLE → PLAYING → FEEDBACK → GAME_OVER
         ↑           ↓
         ←───────────┘
```

#### 3. Effects Manager
```javascript
class EffectsManager {
  constructor() {
    this._aurora = new AuroraEffect();
    this._audio = new AudioEffectsManager();
    this._haptic = new HapticFeedback();
  }
  
  triggerSuccessEffects(streak, container) {
    this._aurora.trigger(container);           // Visual
    if (streak >= 5) this._audio.play('milestone');
    if ([5,10,15,20].includes(streak)) this.launchConfetti();
  }
}
```

---

## 📁 Project Structure

```
english-trainers/
├── index.html                  # Hub page with trainer cards
├── to-be.html                  # To Be trainer
├── present-simple.html         # Present Simple trainer
├── have-got.html               # Have Got trainer
├── assets/
│   ├── css/
│   │   ├── core.css            # CSS variables, reset
│   │   ├── components.css      # Buttons, cards, stats
│   │   ├── trainers.css        # Trainer layouts
│   │   └── effects.css         # Confetti, particles, animations
│   └── js/
│       ├── effects/
│       │   ├── AuroraEffect.js         # Canvas particle system ⭐ NEW
│       │   ├── EffectsManager.js       # Effect orchestrator
│       │   ├── AudioEffectsManager.js  # Sound system
│       │   └── HapticFeedback.js       # Vibration API
│       ├── generators/
│       │   ├── present-simple/         # PS question generators
│       │   └── have-got/               # HG question generators
│       ├── modules/
│       │   ├── to-be.js                # ToBeTrainer class
│       │   ├── present-simple.js       # PresentSimpleTrainer
│       │   └── have-got.js             # HaveGotTrainer
│       ├── trainer-core.js             # Base Trainer class
│       ├── trainer-ui.js               # DOM rendering
│       ├── trainer-timer-tts.js        # Timer + TTS
│       └── trainer-dom-events-utils.js # Event system
└── README.md
```

---

## 🔧 Adding a New Trainer

### Step 1: Create Module
```javascript
// assets/js/modules/your-trainer.js
class YourTrainer extends Trainer {
  constructor(config = {}) {
    super({ name: 'Your Trainer', maxLives: 3, ...config });
    this.data = [...];
  }
  
  generateQuestion() {
    return {
      question: 'Your question text',
      options: ['A', 'B', 'C'],
      correctIndex: 1,
      metadata: { hint: 'Grammar rule here' }
    };
  }
}
```

### Step 2: Create HTML Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Your Trainer | English Trainers</title>
  <link rel="stylesheet" href="assets/css/core.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/trainers.css">
</head>
<body>
  <div id="question-container"></div>
  
  <!-- Load effects first -->
  <script src="assets/js/effects/AuroraEffect.js"></script>
  <script src="assets/js/effects/AudioEffectsManager.js"></script>
  <script src="assets/js/effects/HapticFeedback.js"></script>
  <script src="assets/js/effects/EffectsManager.js"></script>
  
  <!-- Load trainer core -->
  <script src="assets/js/trainer-core.js"></script>
  <script src="assets/js/trainer-ui.js"></script>
  <script src="assets/js/trainer-timer-tts.js"></script>
  <script src="assets/js/trainer-dom-events-utils.js"></script>
  
  <!-- Load your module -->
  <script src="assets/js/modules/your-trainer.js"></script>
  
  <script>
    window.trainer = new YourTrainer();
    trainer.init();
  </script>
</body>
</html>
```

### Step 3: Add to Hub
Edit `index.html`:
```html
<a href="your-trainer.html" class="trainer-card">
  <span class="trainer-icon">🔴</span>
  <h2>Your Trainer</h2>
  <p>Grammar focus description</p>
</a>
```

---

## ⚡ Performance Optimizations

### 1. RAF Batching
DOM updates grouped into single frame:
```javascript
_scheduleUpdate(component) {
  this._pendingUpdates.add(component);
  if (!this._rafHandle) {
    this._rafHandle = requestAnimationFrame(() => this._flushUpdates());
  }
}
```

### 2. Lazy DOM Cache
```javascript
_cacheDOMElements() {
  this._dom = {
    score: document.getElementById('score'),
    lives: document.getElementById('lives')
  }; // Cached once on init
}
```

### 3. Mobile Particle Reduction
```javascript
const count = window.matchMedia('(max-width: 768px)').matches ? 20 : 30;
```

### 4. Memory-Safe Cleanup
```javascript
_destroy() {
  if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  if (this.canvas) this.canvas.remove();
  this.particles = [];
}
```

---

## 🎨 Features

✅ **Aurora Effects** — Northern lights particles on correct answers  
✅ **Adaptive Difficulty** — Auto-scales based on 75%/85% accuracy thresholds  
✅ **Streak System** — Bonus points at 5/10/15/20 combos with confetti  
✅ **Lives System** — 3 hearts, game over on 0  
✅ **Timer Challenges** — Optional 10s/15s/30s time limits  
✅ **Audio Feedback** — Correct/milestone/error sounds  
✅ **Haptic Feedback** — Vibration on mobile devices  
✅ **Grammar Tips** — Context-aware explanations  
✅ **Accessibility** — ARIA labels, semantic HTML  
✅ **Responsive** — Mobile-first design (480px breakpoint)  
✅ **Zero Dependencies** — Pure vanilla JS  

---

## 🛠️ Tech Stack

- **Vanilla JS (ES6+)** — Classes, arrow functions, destructuring
- **Canvas API** — Aurora particle rendering
- **Web Audio API** — Sound effects
- **Vibration API** — Haptic feedback
- **CSS Variables** — Dynamic theming
- **CSS Grid/Flexbox** — Responsive layouts
- **RequestAnimationFrame** — 60fps animations
- **WeakSet/WeakMap** — Memory-efficient tracking

---

## 📝 Recent Updates

### v2.1.0 (Dec 2025)
- ✨ **Aurora Effect System** — Canvas-based northern lights particles
- 🎨 Replaced green flash with dynamic glow animations
- 📱 Mobile optimization (20 particles vs 30 desktop)
- 🧹 Auto-cleanup after 1.5s to prevent memory leaks
- 🔊 Enhanced audio feedback on milestones

### v2.0.0 (Nov 2025)
- 🎮 Modular effects system (Audio/Haptic/Visual)
- 🏗️ Refactored generators into separate files
- ⚡ RAF batching for DOM updates
- 🎯 Auto-difficulty scaling for Present Simple

---

## 📝 License

MIT © [andreacebotarev-svg](https://github.com/andreacebotarev-svg)

---

## 🤝 Contributing

PRs welcome! To add a new trainer:

1. Fork the repo
2. Create module in `assets/js/modules/`
3. Follow existing trainer patterns
4. Test on mobile + desktop
5. Submit PR with:
   - Demo GIF/video
   - Grammar focus description
   - Question count estimate

**Development tips:**
- Load `AuroraEffect.js` before `EffectsManager.js`
- Use `window.debugEffects` for event logging
- Test particle count on mobile (use Chrome DevTools device mode)

---

## 💬 Contact

- **Issues:** [GitHub Issues](https://github.com/andreacebotarev-svg/english-trainers/issues)
- **Email:** andreacebotarev@gmail.com
- **Live Demo:** [https://andreacebotarev-svg.github.io/english-trainers/](https://andreacebotarev-svg.github.io/english-trainers/)

---

## 🎓 Educational Use

Free for:
- Personal learning
- Classroom teaching
- Educational institutions
- Open-source projects

Commercial use requires attribution.
