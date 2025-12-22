/**
 * Progress Component
 * Features:
 * - Smooth animations
 * - Percentage display
 * - Color gradients
 * - Striped animation
 */

import { createElement } from '@/shared/lib/dom';
import './Progress.css';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger';

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  striped?: boolean;
  animated?: boolean;
  height?: string;
}

export class Progress {
  private element: HTMLElement;
  private bar: HTMLElement;
  private label: HTMLElement | null = null;
  private currentValue: number;
  
  constructor(private props: ProgressProps) {
    this.currentValue = props.value;
    this.element = this.render();
  }
  
  private render(): HTMLElement {
    const {
      value,
      max = 100,
      variant = 'primary',
      showLabel = false,
      striped = false,
      animated = false,
      height,
    } = this.props;
    
    const container = createElement('div', {
      className: 'progress',
      role: 'progressbar',
      'aria-valuenow': String(value),
      'aria-valuemin': '0',
      'aria-valuemax': String(max),
    });
    
    if (height) {
      container.style.height = height;
    }
    
    this.bar = createElement('div', {
      className: this.getBarClassNames(),
    });
    
    this.bar.style.width = `${(value / max) * 100}%`;
    
    if (showLabel) {
      this.label = createElement('span', {
        className: 'progress-label',
        textContent: `${Math.round((value / max) * 100)}%`,
      });
      this.bar.appendChild(this.label);
    }
    
    container.appendChild(this.bar);
    
    return container;
  }
  
  private getBarClassNames(): string {
    const {
      variant = 'primary',
      striped = false,
      animated = false,
    } = this.props;
    
    const classes = ['progress-bar', `progress-bar-${variant}`];
    
    if (striped) classes.push('progress-bar-striped');
    if (animated) classes.push('progress-bar-animated');
    
    return classes.join(' ');
  }
  
  public setValue(value: number, animate = true): void {
    const max = this.props.max || 100;
    const percentage = (value / max) * 100;
    
    this.currentValue = value;
    this.element.setAttribute('aria-valuenow', String(value));
    
    if (animate) {
      // Smooth animation
      this.bar.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
      this.bar.style.transition = 'none';
    }
    
    this.bar.style.width = `${percentage}%`;
    
    if (this.label) {
      this.label.textContent = `${Math.round(percentage)}%`;
    }
    
    // Reset transition
    setTimeout(() => {
      this.bar.style.transition = '';
    }, 600);
  }
  
  public increment(amount: number): void {
    this.setValue(this.currentValue + amount);
  }
  
  public setVariant(variant: ProgressVariant): void {
    this.props.variant = variant;
    this.bar.className = this.getBarClassNames();
  }
  
  public getValue(): number {
    return this.currentValue;
  }
  
  public getElement(): HTMLElement {
    return this.element;
  }
  
  public destroy(): void {
    this.element.remove();
  }
}
