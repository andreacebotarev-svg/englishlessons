# 🎮 English Trainers

**Interactive grammar practice** with game-based learning, adaptive difficulty, and professional haptic feedback.

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
- **Effects:** Aurora particles, adaptive haptics, milestone celebrations

### 🟢 Present Simple Trainer
- **Focus:** Subject-verb agreement with do/does
- **Verbs:** 18 irregular verbs (go→goes, have→has, study→studies)
- **Forms:** Positive, negative, question
- **Difficulty:** Auto-scaling (easy→medium→hard based on 75%/85% accuracy)
- **Effects:** Northern lights particles, streak-aware haptics

### 🟣 Have/Have Got Trainer
- **Focus:** British possession forms (have got/has got)
- **Vocabulary:** 45+ items (family, pets, objects, abilities)
- **Structures:** Both "have got" and "have" with do/does
- **Features:** Negative forms (haven't/hasn't), questions
- **Effects:** Canvas glow animations, professional haptic patterns

---

## ✨ Visual & Haptic System

### 🌌 Aurora Effect (Canvas-based)
Replaces static green flash with **northern lights particles**:

```javascript
// Dynamic particle system
- 30 particles (20 on mobile) with random colors
- Cyan/blue/purple/green color palette  
- Glow effect via ctx.shadowBlur = 15
- Wave trails for depth
- Auto-cleanup after 1.5s
- 60fps RAF animation loop
```

### 📳 Haptic Feedback (Android-grade)
**Material Design 3 compliant** vibration patterns:

```javascript
// Streak-aware feedback
streak >= 10 → milestone  [30,50,30,50,30,50]ms  // 🏆 Triple celebration
streak 5-9   → streak     [20,30,20,30,20]ms     // 🔥 Double-tap power
streak 3-4   → impact     [50]ms                 // ⚡ Medium buzz
streak 1-2   → success    [30]ms                 // ✅ Light tap
error        → error      [100]ms                // ❌ Heavy fail state
```

**Platform optimization:**
- **Android:** Full multi-tap pattern support
- **iOS:** Single pulse (iOS API limitation, sums duration)
- **Windows Phone:** Single vibration fallback

**Features:**
- Debouncing (50ms min interval)
- Intensity scaling (0.5-1.5x multiplier)
- Background prevention (`visibilityState` check)
- Device capability detection
- 13 predefined patterns + custom builder

### 🎊 Milestone Effects
- **Streak ≥3:** Aurora + particle burst (layered)
- **Streak 5/10/15/20:** Aurora + confetti explosion + extra haptic
- **Audio:** `correct.mp3` / `milestone.mp3` / `error.mp3`

---

## 🏛️ Architecture

### Core Design Patterns

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

#### 3. Effects Orchestrator
```javascript
class EffectsManager {
  constructor() {
    this._aurora = new AuroraEffect();           // Visual
    this._audio = new AudioEffectsManager();     // Sound
    this._haptic = new HapticFeedback();         // Vibration
  }
  
  triggerSuccessEffects(streak, container) {
    this._aurora.trigger(container);
    this._triggerSuccessHaptic(streak);          // Adaptive intensity
    if (streak >= 5) this._audio.play('milestone');
  }
}
```

