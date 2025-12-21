# Quick Start - First Deployment

## You need Node.js installed!

Check: `node --version` (need 18+)

If not installed: https://nodejs.org/

## Step 1: Build the app

```bash
# Clone if not done yet
git clone https://github.com/andreacebotarev-svg/englishlessons.git
cd englishlessons/trainer

# Install dependencies
npm install

# Build the app
npm run build
```

This creates `trainer/dist/` folder with ready files.

## Step 2: Commit dist/

```bash
cd ..
git add trainer/dist
git commit -m "build: initial trainer dist"
git push origin main
```

## Step 3: Configure GitHub Pages

1. Go to: https://github.com/andreacebotarev-svg/englishlessons/settings/pages
2. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: /trainer/dist
3. Click Save

## Step 4: Wait and check

Wait 1-2 minutes, then open:
```
https://andreacebotarev-svg.github.io/englishlessons/trainer/
```

## Done!

Now for future updates:
```bash
cd trainer
npm run deploy  # builds
cd ..
git add trainer/dist
git commit -m "build: update"
git push
```

Or use scripts:
```bash
cd trainer
./deploy.sh        # Linux/Mac
deploy.bat         # Windows
```
