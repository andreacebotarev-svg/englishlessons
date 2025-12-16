/* =========================================================
   Main JS - Tutor Landing
   File: /docs/assets/js/main.js
   Mobile-First Responsive
   ========================================================= */

(function() {
  'use strict';

  /* -----------------------------
     1. Mobile Hamburger Menu
  ----------------------------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-links a');
  
  if (navToggle && navLinks) {
    // Toggle menu
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      
      // Блокируем скролл body при открытом меню
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    
    // Закрываем меню при клике на ссылку
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
    
    // Закрываем меню при ресайзе окна (переход в desktop-режим)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth >= 768 && navLinks.classList.contains('is-open')) {
          navLinks.classList.remove('is-open');
          navToggle.classList.remove('is-active');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      }, 250);
    });
  }

  /* -----------------------------
     2. Reveal анимации при скролле
  ----------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Снижен для мобильных (меньше высота экрана)
        rootMargin: '0px 0px -30px 0px'
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  /* -----------------------------
     3. Обработка формы
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
        // Здесь подключите отправку на сервер:
        // const response = await fetch('/api/lead', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
        // });
        
        // Или используйте Formspree, Netlify Forms, и т.д.
        
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
     4. Smooth scroll для якорных ссылок
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
      
      // Адаптивный offset для sticky header
      const headerOffset = window.innerWidth < 768 ? 60 : 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });

  /* -----------------------------
     5. Активная навигация (опционально)
  ----------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinksActive = document.querySelectorAll('.nav-links a[href^="#"]');
  
  if (sections.length > 0 && navLinksActive.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Убираем активный класс у всех
            navLinksActive.forEach((link) => {
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
        threshold: 0.3,
        rootMargin: '-80px 0px -60% 0px'
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* -----------------------------
     6. Активация prefers-reduced-motion
  ----------------------------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Автоматически показываем все .reveal элементы
    revealElements.forEach((el) => {
      el.classList.add('is-visible');
    });
  }

  /* -----------------------------
     7. Оптимизация производительности
  ----------------------------- */
  
  // Lazy loading для изображений (нативная поддержка)
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  if ('loading' in HTMLImageElement.prototype) {
    // Браузер поддерживает нативный lazy loading
    console.log('✓ Native lazy loading enabled');
  } else {
    // Fallback для старых браузеров (можно добавить полифилл)
    console.warn('⚠ Native lazy loading not supported');
  }

  /* -----------------------------
     8. Консольное сообщение
  ----------------------------- */
  console.log('%c🚀 Tutor Landing Ready', 'color: #7AA7FF; font-size: 16px; font-weight: bold;');
  console.log('%cMobile-First + Glassmorphism + IntersectionObserver', 'color: #A78BFA; font-size: 12px;');
  console.log(`%cScreen: ${window.innerWidth}x${window.innerHeight}px`, 'color: #44D7A8; font-size: 10px;');

})();
