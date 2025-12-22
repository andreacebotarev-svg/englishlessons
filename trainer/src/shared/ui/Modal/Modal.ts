/**
 * Modal Component
 * Features:
 * - Spring animation
 * - Backdrop blur
 * - Focus trap
 * - Escape key to close
 * - Body scroll lock
 * - Portal rendering
 */

import { createElement, $ } from '@/shared/lib/dom';
import { AnimationChain } from '@/shared/lib/animations';
import './Modal.css';

export interface ModalProps {
  title?: string;
  content?: string | HTMLElement;
  footer?: HTMLElement;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export class Modal {
  private element: HTMLElement;
  private backdrop: HTMLElement;
  private dialog: HTMLElement;
  private isOpen = false;
  private focusTrap: HTMLElement[] = [];
  private previousFocus: HTMLElement | null = null;
  
  constructor(private props: ModalProps) {
    this.element = this.render();
    this.attachListeners();
  }
  
  private render(): HTMLElement {
    const {
      title,
      content,
      footer,
      size = 'md',
      closable = true,
    } = this.props;
    
    // Modal container
    const modal = createElement('div', {
      className: 'modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': title ? 'modal-title' : undefined,
    });
    
    // Backdrop
    this.backdrop = createElement('div', {
      className: 'modal-backdrop',
      'aria-hidden': 'true',
    });
    modal.appendChild(this.backdrop);
    
    // Dialog
    this.dialog = createElement('div', {
      className: `modal-dialog modal-dialog-${size}`,
    });
    
    // Header
    if (title || closable) {
      const header = createElement('div', {
        className: 'modal-header',
      });
      
      if (title) {
        const titleEl = createElement('h2', {
          id: 'modal-title',
          className: 'modal-title',
          textContent: title,
        });
        header.appendChild(titleEl);
      }
      
      if (closable) {
        const closeBtn = createElement('button', {
          className: 'modal-close',
          type: 'button',
          'aria-label': 'Close',
        });
        closeBtn.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        `;
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
      }
      
      this.dialog.appendChild(header);
    }
    
    // Body
    if (content) {
      const body = createElement('div', {
        className: 'modal-body',
      });
      
      if (typeof content === 'string') {
        body.innerHTML = content;
      } else {
        body.appendChild(content);
      }
      
      this.dialog.appendChild(body);
    }
    
    // Footer
    if (footer) {
      const footerEl = createElement('div', {
        className: 'modal-footer',
      });
      footerEl.appendChild(footer);
      this.dialog.appendChild(footerEl);
    }
    
    modal.appendChild(this.dialog);
    
    return modal;
  }
  
  private attachListeners(): void {
    // Close on backdrop click
    if (this.props.closeOnBackdrop !== false) {
      this.backdrop.addEventListener('click', () => this.close());
    }
    
    // Close on escape key
    if (this.props.closeOnEscape !== false) {
      window.addEventListener('keydown', this.handleEscape);
    }
  }
  
  private handleEscape = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  };
  
  public async open(): Promise<void> {
    if (this.isOpen) return;
    
    this.isOpen = true;
    
    // Save current focus
    this.previousFocus = document.activeElement as HTMLElement;
    
    // Append to body
    document.body.appendChild(this.element);
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    
    // Animate in
    await this.animateIn();
    
    // Setup focus trap
    this.setupFocusTrap();
    
    // Focus first focusable element
    this.focusTrap[0]?.focus();
    
    // Callback
    this.props.onOpen?.();
  }
  
  public async close(): Promise<void> {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // Animate out
    await this.animateOut();
    
    // Remove from DOM
    this.element.remove();
    
    // Unlock body scroll
    document.body.style.overflow = '';
    
    // Restore focus
    this.previousFocus?.focus();
    
    // Callback
    this.props.onClose?.();
  }
  
  private async animateIn(): Promise<void> {
    // Backdrop fade in
    this.backdrop.style.opacity = '0';
    await new AnimationChain(this.backdrop)
      .custom(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 300, easing: 'ease-out', fill: 'forwards' }
      )
      .play();
    
    // Dialog spring in
    this.dialog.style.opacity = '0';
    this.dialog.style.transform = 'scale(0.9) translateY(-20px)';
    
    await new AnimationChain(this.dialog)
      .custom(
        [
          { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
          { opacity: 1, transform: 'scale(1) translateY(0)' },
        ],
        {
          duration: 400,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring
          fill: 'forwards',
        }
      )
      .play();
  }
  
  private async animateOut(): Promise<void> {
    // Dialog scale out
    await new AnimationChain(this.dialog)
      .custom(
        [
          { opacity: 1, transform: 'scale(1) translateY(0)' },
          { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
        ],
        { duration: 250, easing: 'ease-in', fill: 'forwards' }
      )
      .play();
    
    // Backdrop fade out
    await new AnimationChain(this.backdrop)
      .custom(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 200, easing: 'ease-in', fill: 'forwards' }
      )
      .play();
  }
  
  private setupFocusTrap(): void {
    // Get all focusable elements
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    
    this.focusTrap = Array.from(
      this.dialog.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
    
    // Trap focus
    this.dialog.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const firstFocusable = this.focusTrap[0];
      const lastFocusable = this.focusTrap[this.focusTrap.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    });
  }
  
  public setContent(content: string | HTMLElement): void {
    const body = this.dialog.querySelector('.modal-body');
    if (!body) return;
    
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.innerHTML = '';
      body.appendChild(content);
    }
  }
  
  public setTitle(title: string): void {
    const titleEl = this.dialog.querySelector('.modal-title');
    if (titleEl) titleEl.textContent = title;
  }
  
  public getElement(): HTMLElement {
    return this.element;
  }
  
  public destroy(): void {
    if (this.isOpen) {
      this.close();
    }
    window.removeEventListener('keydown', this.handleEscape);
  }
}
