/* =========================================================
   Main JS - Tutor Landing
   File: /docs/assets/js/main.js
   ========================================================= */

(function() {
  'use strict';

  /* -----------------------------
     1. Reveal анимации при скролле
  ----------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Однажды показали - прекращаем наблюдение
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15, // Срабатывает, когда 15% элемента в зоне видимости
        rootMargin: '0px 0px -50px 0px'
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* -----------------------------
     2. Обработка формы
  ----------------------------- */
  const leadForm = document.getElementById('leadForm');
  
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Валидация
      if (!leadForm.checkValidity()) {
        leadForm.reportValidity();
        return;
      }
      
      // Собираем данные
      const formData = new FormData(leadForm);
      const data = Object.fromEntries(formData.entries());
      
      // Индикатор загрузки
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      submitBtn.textContent = 'Отправляем...';
      
      try {
        // Здесь вы можете подключить отправку на сервер:
        // const response = await fetch('/api/lead', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // });
        
        // Или использовать Formspree, Netlify Forms, и т.д.
        
        // Имитация отправки (удалите в продакшене)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Форма отправлена:', data);
        
        // Успех
        submitBtn.textContent = '✓ Отправлено!';
        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-success');
        
        // Очистка формы
        leadForm.reset();
        
        // Возврат к исходному состоянию через 3 секунды
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-success');
          submitBtn.textContent = originalText;
        }, 3000);
        
      } catch (error) {
        console.error('Ошибка отправки:', error);
        
        submitBtn.textContent = 'Ошибка. Попробуйте снова';
        submitBtn.classList.remove('is-loading');
        
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 3000);
      }
    });
  }

  /* -----------------------------
     3. Smooth scroll для якорных ссылок
  ----------------------------- */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      
      // Пропускаем #top (уже обрабатывается scroll-behavior: smooth)
      if (href === '#' || href === '#top') return;
      
      const target = document.querySelector(href);
      if (!target) return;
      
      e.preventDefault();
      
      const headerOffset = 80; // Высота sticky header
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });

  /* -----------------------------
     4. Активная навигация (опционально)
  ----------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  if (sections.length > 0 && navLinks.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Убираем активный класс у всех
            navLinks.forEach((link) => {
              link.classList.remove('is-active');
            });
            
            // Добавляем активный класс соответствующей ссылке
            const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (activeLink) {
              activeLink.classList.add('is-active');
            }
          }
        });
      },
      {
        threshold: 0.4,
        rootMargin: '-100px 0px -60% 0px'
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* -----------------------------
     5. Активация prefers-reduced-motion
  ----------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Автоматически показываем все .reveal элементы
    revealElements.forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  /* -----------------------------
     6. Консольное сообщение
  ----------------------------- */
  console.log('%c🚀 Tutor Landing Ready', 'color: #7AA7FF; font-size: 16px; font-weight: bold;');
  console.log('%cBuilt with glassmorphism + IntersectionObserver', 'color: #A78BFA; font-size: 12px;');

})();
