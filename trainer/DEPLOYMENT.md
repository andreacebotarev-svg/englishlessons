# Deploy na GitHub Pages

## Problema: "Pochemu ne rabotaet?"

Trainer - eto React-prilozhenie, kotoroe trebuet **sborki** pered publikaciej.

## Reshenie: Avtomaticheskij deploj cherez GitHub Actions

### Shag 1: Nastrojka GitHub Pages (OBJAZATELNO!)

1. Perejdi v nastrojki:
   https://github.com/andreacebotarev-svg/englishlessons/settings/pages

2. V razdele "Build and deployment" -> "Source":
   - **Izmeni s "Deploy from a branch" na "GitHub Actions"**

3. Sohrani izmenenija

### Shag 2: Zapusk deploja

#### Avtomaticheskij:
- Pri ljubom push v main s izmenenijami v papke trainer/

#### Ruchnoj:
1. Perejdi vo vkladku Actions
2. Vyberi workflow "Deploy Trainer to GitHub Pages"
3. Nazhmi "Run workflow"

### Shag 3: Proverka

1. Perejdi vo vkladku Actions
2. Dazhdis zavershenija (2-3 minuty)
3. Otkroj:
   https://andreacebotarev-svg.github.io/englishlessons/trainer/

## Chto delaet GitHub Actions?

1. Checkout koda
2. Ustanovka Node.js 18
3. cd trainer && npm ci
4. npm run build
5. Publikacija dist/ na GitHub Pages

## Chastye oshibki

### "404 - Not Found"
Prichina: GitHub Pages source ne nastroen na "GitHub Actions"
Reshenie: Vypolni Shag 1

### "Workflow zapushen, no sajt ne obnovilsja"
Prichina: Kesh brauzera
Reshenie: Ctrl+Shift+R (hard refresh)

## Checklist

- [ ] Nastroil GitHub Pages Source na "GitHub Actions"
- [ ] Sdelal push v main
- [ ] Dozhdalsja zelenoj galochki v Actions
- [ ] Otkryl https://andreacebotarev-svg.github.io/englishlessons/trainer/
- [ ] Prilozhenie rabotaet!
