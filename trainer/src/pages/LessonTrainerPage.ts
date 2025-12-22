/**
 * Lesson Trainer Page
 * Main game page with phoneme assembly
 */

import { BasePage, LessonParams } from '@/core/types';
import { lessonLoader, type Lesson, type Word } from '@/entities/dictionary';
import { sessionStore } from '@/entities/session';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Progress } from '@/shared/ui/Progress';
import { createElement, html } from '@/shared/lib/dom';
import { shuffle } from '@/shared/lib/utils';
import { animateSuccess, animateError } from '@/shared/lib/animations';
import { RoutePaths } from '@/core/routes';
import './LessonTrainerPage.css';

export class LessonTrainerPage extends BasePage<LessonParams> {
  private lesson: Lesson | null = null;
  private currentWord: Word | null = null;
  private currentWordIndex = 0;
  private selectedPhonemes: string[] = [];
  private progress: Progress | null = null;
  private score = 0;
  
  async render(): Promise<void> {
    try {
      const lessonId = parseInt(this.params.id);
      this.lesson = await lessonLoader.load(lessonId);
      
      // Start session
      sessionStore.startLesson(lessonId);
      
      // Render UI
      this.renderUI();
      
      // Load first word
      this.loadWord(0);
      
    } catch (error) {
      this.renderError(error);
    }
  }
  
  private renderUI(): void {
    if (!this.lesson) return;
    
    this.container.innerHTML = html`
      <div class="lesson-trainer-page">
        <header class="trainer-header">
          <button id="back-button" class="back-button" aria-label="Вернуться">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="header-info">
            <h1>${this.lesson.emoji} ${this.lesson.title}</h1>
            <p>${this.lesson.rule}</p>
          </div>
          <div class="score-badge" id="score-badge"></div>
        </header>
        
        <div id="progress-section"></div>
        
        <main class="trainer-main">
          <div class="word-display" id="word-display"></div>
          <div class="phoneme-slots" id="phoneme-slots"></div>
          <div class="phoneme-bank" id="phoneme-bank"></div>
          <div class="actions" id="actions"></div>
        </main>
      </div>
    `;
    
    // Back button
    const backBtn = this.container.querySelector('#back-button')!;
    backBtn.addEventListener('click', () => {
      window.location.hash = RoutePaths.home;
    });
    
    // Progress bar
    const progressSection = this.container.querySelector('#progress-section')!;
    this.progress = new Progress({
      value: 0,
      max: this.lesson.words.length,
      variant: 'success',
      showLabel: true,
      animated: true,
    });
    progressSection.appendChild(this.progress.getElement());
    
    // Score badge
    const scoreBadge = new Badge({
      text: `🎯 ${this.score}`,
      variant: 'primary',
      size: 'lg',
      glow: true,
    });
    this.container.querySelector('#score-badge')!.appendChild(scoreBadge.getElement());
  }
  
  private loadWord(index: number): void {
    if (!this.lesson || index >= this.lesson.words.length) {
      this.finishLesson();
      return;
    }
    
    this.currentWordIndex = index;
    this.currentWord = this.lesson.words[index];
    this.selectedPhonemes = [];
    
    // Update progress
    this.progress?.setValue(index);
    
    // Render word
    this.renderWordDisplay();
    this.renderPhonemeSlots();
    this.renderPhonemeBank();
    this.renderActions();
    
    // Update session
    sessionStore.nextWord();
  }
  
  private renderWordDisplay(): void {
    if (!this.currentWord) return;
    
    const container = this.container.querySelector('#word-display')!;
    
    container.innerHTML = html`
      <div class="word-card">
        <div class="word-icon">${this.currentWord.emoji || '📝'}</div>
        <div class="word-content">
          <div class="word-translation">${this.currentWord.translation}</div>
          <div class="word-transcription">${this.currentWord.transcription}</div>
        </div>
      </div>
    `;
  }
  
