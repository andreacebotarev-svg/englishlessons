// docs/assets/js/main.js

(function () {
  const headerSelector = '.header';
  const revealSelector = '.reveal';
  const formSelector = '#leadForm';

  // -----------------------------
  // Smooth scroll с учётом хедера
  // -----------------------------
  function getHeaderOffset() {
    const header = document.querySelector(headerSelector);
    if (!header) return 0;
    const styles = getComputedStyle(header);
    const isSticky = styles.position === 'sticky' || styles.position === 'fixed';
    return isSticky ? header.offsetHeight : 0;
  }

  function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (!target) return;
    const headerOffset = getHeaderOffset();
    const rect = target.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top - headerOffset - 12; // небольшой зазор

    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }

  function bindAnchorScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;

      a.addEventListener('click', (e) => {
        const id = href.trim();
        const target = document.querySelector(id);
        if (!target) return; // нет секции — ведём себя как обычно

        e.preventDefault();
        smoothScrollTo(id);
      });
    });
  }

  // -----------------------------
  // Reveal on scroll
  // -----------------------------
  function bindRevealOnScroll() {
    const nodes = Array.from(document.querySelectorAll(revealSelector));
    if (!nodes.length) return;

    // Если IntersectionObserver не поддерживается — показать всё сразу
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15
      }
    );

    nodes.forEach((el) => observer.observe(el));
  }

  // -----------------------------
  // Lead form
  // -----------------------------
  function bindLeadForm() {
    const form = document.querySelector(formSelector);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // HTML5 валидация
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
      }

      // Собираем данные (на будущее под реальную отправку)
      const data = {
        name: form.name?.value?.trim() || '',
        contact: form.contact?.value?.trim() || '',
        goal: form.goal?.value?.trim() || '',
        message: form.message?.value?.trim() || ''
      };

      // Заглушка вместо реальной отправки
      // Здесь позже можно повесить fetch/Telegram API и т.п.
      console.log('[leadForm] submission payload:', data);

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
        }
        form.reset();
        alert('Заявка отправлена (демо). Мы свяжемся с вами в ближайшее время.');
      }, 700);
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  function init() {
    bindAnchorScroll();
    bindRevealOnScroll();
    bindLeadForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
