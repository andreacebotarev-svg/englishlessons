/**
 * Components Demo Page
 * Interactive showcase for all UI components
 */

import { BasePage, EmptyParams } from '@/core/types';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Progress } from '@/shared/ui/Progress';
import { Modal } from '@/shared/ui/Modal';
import { createElement, html } from '@/shared/lib/dom';
import { sleep } from '@/shared/lib/utils';
import './ComponentsDemoPage.css';

export class ComponentsDemoPage extends BasePage<EmptyParams> {
  private progress: Progress | null = null;
  
  async render(): Promise<void> {
    this.container.innerHTML = html`
      <div class="demo-page">
        <header class="demo-header">
          <h1>🎨 UI Components Showcase</h1>
          <p>Premium glassmorphism design system</p>
        </header>
        
        <div class="demo-content" id="demo-sections"></div>
      </div>
    `;
    
    const sections = this.container.querySelector('#demo-sections')!;
    
    // Render all sections
    sections.appendChild(this.renderButtonsSection());
    sections.appendChild(this.renderCardsSection());
    sections.appendChild(this.renderBadgesSection());
    sections.appendChild(this.renderProgressSection());
    sections.appendChild(this.renderModalsSection());
  }
  
  private renderButtonsSection(): HTMLElement {
    const section = createElement('section', {
      className: 'demo-section',
    });
    
    section.innerHTML = html`
      <h2>🔘 Buttons</h2>
      <p class="demo-description">Ripple effects, haptic feedback, loading states</p>
    `;
    
    // Variants
    const variantsGrid = createElement('div', {
      className: 'demo-grid',
    });
    
    const variants = [
      { variant: 'primary' as const, icon: '🚀', text: 'Primary' },
      { variant: 'secondary' as const, icon: '⚙️', text: 'Secondary' },
      { variant: 'success' as const, icon: '✅', text: 'Success' },
      { variant: 'danger' as const, icon: '🗑️', text: 'Danger' },
      { variant: 'ghost' as const, icon: '👻', text: 'Ghost' },
    ];
    
    variants.forEach(({ variant, icon, text }) => {
      const btn = new Button({
        text,
        variant,
        icon,
        onClick: async () => {
          console.log(`${text} clicked`);
          await sleep(1000);
        },
      });
      variantsGrid.appendChild(btn.getElement());
    });
    
    section.appendChild(variantsGrid);
    
    // Sizes
    const sizesLabel = createElement('h3', { textContent: 'Sizes' });
    section.appendChild(sizesLabel);
    
    const sizesGrid = createElement('div', {
      className: 'demo-grid',
    });
    
    ['sm', 'md', 'lg'].forEach((size) => {
      const btn = new Button({
        text: size.toUpperCase(),
        size: size as any,
        icon: '📏',
      });
      sizesGrid.appendChild(btn.getElement());
    });
    
    section.appendChild(sizesGrid);
    
    // States
    const statesLabel = createElement('h3', { textContent: 'States' });
    section.appendChild(statesLabel);
    
    const statesGrid = createElement('div', {
      className: 'demo-grid',
    });
    
    const loadingBtn = new Button({
      text: 'Loading',
      variant: 'primary',
      loading: true,
    });
    statesGrid.appendChild(loadingBtn.getElement());
    
    const disabledBtn = new Button({
      text: 'Disabled',
      variant: 'secondary',
      disabled: true,
    });
    statesGrid.appendChild(disabledBtn.getElement());
    
    const fullWidthBtn = new Button({
      text: 'Full Width',
      variant: 'success',
      fullWidth: true,
      icon: '📱',
    });
    statesGrid.appendChild(fullWidthBtn.getElement());
    
    section.appendChild(statesGrid);
    
    return section;
  }
  
