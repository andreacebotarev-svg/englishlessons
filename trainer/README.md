# English Lessons Trainer 🎯

> **Pure Vanilla JavaScript** - No build tools, no Node.js required!

## ✨ Features

- ✅ **Zero dependencies** - Just HTML, CSS, and JavaScript
- ✅ **ES Modules** - Modern modular architecture
- ✅ **Instant deployment** - Just `git push`
- ✅ **Mobile friendly** - Touch-optimized UI
- ✅ **Audio support** - Web Speech API for pronunciation
- ✅ **Progressive enhancement** - Works everywhere

## 📁 Project Structure

```
trainer/
├── index.html              # Entry point
├── app.js                  # Main app initialization
├── styles.css              # Global styles
├── components/             # UI Components (ES Modules)
│   ├── App.js
│   ├── GameBoard.js
│   ├── WordCard.js
│   ├── Slots.js
│   ├── Keyboard.js
│   └── ProgressBar.js
├── store/                  # State management
│   └── gameState.js
├── utils/                  # Utilities
│   ├── lessonLoader.js
│   ├── audioManager.js
│   └── helpers.js
└── public/data/            # Lesson JSON files
    └── lesson_01.json
```

## 🚀 How It Works

### ES Modules = Browser Handles Imports

No build step needed! Browser automatically:

1. Loads `index.html`
2. Sees `<script type="module" src="app.js">`
3. Loads `app.js` and all its imports
4. Loads nested imports automatically

### Example Module Flow

```
index.html
   ↓
app.js (imports App.js, gameState.js, lessonLoader.js)
   ↓
App.js (imports GameBoard.js, ProgressBar.js)
   ↓
GameBoard.js (imports WordCard.js, Slots.js, Keyboard.js)
```

Browser loads everything automatically!

## 💻 Local Development

### Option 1: VS Code Live Server (Recommended)

1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"
3. Done! Opens at http://localhost:5500

### Option 2: Python HTTP Server

```bash
cd trainer
python -m http.server 8000
# Open http://localhost:8000
```

### Option 3: Node.js HTTP Server (if installed)

```bash
cd trainer
npx serve
```

### Option 4: Just open the file

Some browsers block ES Modules from `file://` - use one of above methods.

## 🌐 Deployment to GitHub Pages

### Setup (once)

1. Go to: https://github.com/andreacebotarev-svg/englishlessons/settings/pages
2. Configure:
   - **Source**: Deploy from a branch
   - **Branch**: `refactor/vanilla-js` (or `main` after merge)
   - **Folder**: `/trainer`
3. Save

### Every Update

```bash
# Make changes to any file
git add trainer/
git commit -m "update: description"
git push

# Wait 30 seconds, refresh page!
```

**That's it!** No build, no npm, just push.

## 📦 Adding New Lessons

1. Create `public/data/lesson_XX.json`:

```json
{
  "id": "lesson_02",
  "title": "Lesson 2: Short I [i]",
  "description": "Closed syllable with vowel I",
  "order": 2,
  "words": [
    {
      "id": "sit",
      "text": "sit",
      "transcription": "[sɪt]",
      "translation": "сидеть",
      "phonemes": ["s", "i", "t"],
      "image": "🧘",
      "difficulty": 1,
      "tags": ["cvc", "action"]
    }
  ]
}
```

2. Update `app.js` to load new lesson
3. Push to GitHub

## 🎯 Architecture Highlights

### Modular Components

Each component is a **pure function** that returns HTML string:

```javascript
// components/WordCard.js
export function WordCard(word) {
    return `<div class="visual-cue">${word.image}</div>`;
}
```

### Simple State Management

```javascript
// store/gameState.js
export const gameState = {
    currentLesson: null,
    score: 0,
    
    setLesson(lesson) {
        this.currentLesson = lesson;
        this.render(); // Re-render app
    },
    
    render() {
        renderApp(); // Full re-render
    }
};
```

### No Virtual DOM

Full re-render on state change. Fast enough for this app!

## ✅ Browser Support

- ✅ Chrome/Edge 61+ (2017)
- ✅ Firefox 60+ (2018)
- ✅ Safari 11+ (2017)
- ✅ Mobile browsers (iOS Safari 11+, Chrome Mobile)

**ES Modules** supported everywhere modern!

## 🔧 Troubleshooting

### "CORS error" when opening file://

**Solution**: Use local server (see Local Development above)

### "Failed to load lesson"

**Check**:
1. File exists at `public/data/lesson_01.json`
2. JSON is valid (use jsonlint.com)
3. Path is correct in `lessonLoader.js`

### "Module not found"

**Check**:
1. File extensions: `.js` required in imports
2. Paths are relative: `./utils/helpers.js`
3. Export/import names match

## 🎉 Benefits Over React Version

| Feature | React | Vanilla JS |
|---------|-------|------------|
| **Build required** | ✅ Yes | ❌ No |
| **Node.js required** | ✅ Yes | ❌ No |
| **Deploy speed** | 2-3 min | 10 sec |
| **File size** | ~200KB | ~20KB |
| **Learning curve** | High | Low |
| **Debuggable** | Medium | Easy |
| **Modular** | ✅ Yes | ✅ Yes |

## 📚 Resources

- [ES Modules Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Feature-Sliced Design](https://feature-sliced.design/)

## 🆘 License

MIT
