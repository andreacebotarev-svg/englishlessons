/**
 * Platform Preview Modal
 * Открывает iframe с интерактивной платформой в модальном окне на десктопе.
 * На мобильных открывает платформу в новой вкладке.
 */

const PLATFORM_URL = 'https://eng-tutor.ru/dist/263.html';
const MOBILE_BREAKPOINT = 768; // px

function isMobile() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function openPlatformPreview() {
  // На мобильных открываем в новой вкладке
  if (isMobile()) {
    window.open(PLATFORM_URL, '_blank');
    return;
  }

  // На десктопе показываем модалку
  const modal = document.getElementById('platformModal');
  const iframe = document.getElementById('platformIframe');
  
  if (!modal || !iframe) {
    console.error('Platform modal elements not found');
    return;
  }
  
  // Загружаем iframe только при открытии (экономит трафик)
  iframe.src = PLATFORM_URL;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePlatformPreview() {
  const modal = document.getElementById('platformModal');
  const iframe = document.getElementById('platformIframe');
  
  if (!modal || !iframe) return;
  
  // Останавливаем загрузку iframe при закрытии
  iframe.src = '';
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Закрытие по клавише ESC (только на десктопе)
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !isMobile()) {
    closePlatformPreview();
  }
});

// Закрытие по клику вне контента модалки
window.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('platformModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closePlatformPreview();
      }
    });
  }

  // Обновляем текст кнопки на мобильных
  updateButtonText();
});

// Обновляем текст кнопки при изменении размера окна
window.addEventListener('resize', updateButtonText);

function updateButtonText() {
  const button = document.querySelector('button[onclick="openPlatformPreview()"]');
  if (!button) return;

  if (isMobile()) {
    button.textContent = 'Открыть пример урока';
    button.setAttribute('aria-label', 'Открыть пример урока в новой вкладке');
  } else {
    button.textContent = 'Посмотреть пример урока';
    button.setAttribute('aria-label', 'Открыть пример урока в модальном окне');
  }
}
