/**
 * Web Animations API utilities
 * Simplified animation helpers for consistent UX
 */

/**
 * Animation presets
 */
export const AnimationPresets = {
  fadeIn: [
    { opacity: 0 },
    { opacity: 1 }
  ],
  fadeOut: [
    { opacity: 1 },
    { opacity: 0 }
  ],
  scaleUp: [
    { transform: 'scale(0.8)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ],
  scaleDown: [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(0.8)', opacity: 0 }
  ],
  slideInLeft: [
    { transform: 'translateX(-100%)' },
    { transform: 'translateX(0)' }
  ],
  slideInRight: [
    { transform: 'translateX(100%)' },
    { transform: 'translateX(0)' }
  ],
  slideOutLeft: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-100%)' }
  ],
  slideOutRight: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(100%)' }
  ],
  bounce: [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-20px)' },
    { transform: 'translateY(0)' }
  ],
  shake: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(0)' }
  ],
  pulse: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.1)' },
    { transform: 'scale(1)' }
  ],
} as const;

/**
 * Timing presets
 */
export const TimingPresets = {
  fast: { duration: 200, easing: 'ease-out' },
  normal: { duration: 300, easing: 'ease-out' },
  slow: { duration: 500, easing: 'ease-out' },
  verySlow: { duration: 1000, easing: 'ease-out' },
  elastic: { duration: 600, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  bounce: { duration: 800, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
} as const;

/**
 * Animate element with preset
 */
export const animate = (
  element: HTMLElement,
  preset: keyof typeof AnimationPresets,
  timing: keyof typeof TimingPresets = 'normal'
): Animation => {
  const keyframes = AnimationPresets[preset];
  const options = TimingPresets[timing];

  return element.animate(keyframes, options);
};

/**
 * Fade in element
 */
export const fadeIn = (
  element: HTMLElement,
  duration = 300
): Promise<void> => {
  const animation = element.animate(AnimationPresets.fadeIn, {
    duration,
    easing: 'ease-out',
    fill: 'forwards',
  });

  return animation.finished;
};

/**
 * Fade out element
 */
export const fadeOut = (
  element: HTMLElement,
  duration = 300
): Promise<void> => {
  const animation = element.animate(AnimationPresets.fadeOut, {
    duration,
    easing: 'ease-out',
    fill: 'forwards',
  });

  return animation.finished;
};

/**
 * Success animation (green pulse + bounce)
 */
export const animateSuccess = async (
  element: HTMLElement
): Promise<void> => {
  element.style.backgroundColor = '#10b981';

  await element.animate([
    { transform: 'scale(1)', backgroundColor: '#10b981' },
    { transform: 'scale(1.2)', backgroundColor: '#34d399' },
    { transform: 'scale(1)', backgroundColor: '#10b981' },
  ], {
    duration: 500,
    easing: 'ease-out',
  }).finished;
};

/**
 * Error animation (red shake)
 */
export const animateError = async (
  element: HTMLElement
): Promise<void> => {
  element.style.backgroundColor = '#ef4444';

  await element.animate(AnimationPresets.shake, {
    duration: 400,
    easing: 'ease-out',
  }).finished;

  element.style.backgroundColor = '';
};

/**
 * Loading spinner animation
 */
export const animateSpin = (
  element: HTMLElement
): Animation => {
  return element.animate(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' },
    ],
    {
      duration: 1000,
      iterations: Infinity,
      easing: 'linear',
    }
  );
};

/**
 * Animation chain builder
 * Allows sequencing multiple animations
 */
export class AnimationChain {
  private steps: Array<() => Promise<void>> = [];
  
  constructor(private element: HTMLElement) {}
  
  /**
   * Add animation to chain
   */
  add(
    preset: keyof typeof AnimationPresets,
    timing: keyof typeof TimingPresets = 'normal'
  ): this {
    this.steps.push(async () => {
      await animate(this.element, preset, timing).finished;
    });
    return this;
  }
  
  /**
   * Add custom animation to chain
   */
  custom(
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions
  ): this {
    this.steps.push(async () => {
      await this.element.animate(keyframes, options).finished;
    });
    return this;
  }
  
  /**
   * Add delay to chain
   */
  delay(ms: number): this {
    this.steps.push(() => new Promise(resolve => setTimeout(resolve, ms)));
    return this;
  }
  
  /**
   * Add callback to chain
   */
  then(callback: () => void | Promise<void>): this {
    this.steps.push(async () => {
      await callback();
    });
    return this;
  }
  
  /**
   * Play all animations in sequence
   */
  async play(): Promise<void> {
    for (const step of this.steps) {
      await step();
    }
  }
  
  /**
   * Clear all steps
   */
  clear(): this {
    this.steps = [];
    return this;
  }
}
