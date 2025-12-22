/**
 * Lesson Select Page
 * Displays available lessons with progress
 */

import { BasePage, EmptyParams } from '@/core/types';
import { lessonLoader } from '@/entities/dictionary';
import { sessionStore } from '@/entities/session';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { createElement, html } from '@/shared/lib/dom';
import { RoutePaths } from '@/core/routes';
import './LessonSelectPage.css';

export class LessonSelectPage extends BasePage<EmptyParams> {
  async render(): Promise<void> {
    this.container.innerHTML = html`
      <div class="lesson-select-page">
        <header class="page-header">
          <h1>📚 English Phonics Trainer</h1>
          <p>Выберите урок для изучения</p>
        </header>
        
        <div id="stats-section"></div>
        <div id="lessons-grid"></div>
      </div>
    `;
    
    await this.renderStats();
    await this.renderLessons();
  }
  
  private async renderStats(): Promise<void> {
    const container = this.container.querySelector('#stats-section')!;
    const stats = sessionStore.getStats();
    
    const statsCard = createElement('div', {
      className: 'stats-card',
    });
    
    statsCard.innerHTML = html`
      <div class="stat-item">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-value">${stats.totalScore}</div>
          <div class="stat-label">Очков</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">${stats.totalWords}</div>
          <div class="stat-label">Слов изучено</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <div class="stat-value">${stats.totalLessons}</div>
          <div class="stat-label">Уроков пройдено</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <div class="stat-value">${Math.floor(stats.totalPlaytime / 60)}</div>
          <div class="stat-label">Минут игры</div>
        </div>
      </div>
    `;
    
    container.appendChild(statsCard);
  }
  
  private async renderLessons(): Promise<void> {
    const container = this.container.querySelector('#lessons-grid')!;
    
    try {
      const lessons = await lessonLoader.getAllMeta();
      const stats = sessionStore.getStats();
      
      lessons.forEach((lesson) => {
        const progress = stats.lessonProgress[lesson.id];
        const isCompleted = progress && progress.completedWords === progress.totalWords;
        const stars = progress?.stars || 0;
        
        // Badge text and variant
        let badgeText = 'Новый';
        let badgeVariant: 'primary' | 'success' | 'warning' = 'primary';
        
        if (isCompleted) {
          badgeText = `${stars} ⭐`;
          badgeVariant = stars === 3 ? 'success' : 'warning';
        } else if (progress) {
          badgeText = `${progress.completedWords}/${progress.totalWords}`;
          badgeVariant = 'warning';
        }
        
        const card = new Card({
          title: lesson.title,
          description: lesson.description,
          icon: lesson.emoji || '📝',
          badge: badgeText,
          badgeVariant,
          variant: 'gradient',
          hoverable: true,
          clickable: true,
          footer: `💬 ${lesson.wordCount} слов • ⏱️ ${lesson.estimatedTime || 10} мин`,
          onClick: () => {
            this.eventBus.emit('router:navigate', {
              path: RoutePaths.lesson(lesson.id),
            });
            window.location.hash = RoutePaths.lesson(lesson.id);
          },
        });
        
        container.appendChild(card.getElement());
      });
    } catch (error) {
      console.error('Failed to load lessons:', error);
      container.innerHTML = html`
        <div class="error-message">
          <h3>🚨 Ошибка загрузки уроков</h3>
          <p>Не удалось загрузить список уроков. Попробуйте обновить страницу.</p>
        </div>
      `;
    }
  }
}
