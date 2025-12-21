# Branch Deploy Guide

## Prostoj deploj cherez GitHub Pages

My ispolzuem klassicheskij podhod: sobirau lokalno i kommichu dist/ v repository.

## Setup (odnokratno)

### 1. Nastrojka GitHub Pages

1. Otkroj: https://github.com/andreacebotarev-svg/englishlessons/settings/pages
2. V razdele "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: /trainer/dist
3. Sokhrani

### 2. Pervonachalnaja sborka

```bash
cd trainer
npm install
npm run build
```

Eto sozdast papku `trainer/dist/` s gotovymi fajlami.

### 3. Komit i push

```bash
cd ..
git add trainer/dist
git commit -m "build: add initial dist"
git push origin main
```

## Ezhednevnaja rabota

### Pri kazhdoj izmenenii v kode:

```bash
# Variant 1: Ruchnaja sborka
cd trainer
npm run build
cd ..
git add trainer/dist
git commit -m "build: update trainer"
git push

# Variant 2: Ispolzuj npm script (rekomenduu)
cd trainer
npm run deploy
```

## npm script "deploy"

My dobavili udobnyj script v package.json:

```json
"scripts": {
  "deploy": "npm run build && git add dist && git commit -m 'build: update trainer dist' && git push"
}
```

Tepe prosto:
```bash
cd trainer
npm run deploy
```

I vse!

## Proverka

Posle push podozdi 1-2 minuty i otkroj:
```
https://andreacebotarev-svg.github.io/englishlessons/trainer/
```

## Troubleshooting

### "404 Not Found"
1. Proverj GitHub Pages Settings:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /trainer/dist
2. Ubedis chto papka trainer/dist/ est v repository

### "Belyj ekran"
1. Otkroj Developer Console (F12)
2. Proverj oshibki
3. Ubedis chto v vite.config.ts pravilnyj base path:
   ```typescript
   base: '/englishlessons/trainer/'
   ```

### "Izmenenija ne vidn"
1. Sdelaj hard refresh: Ctrl+Shift+R
2. Ili otkroj v rezhime inkognito

## Preimuschestva etogo podhoda

- Prosto i ponyatno
- Net zavisimosti ot GitHub Actions
- Polnyj kontrol nad sborkoj
- Mozhno sobrat i proverit lokalno pered deploy

## Nedostatki

- Nuzhno pomit sobrat pered kazhd push
- dist/ v repository (uvelichivaet razmer)
- Nuzhno lokalnaja ustanovka Node.js