#### 4. Haptic Engine
```javascript
class HapticFeedback {
  _detectCapabilities() {
    return {
      platform: 'android',                       // Auto-detect
      supported: 'vibrate' in navigator,
      hasHapticEngine: true
    };
  }
  
  _optimizeForPlatform(pattern) {
    if (platform === 'ios') {
      return [pattern.reduce((sum, val) => sum + val)]; // Single pulse
    }
    return pattern;                               // Multi-tap on Android
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
│   ├── js/
│   │   ├── effects/
│   │   │   ├── AuroraEffect.js         # Canvas particle system ⭐
│   │   │   ├── HapticFeedback.js       # Android-grade haptics ⭐
│   │   │   ├── EffectsManager.js       # Effect orchestrator
│   │   │   └── AudioEffectsManager.js  # Sound system
│   │   ├── generators/
│   │   │   ├── present-simple/         # PS question generators
│   │   │   └── have-got/               # HG question generators
│   │   ├── modules/
│   │   │   ├── to-be.js                # ToBeTrainer class
│   │   │   ├── present-simple.js       # PresentSimpleTrainer
│   │   │   └── have-got.js             # HaveGotTrainer
│   │   ├── trainer-core.js             # Base Trainer class
│   │   ├── trainer-ui.js               # DOM rendering (RAF-batched)
│   │   ├── trainer-timer-tts.js        # Timer + Text-to-Speech
│   │   └── trainer-dom-events-utils.js # Event system
│   └── audio/
│       ├── correct.mp3                 # Success sound
│       ├── milestone.mp3               # Streak celebration
│       └── error.mp3                   # Wrong answer
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
  <link rel="stylesheet" href="assets/css/effects.css">
</head>
<body>
  <div id="question-container"></div>
  
  <!-- Load effects first (dependency order) -->
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
    window.trainer = new YourTrainer({
      hapticIntensity: 1.2  // Optional: boost haptics
    });
    trainer.init();
    
    // Load audio
    trainer._effects.loadAudioAssets({
      correct: 'assets/audio/correct.mp3',
      milestone: 'assets/audio/milestone.mp3',
      error: 'assets/audio/error.mp3'
    });
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

### 5. Haptic Debouncing
```javascript
if ((Date.now() - this._lastVibration) < 50) return; // Skip rapid calls
```

---

## 🎨 Features

✅ **Aurora Effects** — Northern lights particles on correct answers  
✅ **Android-grade Haptics** — Material Design 3 vibration patterns  
✅ **Streak-aware Feedback** — Dynamic intensity (light→impact→celebration)  
✅ **Platform Detection** — iOS/Android/Windows optimization  
✅ **Adaptive Difficulty** — Auto-scales based on 75%/85% accuracy thresholds  
✅ **Lives System** — 3 hearts, game over on 0  
✅ **Timer Challenges** — Optional 10s/15s/30s time limits  
✅ **Audio Feedback** — Correct/milestone/error sounds  
✅ **Confetti Celebrations** — Milestone explosions (5/10/15/20 streaks)  
✅ **Grammar Tips** — Context-aware explanations  
✅ **Accessibility** — ARIA labels, semantic HTML  
✅ **Responsive** — Mobile-first design (480px breakpoint)  
✅ **Zero Dependencies** — Pure vanilla JS  
✅ **Memory-safe** — Automatic cleanup, no leaks  

---

## 🛠️ Tech Stack

- **Vanilla JS (ES6+)** — Classes, arrow functions, destructuring
- **Canvas API** — Aurora particle rendering with shadowBlur
- **Vibration API** — Material Design 3 haptic patterns
- **Web Audio API** — Sound effects with preloading
- **CSS Variables** — Dynamic theming
- **CSS Grid/Flexbox** — Responsive layouts
- **RequestAnimationFrame** — 60fps animations
- **WeakSet/WeakMap** — Memory-efficient DOM tracking

---

## 📝 Recent Updates

### v2.2.0 (Dec 2025)
- 🎮 **Professional Haptics** — Android-grade patterns with platform detection
- 📳 Streak-aware vibration intensity (light→impact→milestone)
- 🔧 Debouncing (50ms) + intensity scaling (0.5-1.5x)
- 🎯 13 predefined patterns + custom builder API
- 🔊 Error sound integration (`error.mp3` on mistakes)
- 🐛 iOS optimization (single pulse instead of multi-tap)

### v2.1.0 (Dec 2025)
- ✨ **Aurora Effect System** — Canvas-based northern lights particles
- 🎨 Replaced green flash with dynamic glow animations
- 📱 Mobile optimization (20 particles vs 30 desktop)
- 🧹 Auto-cleanup after 1.5s to prevent memory leaks

### v2.0.0 (Nov 2025)
- 🎮 Modular effects system (Audio/Haptic/Visual)
- 🏗️ Refactored generators into separate files
- ⚡ RAF batching for DOM updates
- 🎯 Auto-difficulty scaling for Present Simple

---

## 🧪 Testing & Debugging

### Haptic Testing
```javascript
// In browser console (requires mobile device or emulator)
trainer._effects.testHaptics();  // Cycles through all patterns

// Check capabilities
trainer._effects.getHapticInfo();
/* Returns:
{
  enabled: true,
  capabilities: { platform: 'android', supported: true, hasHapticEngine: true },
  patterns: ['light', 'success', 'error', 'milestone', ...],
  intensityScale: 1.0
}
*/

// Manual pattern test
trainer._effects._haptic.vibrate('milestone'); // Triple-tap
trainer._effects._haptic.vibrate([50, 30, 50]); // Custom pattern
```

### Aurora Effect Testing
```javascript
// Trigger on any element
const btn = document.querySelector('.option');
new AuroraEffect().trigger(btn);

// Check canvas creation
$0.querySelector('canvas'); // Should exist during animation
```

### Debug Hooks
```javascript
// Enable debug logging
window.debugEffects = (event, data) => {
  console.log(`[Effects] ${event}`, data);
};

// Events logged:
// - haptic_init, haptic, haptic_debounced
// - aurora_particles, confetti, particles
// - motivational, audio_played
```

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
   - Demo GIF/video showing effects
   - Grammar focus description
   - Question count estimate
   - Haptic test results on real device

**Development tips:**
- Load `AuroraEffect.js` before `EffectsManager.js`
- Use `window.debugEffects` for event logging
- Test haptics on real Android device (not emulator)
- Verify particle count on mobile (Chrome DevTools device mode)
- Check memory leaks with Chrome Performance profiler

---

## 📧 Contact

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

---

## 🙏 Acknowledgments

- **Material Design 3** — Haptic pattern timings
- **Canvas API** — Particle rendering inspiration
- **Android Vibrator** — Pattern design reference