  private renderCardsSection(): HTMLElement {
    const section = createElement('section', {
      className: 'demo-section',
    });
    
    section.innerHTML = html`
      <h2>🎴 Cards</h2>
      <p class="demo-description">3D hover, glow effects, glassmorphism</p>
    `;
    
    const grid = createElement('div', {
      className: 'demo-grid demo-grid-3',
    });
    
    // Default card
    const card1 = new Card({
      title: 'Default Card',
      description: 'Basic card with glassmorphism effect',
      icon: '📄',
      badge: 'New',
      badgeVariant: 'primary',
      variant: 'default',
      hoverable: true,
    });
    grid.appendChild(card1.getElement());
    
    // Gradient card
    const card2 = new Card({
      title: 'Gradient Card',
      description: 'Card with gradient background',
      icon: '🌈',
      badge: '12 items',
      badgeVariant: 'success',
      variant: 'gradient',
      hoverable: true,
      clickable: true,
      onClick: () => console.log('Card clicked'),
    });
    grid.appendChild(card2.getElement());
    
    // Bordered card
    const card3 = new Card({
      title: 'Bordered Card',
      description: 'Card with colored border',
      icon: '✨',
      badge: 'Premium',
      badgeVariant: 'warning',
      variant: 'bordered',
      hoverable: true,
      footer: '⏱️ 10 minutes',
    });
    grid.appendChild(card3.getElement());
    
    section.appendChild(grid);
    
    return section;
  }
  
  private renderBadgesSection(): HTMLElement {
    const section = createElement('section', {
      className: 'demo-section',
    });
    
    section.innerHTML = html`
      <h2>🏷️ Badges</h2>
      <p class="demo-description">Glow effects, pulse animations</p>
    `;
    
    const grid = createElement('div', {
      className: 'demo-grid demo-badges-grid',
    });
    
    const badges = [
      { variant: 'primary' as const, text: 'Primary', icon: '🔵' },
      { variant: 'secondary' as const, text: 'Secondary', icon: '⚪' },
      { variant: 'success' as const, text: 'Success', icon: '✅', glow: true },
      { variant: 'warning' as const, text: 'Warning', icon: '⚠️' },
      { variant: 'danger' as const, text: 'Danger', icon: '❌' },
      { variant: 'info' as const, text: 'Info', icon: 'ℹ️', pulse: true },
    ];
    
    badges.forEach(({ variant, text, icon, glow, pulse }) => {
      const badge = new Badge({
        text,
        variant,
        icon,
        glow,
        pulse,
      });
      grid.appendChild(badge.getElement());
    });
    
    section.appendChild(grid);
    
    // Sizes
    const sizesLabel = createElement('h3', { textContent: 'Sizes' });
    section.appendChild(sizesLabel);
    
    const sizesGrid = createElement('div', {
      className: 'demo-grid demo-badges-grid',
    });
    
    ['sm', 'md', 'lg'].forEach((size) => {
      const badge = new Badge({
        text: `Size ${size.toUpperCase()}`,
        variant: 'primary',
        size: size as any,
      });
      sizesGrid.appendChild(badge.getElement());
    });
    
    section.appendChild(sizesGrid);
    
    return section;
  }
  
