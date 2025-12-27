# Скрипт для деплоя изменений в ветку main
# Запустите: .\deploy.ps1

Write-Host "Добавление измененных файлов (принудительно, так как dist/ в .gitignore)..." -ForegroundColor Green
git add -f dist/assets/js/theme-manager.js
git add -f dist/assets/js/lesson-renderer.js
git add -f dist/assets/js/lesson-engine.js
git add -f dist/assets/css/theme-switcher.css

Write-Host "Создание коммита..." -ForegroundColor Green
git commit -m "refactor: integrate theme bar into Reading tab layout

- Remove fixed header theme bar from global layout
- Integrate theme switcher into Reading tab header
- Update ThemeManager to render HTML instead of creating DOM elements
- Update CSS to use relative positioning instead of fixed
- Add reading-header-top flex container for title and theme switcher"

Write-Host "Отправка изменений в ветку main..." -ForegroundColor Green
git push origin main

Write-Host "Деплой завершен!" -ForegroundColor Green

