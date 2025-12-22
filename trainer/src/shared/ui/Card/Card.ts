/**
 * Premium Card Component
 * Features:
 * - Advanced glassmorphism
 * - 3D hover effects
 * - Glow on hover
 * - Parallax movement
 * - Click animations
 */

import { createElement } from '@/shared/lib/dom';
import { AnimationChain } from '@/shared/lib/animations';
import './Card.css';

export interface CardProps {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info';
  footer?: string;
  variant?: 'default' | 'gradient' | 'bordered';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: (e: MouseEvent) => void;
  children?: HTMLElement[];
}

export class Card {
  private element: HTMLElement;
  private glowElement: HTMLElement | null = null;
  private isHovering = false;
  
  constructor(private props: CardProps) {
    this.element = this.render();
    this.attachListeners();
  }
  
  private render(): HTMLElement {
    const {
      title,
      description,
      icon,
      image,
      badge,
      badgeVariant = 'primary',
      footer,
      variant = 'default',
      hoverable = true,
      clickable = false,
      children,
    } = this.props;
    
    const card = createElement('div', {
      className: this.getClassNames(),
      role: clickable ? 'button' : undefined,
      tabIndex: clickable ? 0 : undefined,
    });
    
    // Glow effect
    if (hoverable) {
      this.glowElement = createElement('div', {
        className: 'card-glow',
        'aria-hidden': 'true',
      });
      card.appendChild(this.glowElement);
    }
    
    // Image
    if (image) {
      const imageEl = createElement('div', {
        className: 'card-image',
      });
      const img = createElement('img', {
        src: image,
        alt: title || '',
        loading: 'lazy',
      });
      imageEl.appendChild(img);
      card.appendChild(imageEl);
    }
    
    // Header
    if (icon || title || badge) {
      const header = createElement('div', {
        className: 'card-header',
      });
      
      // Icon
      if (icon) {
        const iconEl = createElement('div', {
          className: 'card-icon',
          textContent: icon,
          'aria-hidden': 'true',
        });
        header.appendChild(iconEl);
      }
      
      // Title
      if (title) {
        const titleEl = createElement('h3', {
          className: 'card-title',
          textContent: title,
        });
        header.appendChild(titleEl);
      }
      
      // Badge
      if (badge) {
        const badgeEl = createElement('span', {
          className: `card-badge card-badge-${badgeVariant}`,
          textContent: badge,
        });
        header.appendChild(badgeEl);
      }
      
      card.appendChild(header);
    }
    
    // Body
    if (description || children) {
      const body = createElement('div', {
        className: 'card-body',
      });
      
      if (description) {
        const descEl = createElement('p', {
          className: 'card-description',
          textContent: description,
        });
        body.appendChild(descEl);
      }
      
      if (children) {
        children.forEach(child => body.appendChild(child));
      }
      
      card.appendChild(body);
    }
    
    // Footer
    if (footer) {
      const footerEl = createElement('div', {
        className: 'card-footer',
        textContent: footer,
      });
      card.appendChild(footerEl);
    }
    
    return card;
  }
  
  private getClassNames(): string {
    const {
      variant = 'default',
      hoverable = true,
      clickable = false,
    } = this.props;
    
    const classes = ['card', `card-${variant}`];
    
    if (hoverable) classes.push('card-hoverable');
    if (clickable) classes.push('card-clickable');
    
    return classes.join(' ');
  }
  
  private attachListeners(): void {
    if (!this.props.hoverable && !this.props.clickable) return;
    
    // 3D hover effect
    this.element.addEventListener('mousemove', (e) => {
      if (!this.isHovering) return;
      this.handle3DHover(e);
    });
    
    this.element.addEventListener('mouseenter', () => {
      this.isHovering = true;
      this.animateHoverEnter();
    });
    
    this.element.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.animateHoverLeave();
    });
    
    // Click handler
    if (this.props.clickable && this.props.onClick) {
      this.element.addEventListener('click', (e) => {
        this.animateClick();
        this.props.onClick?.(e);
      });
      
      // Keyboard support
      this.element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.animateClick();
          this.props.onClick?.(e as any);
        }
      });
    }
  }
  
  private handle3DHover(e: MouseEvent): void {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
    const rotateY = ((x - centerX) / centerX) * 10;
    
    this.element.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(10px)
    `;
    
    // Move glow
    if (this.glowElement) {
      this.glowElement.style.background = `
        radial-gradient(
          circle at ${x}px ${y}px,
          rgba(139, 92, 246, 0.3),
          transparent 50%
        )
      `;
    }
  }
  
  private async animateHoverEnter(): Promise<void> {
    if (this.glowElement) {
      this.glowElement.style.opacity = '1';
    }
    
    await new AnimationChain(this.element)
      .custom(
        [
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-4px) scale(1.02)' },
        ],
        { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      )
      .play();
  }
  
  private async animateHoverLeave(): Promise<void> {
    if (this.glowElement) {
      this.glowElement.style.opacity = '0';
    }
    
    this.element.style.transform = '';
    
    await new AnimationChain(this.element)
      .custom(
        [
          { transform: 'translateY(-4px) scale(1.02)' },
          { transform: 'translateY(0) scale(1)' },
        ],
        { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      )
      .play();
  }
  
  private async animateClick(): Promise<void> {
    await new AnimationChain(this.element)
      .custom(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.95)' },
          { transform: 'scale(1)' },
        ],
        { duration: 200, easing: 'ease-out' }
      )
      .play();
  }
  
  public setTitle(title: string): void {
    const titleEl = this.element.querySelector('.card-title');
    if (titleEl) titleEl.textContent = title;
  }
  
  public setDescription(description: string): void {
    const descEl = this.element.querySelector('.card-description');
    if (descEl) descEl.textContent = description;
  }
  
  public setBadge(text: string, variant: string = 'primary'): void {
    let badgeEl = this.element.querySelector('.card-badge');
    
    if (!badgeEl) {
      const header = this.element.querySelector('.card-header');
      if (!header) return;
      
      badgeEl = createElement('span', {
        className: `card-badge card-badge-${variant}`,
      });
      header.appendChild(badgeEl);
    }
    
    badgeEl.textContent = text;
    badgeEl.className = `card-badge card-badge-${variant}`;
  }
  
  public getElement(): HTMLElement {
    return this.element;
  }
  
  public destroy(): void {
    this.element.remove();
  }
}
