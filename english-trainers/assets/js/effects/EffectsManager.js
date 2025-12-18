/**
 * EFFECTS MANAGER
 * Production-grade visual effects with memory safety, performance optimization, mobile scaling.
 */

class EffectsManager {
  constructor(config = {}) {
    this.config = {
      enableConfetti: config.enableConfetti ?? true,
      enableParticles: config.enableParticles ?? true,
      confettiCount: config.confettiCount ?? (this._isMobile() ? 25 : 50),
      particleCount: config.particleCount ?? 8,
      ...config
    };

    // Memory-safe timer registry
    this._activeTimers = new Set();
    this._activeElements = new WeakSet();
    this._rafHandles = new Set();
    this._isDestroyed = false;

    // Motivational phrases (localization-ready)
    this.phrases = config.phrases || MOTIVATIONAL_PHRASES_RU;

    // Inject CSS once
    this._injectEffectsCSS();
  }

  /**
   * Memory-safe setTimeout with auto-cleanup
   */
  _setTimeout(callback, delay) {
    if (this._isDestroyed) return null;

    const timerId = setTimeout(() => {
      this._activeTimers.delete(timerId);
      !this._isDestroyed && callback();
    }, delay);

    this._activeTimers.add(timerId);
    return timerId;
  }

  /**
   * Launch confetti with DocumentFragment (1 reflow vs 50)
   */
  launchConfetti() {
    if (!this.config.enableConfetti || this._isDestroyed) return;

    const fragment = document.createDocumentFragment();
    const colors = ['#0A84FF', '#30D158', '#FFD60A', '#FF375F', '#BF5AF2'];
    const count = this.config.confettiCount;

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.cssText = `
        left: ${Math.random() * 100}vw;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-delay: ${Math.random() * 0.3}s;
        animation-duration: ${Math.random() * 2 + 2}s;
      `;
      fragment.appendChild(confetti);

      this._activeElements.add(confetti);
      this._setTimeout(() => {
        confetti.remove();
        this._activeElements.delete(confetti);
      }, 3000);
    }

    // Single reflow
    document.body.appendChild(fragment);
    window.debugEffects && window.debugEffects('confetti', { count });
  }

  /**
   * Particle burst with DocumentFragment
   */
  createParticleBurst(container) {
    if (!this.config.enableParticles || !container || this._isDestroyed) return;

    const fragment = document.createDocumentFragment();
    const count = this.config.particleCount;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.setProperty('--angle', `${(360 / count) * i}deg`);
      fragment.appendChild(particle);

      this._activeElements.add(particle);
      this._setTimeout(() => {
        particle.remove();
        this._activeElements.delete(particle);
      }, 600);
    }

    container.appendChild(fragment);
    window.debugEffects && window.debugEffects('particles', { count });
  }

  /**
   * Get contextual motivational phrase
   */
  getMotivationalPraise(context) {
    const { streak, accuracy, questionsAnswered } = context;

    let category;
    if (streak >= 5) {
      category = 'streak';
    } else if (accuracy >= 0.85 && questionsAnswered >= 3) {
      category = 'accuracy';
    } else {
      category = 'random';
    }

    const phrases = this.phrases[category];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    window.debugEffects && window.debugEffects('motivational', { category, phrase });
    return phrase;
  }

  /**
   * Orchestrator for success effects
   */
  triggerSuccessEffects(streak, container) {
    if (this._isDestroyed) return;

    // Flash effect
    if (container) {
      container.classList.add('correct-flash');
      this._setTimeout(() => container.classList.remove('correct-flash'), 500);
    }

    // Confetti on milestones
    if ([5, 10, 15, 20].includes(streak)) {
      this.launchConfetti();
    }

    // Particles on combos
    if (streak >= 3) {
      this.createParticleBurst(container);
    }
  }

  /**
   * Cleanup: critical for memory safety
   */
  destroy() {
    this._isDestroyed = true;

    // Clear all pending timers
    this._activeTimers.forEach(id => clearTimeout(id));
    this._activeTimers.clear();

    // Cancel RAF
    this._rafHandles.forEach(handle => cancelAnimationFrame(handle));
    this._rafHandles.clear();

    window.debugEffects && window.debugEffects('destroyed');
  }

  /**
   * Mobile detection for adaptive scaling
   */
  _isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  /**
   * Inject effects CSS (once per instance)
   */
  _injectEffectsCSS() {
    if (document.getElementById('trainer-effects-css')) return;

    const style = document.createElement('style');
    style.id = 'trainer-effects-css';
    style.textContent = `
      @keyframes correctFlash {
        0% { box-shadow: 0 0 0 rgba(48, 209, 88, 0); }
        50% { box-shadow: 0 0 30px rgba(48, 209, 88, 0.8); }
        100% { box-shadow: 0 0 0 rgba(48, 209, 88, 0); }
      }
      .correct-flash {
        animation: correctFlash 0.5s ease-out;
      }

      @keyframes confettiFall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
      .confetti {
        position: fixed;
        width: 8px;
        height: 8px;
        top: -10px;
        z-index: 9999;
        animation: confettiFall linear forwards;
        will-change: transform;
      }

      @media (max-width: 768px) {
        .confetti {
          width: 6px;
          height: 6px;
        }
      }

      @keyframes particleBurst {
        0% {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateY(50px) scale(0);
          opacity: 0;
        }
      }
      .particle {
        position: absolute;
        width: 6px;
        height: 6px;
        background: #FFD60A;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        animation: particleBurst 0.6s ease-out forwards;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }
}

// Motivational phrases config (localization-ready)
const MOTIVATIONAL_PHRASES_RU = {
  streak: [
    'Огонь! 🔥 Не останавливайся!',
    'Отлично! Продолжай в том же духе!',
    'Ты в ударе! Вперёд к победе!',
    'Превосходно! Ещё немного!',
    'Невероятная серия! 🏆'
  ],
  accuracy: [
    'Молодчина! Ещё чуть-чуть и ты станешь профи!',
    'Отличная работа! Так держать!',
    'Прекрасно! Ты быстро учишься!',
    'Великолепно! Ты на верном пути!'
  ],
  random: [
    'Правильно! ✅',
    'Точно! 🎯',
    'Супер! ⭐',
    'Класс! 👏',
    'Браво! 🎉'
  ]
};