  private renderProgressSection(): HTMLElement {
    const section = createElement('section', {
      className: 'demo-section',
    });
    
    section.innerHTML = html`
      <h2>📊 Progress Bars</h2>
      <p class="demo-description">Smooth animations, striped patterns</p>
    `;
    
    const container = createElement('div', {
      className: 'demo-progress-container',
    });
    
    // Basic progress
    const progress1 = new Progress({
      value: 75,
      variant: 'primary',
      showLabel: true,
    });
    const label1 = createElement('div', {
      className: 'demo-progress-label',
      textContent: 'Primary (75%)',
    });
    container.appendChild(label1);
    container.appendChild(progress1.getElement());
    
    // Striped progress
    const progress2 = new Progress({
      value: 60,
      variant: 'success',
      showLabel: true,
      striped: true,
    });
    const label2 = createElement('div', {
      className: 'demo-progress-label',
      textContent: 'Success Striped (60%)',
    });
    container.appendChild(label2);
    container.appendChild(progress2.getElement());
    
    // Animated striped progress
    const progress3 = new Progress({
      value: 45,
      variant: 'warning',
      showLabel: true,
      striped: true,
      animated: true,
    });
    const label3 = createElement('div', {
      className: 'demo-progress-label',
      textContent: 'Warning Animated (45%)',
    });
    container.appendChild(label3);
    container.appendChild(progress3.getElement());
    
    // Interactive progress
    this.progress = new Progress({
      value: 0,
      variant: 'danger',
      showLabel: true,
      animated: true,
    });
    const label4 = createElement('div', {
      className: 'demo-progress-label',
      textContent: 'Interactive (click buttons below)',
    });
    container.appendChild(label4);
    container.appendChild(this.progress.getElement());
    
    const buttonsGrid = createElement('div', {
      className: 'demo-grid',
      style: 'margin-top: 1rem',
    });
    
    const incrementBtn = new Button({
      text: '+10',
      variant: 'success',
      size: 'sm',
      onClick: () => {
        const current = this.progress?.getValue() || 0;
        this.progress?.setValue(Math.min(100, current + 10));
      },
    });
    buttonsGrid.appendChild(incrementBtn.getElement());
    
    const decrementBtn = new Button({
      text: '-10',
      variant: 'danger',
      size: 'sm',
      onClick: () => {
        const current = this.progress?.getValue() || 0;
        this.progress?.setValue(Math.max(0, current - 10));
      },
    });
    buttonsGrid.appendChild(decrementBtn.getElement());
    
    const resetBtn = new Button({
      text: 'Reset',
      variant: 'secondary',
      size: 'sm',
      onClick: () => {
        this.progress?.setValue(0);
      },
    });
    buttonsGrid.appendChild(resetBtn.getElement());
    
    container.appendChild(buttonsGrid);
    
    section.appendChild(container);
    
    return section;
  }
  
  private renderModalsSection(): HTMLElement {
    const section = createElement('section', {
      className: 'demo-section',
    });
    
    section.innerHTML = html`
      <h2>🪟 Modals</h2>
      <p class="demo-description">Spring animations, focus trap, backdrop blur</p>
    `;
    
    const grid = createElement('div', {
      className: 'demo-grid',
    });
    
    // Small modal
    const smallModalBtn = new Button({
      text: 'Small Modal',
      variant: 'primary',
      icon: '📦',
      onClick: () => {
        const modal = new Modal({
          title: 'Small Modal',
          content: 'This is a small modal window.',
          size: 'sm',
        });
        modal.open();
      },
    });
    grid.appendChild(smallModalBtn.getElement());
    
    // Medium modal
    const mediumModalBtn = new Button({
      text: 'Medium Modal',
      variant: 'success',
      icon: '📄',
      onClick: () => {
        const footerContent = createElement('div');
        const closeBtn = new Button({
          text: 'Close',
          variant: 'secondary',
          onClick: () => modal.close(),
        });
        footerContent.appendChild(closeBtn.getElement());
        
        const modal = new Modal({
          title: 'Lesson Complete! 🎉',
          content: html`
            <p>Congratulations! You've completed the lesson.</p>
            <p><strong>Score:</strong> 95/100</p>
            <p><strong>Stars:</strong> ⭐⭐⭐</p>
          `,
          footer: footerContent,
          size: 'md',
        });
        modal.open();
      },
    });
    grid.appendChild(mediumModalBtn.getElement());
    
    // Large modal
    const largeModalBtn = new Button({
      text: 'Large Modal',
      variant: 'warning',
      icon: '📋',
      onClick: () => {
        const modal = new Modal({
          title: 'Large Modal with Content',
          content: html`
            <h3>Lorem Ipsum</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
            <h3>More Content</h3>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa.</p>
          `,
          size: 'lg',
        });
        modal.open();
      },
    });
    grid.appendChild(largeModalBtn.getElement());
    
    section.appendChild(grid);
    
    return section;
  }
}
