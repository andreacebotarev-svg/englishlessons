# ============================================================
# DEPLOYMENT SCRIPT
# ============================================================
# 
# PURPOSE:
# This script deploys changes from the dist/ folder to GitHub Pages.
# 
# WHY git add -f IS USED:
# The dist/ folder is listed in .gitignore to prevent accidental commits
# of build artifacts. However, in this project, dist/ contains source
# files (HTML, CSS, JS) that MUST be in the repository for GitHub Pages
# deployment to work. The -f flag is necessary to override .gitignore
# for these specific files that need to be version controlled.
#
# ALTERNATIVE APPROACHES:
# 1. Remove dist/ from .gitignore and add specific ignore patterns
# 2. Use GitHub Actions for automated deployment
# 3. Use a separate deployment branch (gh-pages)
#
# USAGE:
#   .\.scripts\deploy.ps1
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Добавление измененных файлов (принудительно, так как dist/ в .gitignore)..." -ForegroundColor Green
Write-Host "NOTE: Using -f flag because dist/ contains source files needed for GitHub Pages" -ForegroundColor Yellow
Write-Host ""

# Список файлов для добавления
$files = @(
    "dist/assets/js/theme-manager.js",
    "dist/assets/js/lesson-renderer.js",
    "dist/assets/js/lesson-engine.js",
    "dist/assets/css/theme-switcher.css",
    "dist/assets/css/lesson-theme-kids.css"
)

# Проверка и добавление файлов
$addedCount = 0
$missingCount = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ Добавление: $file" -ForegroundColor Cyan
        git add -f $file
        $addedCount++
    } else {
        Write-Host "  ✗ ПРЕДУПРЕЖДЕНИЕ: Файл не найден: $file" -ForegroundColor Yellow
        $missingCount++
    }
}

Write-Host ""
Write-Host "Добавлено файлов: $addedCount" -ForegroundColor Green
if ($missingCount -gt 0) {
    Write-Host "Отсутствует файлов: $missingCount" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Создание коммита..." -ForegroundColor Green
git commit -m "refactor: integrate theme bar into Reading tab layout + improve button visibility

- Remove fixed header theme bar from global layout
- Integrate theme switcher into Reading tab header
- Update ThemeManager to render HTML instead of creating DOM elements
- Update CSS to use relative positioning instead of fixed
- Add reading-header-top flex container for title and theme switcher
- Change button text from 'Listen All' to '🔊 Play audio' for better visibility
- Improve button contrast in Kids theme with dark text and enhanced shadows"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ОШИБКА: Не удалось создать коммит. Возможно, нет изменений для коммита." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Отправка изменений в ветку main..." -ForegroundColor Green
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "ОШИБКА: Не удалось отправить изменения." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Деплой завершен успешно!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

