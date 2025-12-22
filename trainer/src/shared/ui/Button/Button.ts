/**
 * Premium Button Component
 * Features:
 * - Glassmorphism effect
 * - Micro-interactions
 * - Haptic feedback simulation
 * - Loading state
 * - Full accessibility
 */

import { createElement } from '@/shared/lib/dom';
import { AnimationChain } from '@/shared/lib/animations';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string; // emoji or icon
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: (e: MouseEvent) => void | Promise<void>;
  ariaLabel?: string;
}

export class Button {
  private element: HTMLButtonElement;
  private isLoading = false;
  private ripples: HTMLElement[] = [];
  
  constructor(private props: ButtonProps) {
    this.element = this.render();
    this.attachListeners();
  }
  
  private render(): HTMLButtonElement {
    const {
      text,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      disabled = false,
      fullWidth = false,
      ariaLabel,
    } = this.props;
    
    const button = createElement('button', {
      className: this.getClassNames(),
      type: 'button',
      disabled: disabled || loading,
      'aria-label': ariaLabel || text,
      'aria-busy': loading,
    });
    
    // Loading spinner
    if (loading) {
      const spinner = createElement('span', {
        className: 'btn-spinner',
        'aria-hidden': 'true',
      });
      button.appendChild(spinner);
    }
    
    // Icon (left)
    if (icon && iconPosition === 'left' && !loading) {
      const iconEl = createElement('span', {
        className: 'btn-icon btn-icon-left',
        textContent: icon,
        'aria-hidden': 'true',
      });
      button.appendChild(iconEl);
    }
    
    // Text
    const textEl = createElement('span', {
      className: 'btn-text',
      textContent: text,
    });
    button.appendChild(textEl);
    
    // Icon (right)
    if (icon && iconPosition === 'right' && !loading) {
      const iconEl = createElement('span', {
        className: 'btn-icon btn-icon-right',
        textContent: icon,
        'aria-hidden': 'true',
      });
      button.appendChild(iconEl);
    }
    
    // Ripple container
    const rippleContainer = createElement('span', {
      className: 'btn-ripple-container',
      'aria-hidden': 'true',
    });
    button.appendChild(rippleContainer);
    
    return button;
  }
  
  private getClassNames(): string {
    const { variant = 'primary', size = 'md', fullWidth = false, loading = false } = this.props;
    
    const classes = ['btn', `btn-${variant}`, `btn-${size}`];
    
    if (fullWidth) classes.push('btn-full-width');
    if (loading) classes.push('btn-loading');
    
    return classes.join(' ');
  }
  
  private attachListeners(): void {
    // Click handler with haptic feedback
    this.element.addEventListener('click', async (e) => {
      if (this.isLoading || this.props.disabled) return;
      
      // Create ripple effect
      this.createRipple(e);
      
      // Haptic feedback (if supported)
      this.triggerHaptic();
      
      // Execute callback
      if (this.props.onClick) {
        try {
          const result = this.props.onClick(e);
          if (result instanceof Promise) {
            this.setLoading(true);
            await result;
            this.setLoading(false);
          }
        } catch (error) {
          console.error('Button click error:', error);
          this.setLoading(false);
          this.animateError();
        }
      }
    });
    
    // Hover effects
    this.element.addEventListener('mouseenter', () => {
      if (!this.props.disabled && !this.isLoading) {
        this.animateHover();
      }
    });
    
    // Focus visible
    this.element.addEventListener('focus', () => {
      this.element.classList.add('btn-focus-visible');
    });
    
    this.element.addEventListener('blur', () => {
      this.element.classList.remove('btn-focus-visible');
    });
  }
  
  private createRipple(e: MouseEvent): void {
    const container = this.element.querySelector('.btn-ripple-container') as HTMLElement;
    if (!container) return;
    
    const rect = this.element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = createElement('span', {
      className: 'btn-ripple',
    });
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    container.appendChild(ripple);
    this.ripples.push(ripple);
    
    // Remove after animation
    setTimeout(() => {
      ripple.remove();
      const index = this.ripples.indexOf(ripple);
      if (index > -1) this.ripples.splice(index, 1);
    }, 600);
  }
  
  private triggerHaptic(): void {
    // Vibration API for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }
  
  private async animateHover(): Promise<void> {
    await new AnimationChain(this.element)
      .add('pulse', 'fast')
      .play();
  }
  
  private async animateError(): Promise<void> {
    await new AnimationChain(this.element)
      .add('shake', 'fast')
      .play();
  }
  
  public setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.props.loading = loading;
    
    if (loading) {
      this.element.classList.add('btn-loading');
      this.element.setAttribute('aria-busy', 'true');
      this.element.disabled = true;
      
      // Add spinner if not exists
      if (!this.element.querySelector('.btn-spinner')) {
        const spinner = createElement('span', {
          className: 'btn-spinner',
          'aria-hidden': 'true',
        });
        this.element.insertBefore(spinner, this.element.firstChild);
      }
    } else {
      this.element.classList.remove('btn-loading');
      this.element.setAttribute('aria-busy', 'false');
      this.element.disabled = this.props.disabled || false;
      
      // Remove spinner
      const spinner = this.element.querySelector('.btn-spinner');
      if (spinner) spinner.remove();
    }
  }
  
  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.element.disabled = disabled;
  }
  
  public setText(text: string): void {
    this.props.text = text;
    const textEl = this.element.querySelector('.btn-text');
    if (textEl) textEl.textContent = text;
  }
  
  public getElement(): HTMLButtonElement {
    return this.element;
  }
  
  public destroy(): void {
    this.element.remove();
  }
}