  private renderPhonemeSlots(): void {
    if (!this.currentWord) return;
    
    const container = this.container.querySelector('#phoneme-slots')!;
    container.innerHTML = '';
    
    this.currentWord.phonemes.forEach((_, index) => {
      const slot = createElement('div', {
        className: 'phoneme-slot',
        textContent: this.selectedPhonemes[index] || '',
      });
      
      if (this.selectedPhonemes[index]) {
        slot.classList.add('filled');
      }
      
      container.appendChild(slot);
    });
  }
  
  private renderPhonemeBank(): void {
    if (!this.currentWord) return;
    
    const container = this.container.querySelector('#phoneme-bank')!;
    container.innerHTML = '';
    
    // Shuffle phonemes with some distractors
    const correctPhonemes = [...this.currentWord.phonemes];
    const distractors = this.lesson!.phonemesSet.filter(
      p => !correctPhonemes.includes(p)
    ).slice(0, 3);
    
    const allPhonemes = shuffle([...correctPhonemes, ...distractors]);
    
    allPhonemes.forEach((phoneme) => {
      const button = new Button({
        text: phoneme,
        variant: 'ghost',
        size: 'lg',
        onClick: () => this.selectPhoneme(phoneme),
      });
      
      container.appendChild(button.getElement());
    });
  }
  
  private renderActions(): void {
    const container = this.container.querySelector('#actions')!;
    container.innerHTML = '';
    
    // Clear button
    const clearBtn = new Button({
      text: 'Очистить',
      variant: 'secondary',
      icon: '❌',
      onClick: () => this.clearSelection(),
    });
    container.appendChild(clearBtn.getElement());
    
    // Check button
    const checkBtn = new Button({
      text: 'Проверить',
      variant: 'primary',
      icon: '✅',
      onClick: () => this.checkAnswer(),
      disabled: this.selectedPhonemes.length !== this.currentWord!.phonemes.length,
    });
    container.appendChild(checkBtn.getElement());
  }
  
  private selectPhoneme(phoneme: string): void {
    if (!this.currentWord) return;
    if (this.selectedPhonemes.length >= this.currentWord.phonemes.length) return;
    
    this.selectedPhonemes.push(phoneme);
    sessionStore.addPhoneme(phoneme);
    
    this.renderPhonemeSlots();
    this.renderActions();
  }
  
  private clearSelection(): void {
    this.selectedPhonemes = [];
    sessionStore.clearPhonemes();
    
    this.renderPhonemeSlots();
    this.renderActions();
  }
  
  private async checkAnswer(): Promise<void> {
    if (!this.currentWord) return;
    
    const isCorrect = this.selectedPhonemes.join('') === this.currentWord.phonemes.join('');
    const slots = this.container.querySelector('#phoneme-slots')!;
    
    if (isCorrect) {
      // Success!
      await animateSuccess(slots as HTMLElement);
      
      const points = 10;
      this.score += points;
      sessionStore.setAnswerCorrect(true, points);
      
      // Update score badge
      const scoreBadge = this.container.querySelector('#score-badge')!;
      scoreBadge.innerHTML = '';
      const newBadge = new Badge({
        text: `🎯 ${this.score}`,
        variant: 'success',
        size: 'lg',
        glow: true,
      });
      scoreBadge.appendChild(newBadge.getElement());
      
      // Next word after delay
      setTimeout(() => {
        this.loadWord(this.currentWordIndex + 1);
      }, 1000);
      
    } else {
      // Wrong answer
      await animateError(slots as HTMLElement);
      sessionStore.setAnswerCorrect(false);
      
      // Clear and try again
      setTimeout(() => {
        this.clearSelection();
      }, 500);
    }
  }
  
  private finishLesson(): void {
    sessionStore.endLesson();
    window.location.hash = RoutePaths.results;
  }
  
  private renderError(error: unknown): void {
    this.container.innerHTML = html`
      <div class="error-page">
        <h1>🚨 Ошибка</h1>
        <p>Не удалось загрузить урок</p>
        <button onclick="window.location.hash='/'">Вернуться</button>
      </div>
    `;
  }
}
