# 🚀 Deployment Guide - Vanilla JS Version

## Why So Simple?

No build step = No complexity!

```
Your changes → git push → Live in 30 seconds
```

## Initial Setup

### 1. Configure GitHub Pages

1. Open: https://github.com/andreacebotarev-svg/englishlessons/settings/pages

2. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `refactor/vanilla-js` (or `main` after merge)
   - **Folder**: `/trainer`

3. Click **Save**

4. Wait 1 minute

5. Open: https://andreacebotarev-svg.github.io/englishlessons/trainer/

**Done!** 🎉

## Daily Workflow

### Make Changes

```bash
# Edit any file (e.g., components/GameBoard.js)
# Changes are immediately visible in local dev server
```

### Deploy to GitHub Pages

```bash
git add trainer/
git commit -m "update: improved keyboard layout"
git push origin refactor/vanilla-js
```

**Wait 30 seconds** → Refresh page → Changes live!

## What Gets Deployed?

Everything in `trainer/` folder:

```
trainer/
├── index.html          → Entry point
├── app.js              → Main logic
├── styles.css          → Styles
├── components/         → All modules
├── store/              → State
├── utils/              → Utilities
└── public/data/        → JSON lessons
```

**No compilation, no transformation** - files deploy as-is!

## Troubleshooting

### Changes not visible?

1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Open in incognito** to bypass cache
3. **Check Actions tab**: https://github.com/andreacebotarev-svg/englishlessons/actions

### 404 Error?

1. Check GitHub Pages settings (see Initial Setup)
2. Verify branch name matches
3. Ensure `/trainer` folder is selected

### "Module not found" in production?

1. Check all imports have `.js` extension
2. Verify paths are relative: `./utils/helpers.js`
3. Test locally first with Live Server

## Comparison: Old vs New

### Old (React + Node.js):

```bash
# Every deploy:
cd trainer
npm install          # 2 minutes
npm run build        # 1 minute
git add dist/
git commit
git push
# Wait for GitHub Actions: 3 minutes
# Total: ~6 minutes
```

### New (Vanilla JS):

```bash
# Every deploy:
git add trainer/
git commit -m "update"
git push
# Wait: 30 seconds
# Total: 30 seconds!
```

**12x faster!** ⚡

## URL Structure

```
https://andreacebotarev-svg.github.io/englishlessons/trainer/
         └────────┬──────────────┘  └─────┬────────┘  └─┬──────┘
         GitHub username     Repo name        Folder
```

## Best Practices

### 1. Test Locally First

Always run local server before pushing:

```bash
cd trainer
python -m http.server 8000
# Test at http://localhost:8000
```

### 2. Use Meaningful Commits

```bash
# Good
git commit -m "feat: add lesson 2 with short I sound"
git commit -m "fix: keyboard not shuffling phonemes"

# Bad
git commit -m "update"
git commit -m "fixes"
```

### 3. Check Browser Console

F12 → Console tab - shows errors immediately

## ✅ Checklist for First Deploy

- [ ] GitHub Pages configured
- [ ] Branch name correct
- [ ] Folder set to `/trainer`
- [ ] Pushed to GitHub
- [ ] Waited 1-2 minutes
- [ ] Opened URL
- [ ] Hard refreshed (Ctrl+Shift+R)

## 🎉 Success!

If you see the app at:
```
https://andreacebotarev-svg.github.io/englishlessons/trainer/
```

**You're done!** From now on, just `git push` to deploy.
