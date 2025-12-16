/**
 * Platform Preview Modal
 * Открывает iframe с интерактивной платформой в модальном окне
 */

function openPlatformPreview() {
  const modal = document.getElementById('platformModal');
  const iframe = document.getElementById('platformIframe');
  
  if (!modal || !iframe) {
    console.error('Platform modal elements not found');
    return;
  }
  
  // Загружаем iframe только при открытии (экономит трафик)
  iframe.src = 'dist/263.html';
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

// Закрытие по клавише ESC для платформы
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
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
});
