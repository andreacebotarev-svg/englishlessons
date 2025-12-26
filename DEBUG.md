# 🐛 Popup Debugger Documentation

**Location:** `dist/assets/js/lesson-engine.js`  
**Namespace:** `window.debugPopup`  
**Purpose:** Console-only debugging tools for word popup positioning and visibility issues.

---

## Overview

The popup debugger provides **three console commands** to diagnose why a word popup might be invisible, off-screen, or improperly styled.

### Key Features
- **Zero visual impact** until manually invoked in console
- Inspects computed CSS, bounding box, viewport position
- Highlights popups for visibility testing
- Provides interactive debug panel with live controls

---

## Commands

### 1. `debugPopup.inspect(word)`

**Purpose:** Print comprehensive diagnostic info about the popup.

**Usage:**
```javascript
// 1. Click on a word in the reading text to create popup
// 2. In DevTools console:
debugPopup.inspect('government')
```

**Output Example:**
```
🐛 POPUP INSPECT
  Word: government
  Computed styles: {
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    position: 'fixed',
    zIndex: '10000',
    top: '150px',
    left: '200px',
    width: '280px',
    height: '172px',
    background: 'rgb(255, 255, 255)',
    color: 'rgb(26, 26, 26)'
  }
  Bounding box: {
    top: 150,
    left: 200,
    bottom: 322,
    right: 480,
    inViewport: true  // ✅ Popup is visible
  }
  No overflow clipping detected.
```

**What to check:**
- `inViewport: false` → Popup is off-screen (position bug)
- `opacity: '0'` or `display: 'none'` → Hidden by CSS
- `Overflow ancestors` warning → Parent container clips popup
- `position: 'absolute'` instead of `'fixed'` → Wrong positioning mode

---

### 2. `debugPopup.highlight(word)`

**Purpose:** Visually mark the popup with red outline and background.

**Usage:**
```javascript
// After clicking a word:
debugPopup.highlight('government')
```

**Effect:**
- Adds 4px red outline
- Sets semi-transparent red background
- Elevates z-index to 999999

**Use case:**  
If popup exists in DOM but you can't see it, highlighting reveals whether it's:
- Behind another element (z-index issue)
- Outside viewport (positioning issue)
- Actually deleted (lifecycle bug)

---

### 3. `debugPopup.panel(word)`

**Purpose:** Show interactive debug panel in top-right corner.

**Usage:**
```javascript
debugPopup.panel('government')
```

**Features:**

**Info Display:**
- Word, position (top/left), size, z-index, visibility state

**Action Buttons:**

1. **📍 Move popup to center**  
   Forces popup to screen center:
   ```css
   top: 50%; left: 50%; transform: translate(-50%, -50%);
   ```
   If popup appears after this → original position calculation is broken.

2. **🔴 Paint popup red**  
   Makes popup bright red with yellow border + z-index boost.  
   If still invisible → CSS display/visibility issue.

3. **✕ Close panel**  
   Removes debug panel.

---

## Common Issues & Solutions

### Issue 1: Popup is off-screen (`inViewport: false`)

**Symptoms:**
```javascript
debugPopup.inspect('word')
// top: 3093px, inViewport: false
```

**Cause:** `window.scrollY` added to `position: fixed` element (double-offset bug).

**Solution:**  
Remove `window.scrollY` from position calculation in `showWordPopup()`:  
```javascript
// WRONG:
top = rect.top + window.scrollY - height;

// CORRECT:
top = rect.top - height;  // position:fixed is viewport-relative
```

---

### Issue 2: Text is invisible (color contrast)

**Symptoms:**  
Popup exists, `inViewport: true`, but text unreadable.

**Check:**
```javascript
debugPopup.inspect('word')
// color: 'rgb(255, 255, 255)'  ← white text on white background!
```

**Solution:**  
Force text colors in CSS with `!important`:
```css
.word-popup-word {
  color: #1a1a1a !important;
}
.word-popup-translation {
  color: #1a1a1a !important;
}
```

---

### Issue 3: Popup hidden behind other elements

**Symptoms:**  
`inViewport: true`, but clicking "Move popup to center" makes it visible.

**Check:**
```javascript
debugPopup.inspect('word')
// zIndex: '10000'
```

Compare with other elements' z-index. If another element has `z-index: 100000`, popup is behind it.

**Solution:**  
Increase popup z-index or remove conflicting elements.

---

### Issue 4: Overflow clipping

**Symptoms:**
```javascript
🚨 Overflow ancestors: [
  { tag: 'DIV', className: 'app-main', overflow: 'hidden' }
]
```

**Cause:**  
Parent container with `overflow: hidden` clips the popup.

**Solution:**  
Move popup to `<body>` (already done in current code):  
```javascript
document.body.appendChild(popup);  // Not inside .app-main
```

---

## Architecture Notes

### Why `position: fixed` (not `absolute`)?

**Fixed:**
- Positioned relative to **viewport**
- `getBoundingClientRect()` coords used directly
- No `window.scrollY` needed
- Popup stays in same screen position when scrolling

**Absolute:**
- Positioned relative to **nearest positioned ancestor**
- Need `rect.top + window.scrollY` for correct placement
- Popup scrolls with page content

### Debugging Workflow

1. **Click word** → popup should appear
2. If invisible:
   ```javascript
   debugPopup.inspect('word')  // Check stats
   ```
3. Check `inViewport` and `position`:
   - `false` → positioning bug
   - `fixed` but wrong coords → remove scrollY
   - `absolute` → maybe intentional?
4. Try visual tests:
   ```javascript
   debugPopup.highlight('word')  // See if it exists
   debugPopup.panel('word')      // Interactive tools
   ```
5. Fix code, hard refresh (Ctrl+Shift+R), re-test.

---

## Example Session

```javascript
// User clicks "government", popup doesn't appear

debugPopup.inspect('government')
// Output:
// Bounding box: { top: 3200, inViewport: false }
// Computed styles: { position: 'fixed', top: '3200px' }

// ❌ Bug confirmed: popup is 3200px below screen

debugPopup.panel('government')
// Click "Move popup to center" → popup appears!

// ✅ Conclusion: position calculation is broken
// Fix: Remove window.scrollY from showWordPopup()
```

---

## Code Location

**File:** `dist/assets/js/lesson-engine.js`  
**Lines:** ~190-360

**Entry point (constructor):**
```javascript
window.debugPopup = {
  inspect: (word) => this.debugInspectPopup(word),
  highlight: (word) => this.debugHighlightPopup(word),
  panel: (word) => this.debugPanel(word)
};
```

**Methods:**
- `debugInspectPopup(word)` → console diagnostics
- `debugHighlightPopup(word)` → visual highlighting
- `debugPanel(word)` → interactive UI panel

---

## Changelog

**2025-12-17:**
- Created debugger system
- Fixed position:fixed + window.scrollY bug
- Added color contrast fixes with !important
- Documented all commands
