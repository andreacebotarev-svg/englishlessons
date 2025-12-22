/**
 * Badge Component
 * Features:
 * - Multiple variants
 * - Glow effect
 * - Pulse animation
 * - Icons support
 */

import { createElement } from '@/shared/lib/dom';
import './Badge.css';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  glow?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export class Badge {
  private element: HTMLElement;
  
  constructor(private props: BadgeProps) {
    this.element = this.render();
  }
  
  private render(): HTMLElement {
    const {
      text,
      variant = 'primary',
      size = 'md',
      icon,
      glow = false,
      pulse = false,
      removable = false,
    } = this.props;
    
    const badge = createElement('span', {
      className: this.getClassNames(),
      role: 'status',
    });
    
    // Icon
    if (icon) {
      const iconEl = createElement('span', {
        className: 'badge-icon',
        textContent: icon,
        'aria-hidden': 'true',
      });
      badge.appendChild(iconEl);
    }
    
    // Text
    const textEl = createElement('span', {
      className: 'badge-text',
      textContent: text,
    });
    badge.appendChild(textEl);
    
    // Remove button
    if (removable) {
      const removeBtn = createElement('button', {
        className: 'badge-remove',
        type: 'button',
        'aria-label': 'Remove',
      });
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.props.onRemove?.();
        this.element.remove();
      });
      badge.appendChild(removeBtn);
    }
    
    return badge;
  }
  
  private getClassNames(): string {
    const {
      variant = 'primary',
      size = 'md',
      glow = false,
      pulse = false,
    } = this.props;
    
    const classes = ['badge', `badge-${variant}`, `badge-${size}`];
    
    if (glow) classes.push('badge-glow');
    if (pulse) classes.push('badge-pulse');
    
    return classes.join(' ');
  }
  
  public setText(text: string): void {
    const textEl = this.element.querySelector('.badge-text');
    if (textEl) textEl.textContent = text;
  }
  
  public getElement(): HTMLElement {
    return this.element;
  }
  
  public destroy(): void {
    this.element.remove();
  }
}
