// Animation utilities
export const animate = {
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    requestAnimationFrame(() => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '1';
    });
  },

  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    
    return new Promise(resolve => {
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  },

  success(element) {
    element.classList.add('success-animation');
    setTimeout(() => {
      element.classList.remove('success-animation');
    }, 600);
  },

  error(element) {
    element.classList.add('error-animation');
    setTimeout(() => {
      element.classList.remove('error-animation');
    }, 600);
  },

  pulse(element) {
    element.style.animation = 'none';
    requestAnimationFrame(() => {
      element.style.animation = 'successPulse 600ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  }
};

// DOM utilities
export const dom = {
  create(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  },

  clear(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  show(element) {
    element.style.display = 'block';
  },

  hide(element) {
    element.style.display = 'none';
  }
};

// Array utilities
export const array = {
  shuffle(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};

// Score calculation
export function calculateStars(correctAnswers, totalWords) {
  const percentage = (correctAnswers / totalWords) * 100;
  if (percentage === 100) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 60) return 1;
  return 0;
}

// Format time
export function formatTime(minutes) {
  if (minutes < 1) return '< 1 мин';
  return `${minutes} мин`;
}

// Debounce
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check reduced motion preference
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}