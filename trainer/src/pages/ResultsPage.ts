/**
 * Results Page
 * Displays lesson completion results with stars and stats
 */

import { BasePage, EmptyParams } from '@/core/types';
import { sessionStore } from '@/entities/session';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { createElement, html } from '@/shared/lib/dom';
import { AnimationChain } from '@/shared/lib/animations';
import { RoutePaths } from '@/core/routes';
import './ResultsPage.css';

export class ResultsPage extends BasePage<EmptyParams> {
  async render(): Promise<void> {
    const state = sessionStore.getState();
    const stats = sessionStore.getStats();
    
    if (!state.lessonId) {
      // No active session, redirect home
      window.location.hash = RoutePaths.home;
      return;
    }
    
    const lessonProgress = stats.lessonProgress[state.lessonId];
    const stars = lessonProgress?.stars || 0;
    const completedWords = state.completedWords.size;
    const totalWords = state.currentWordIndex + 1;
    const percentage = Math.round((completedWords / totalWords) * 100);
    
    this.container.innerHTML = html`
      <div class="results-page">
        <div class="results-card" id="results-card">
          <h1 class="results-title">🎉 Урок завершён!</h1>
          
          <div class="stars-display" id="stars-display">
            <div class="star">⭐</div>
            <div class="star">⭐</div>
            <div class="star">⭐</div>
          </div>
          
          <div class="score-display">
            <div class="score-value">${state.score}</div>
            <div class="score-label">Очков</div>
          </div>
          
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">✅</div>
              <div class="stat-value">${completedWords}/${totalWords}</div>
              <div class="stat-label">Слов выучено</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">${percentage}%</div>
              <div class="stat-label">Точность</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">${state.currentAttempt.attempts || 0}</div>
              <div class="stat-label">Попыток</div>
            </div>
          </div>
          
          <div class="actions" id="actions"></div>
        </div>
      </div>
    `;
    
    // Animate stars
    this.animateStars(stars);
    
    // Render buttons
    this.renderActions();
  }
  
  private async animateStars(earnedStars: number): Promise<void> {
    const starsDisplay = this.container.querySelector('#stars-display')!;
    const stars = Array.from(starsDisplay.querySelectorAll('.star'));
    
    // Initially hide all stars
    stars.forEach(star => {
      (star as HTMLElement).style.opacity = '0';
      (star as HTMLElement).style.filter = 'grayscale(100%)';
    });
    
    // Animate earned stars one by one
    for (let i = 0; i < earnedStars; i++) {
      const star = stars[i] as HTMLElement;
      
      await new AnimationChain(star)
        .custom(
          [
            { opacity: 0, transform: 'scale(0) rotate(0deg)', filter: 'grayscale(100%)' },
            { opacity: 1, transform: 'scale(1.2) rotate(360deg)', filter: 'grayscale(0%)' },
            { opacity: 1, transform: 'scale(1) rotate(360deg)', filter: 'grayscale(0%)' },
          ],
          {
            duration: 600,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'forwards',
          }
        )
        .delay(200)
        .play();
    }
  }
  
  private renderActions(): void {
    const container = this.container.querySelector('#actions')!;
    
    // Retry button
    const retryBtn = new Button({
      text: 'Повторить урок',
      variant: 'primary',
      icon: '🔄',
      onClick: () => {
        const state = sessionStore.getState();
        if (state.lessonId) {
          window.location.hash = RoutePaths.lesson(state.lessonId);
        }
      },
    });
    container.appendChild(retryBtn.getElement());
    
    // Home button
    const homeBtn = new Button({
      text: 'Выбрать другой урок',
      variant: 'secondary',
      icon: '🏠',
      onClick: () => {
        window.location.hash = RoutePaths.home;
      },
    });
    container.appendChild(homeBtn.getElement());
  }
}
