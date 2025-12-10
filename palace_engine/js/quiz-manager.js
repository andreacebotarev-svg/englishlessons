// palace_engine/js/quiz-manager.js

import { CONFIG } from './config.js';

/**
 * 📊 Состояние игры
 */
export const GameState = {
  totalWords: 0,
  attempted: 0,      // Попыток ответить
  correct: 0,        // Правильных ответов
  errors: 0,         // Ошибок
  hints: 0,          // Использовано подсказок
  cheats: 0,         // Использовано ПКМ для просмотра перевода
  
  // Точность
  get accuracy() {
    return this.attempted > 0 
      ? Math.round((this.correct / this.attempted) * 100) 
      : 0;
  },
  
  // Серия (подряд правильных)
  currentStreak: 0,
  maxStreak: 0,
  
  // Таймер
  startTime: null,
  endTime: null,
  timerInterval: null,
  
  get duration() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return Math.round((end - this.startTime) / 1000); // секунды
  },
  
  startTimer() {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => {
        updateTimerDisplay();
      }, 1000);
    }
  },
  
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.endTime = Date.now();
  }
};

/**
 * 🎵 Звуковые эффекты
 */
export const SoundEffects = {
  audioContext: null,
  
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  /**
   * ✅ Звук успеха (мажорный аккорд)
   */
  playSuccess() {
    this.init();
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // C Major chord (До-Ми-Соль)
    [261.63, 329.63, 392.00].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.05);
      osc.stop(now + 0.6);
    });
  },
  
  /**
   * ❌ Звук ошибки (диссонанс)
   */
  playError() {
    this.init();
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  },
  
  /**
   * 🎯 Звук клика
   */
  playClick() {
    this.init();
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
};

/**
 * 🏆 Достижения
 */
const Achievements = [
  { 
    id: 'first_blood', 
    name: 'Первая кровь', 
    desc: 'Угадай первое слово',
    icon: '🎯',
    condition: () => GameState.correct >= 1,
    unlocked: false
  },
  { 
    id: 'perfectionist', 
    name: 'Перфекционист', 
    desc: '10 ответов подряд без ошибок',
    icon: '💯',
    condition: () => GameState.currentStreak >= 10,
    unlocked: false
  },
  { 
    id: 'speedrunner', 
    name: 'Спидраннер', 
    desc: '20 слов за 2 минуты',
    icon: '⚡',
    condition: () => GameState.correct >= 20 && GameState.duration <= 120,
    unlocked: false
  },
  { 
    id: 'linguist', 
    name: 'Лингвист', 
    desc: '100% точность на 30+ словах',
    icon: '🎓',
    condition: () => GameState.attempted >= 30 && GameState.accuracy === 100,
    unlocked: false
  }
];

/**
 * 🎮 Quiz Manager
 */
export class QuizManager {
  constructor(camera) {
    this.camera = camera;
    this.currentCard = null;
    this.currentAttempts = 0; // Количество попыток для текущей карточки
    console.log('🎮 QuizManager initialized');
  }
  
  /**
   * 📝 Открыть quiz-режим
   */
  initQuiz(card) {
    console.log(`📝 Opening quiz for: "${card.dataset.word}"`);
    
    this.currentCard = card;
    this.currentAttempts = 0;
    
    // Скрыть пример
    const example = card.querySelector('.room-card__example');
    if (example) example.style.display = 'none';
    
    // Показать quiz-блок
    const quiz = card.querySelector('.room-card__quiz');
    if (quiz) {
      quiz.style.display = 'flex';
      
      const input = quiz.querySelector('.room-card__input');
      if (input) {
        input.value = '';
        input.focus();
        
        // Очистить подсказку
        const hint = quiz.querySelector('.room-card__hint');
        if (hint) hint.style.display = 'none';
      }
    }
    
    card.dataset.state = 'quiz';
    
    // Запустить таймер (если первая попытка)
    GameState.startTimer();
    
    // Показать статистику
    const stats = document.getElementById('quiz-stats');
    if (stats) stats.style.display = 'block';
  }
  
  /**
   * ✅ Проверить ответ
   */
  checkAnswer(card, userInput) {
    const correctAnswer = (card.dataset.translation || '').toLowerCase().trim();
    const userAnswer = userInput.toLowerCase().trim();
    
    // Нормализация (убрать знаки препинания)
    const normalize = (str) => str.replace(/[.,!?;:]/g, '');
    
    const isCorrect = normalize(userAnswer) === normalize(correctAnswer);
    
    if (isCorrect) {
      // ✅ ПРАВИЛЬНО
      GameState.correct++;
      GameState.currentStreak++;
      
      if (GameState.currentStreak > GameState.maxStreak) {
        GameState.maxStreak = GameState.currentStreak;
      }
      
      this.playSuccessAnimation(card);
      SoundEffects.playSuccess();
      this.spawnSuccessParticles(card);
      
      console.log(`✅ Correct! Streak: ${GameState.currentStreak}`);
      
      // Автоматически закрыть quiz через 1.5s
      setTimeout(() => this.closeQuiz(card), 1500);
      
    } else {
      // ❌ НЕПРАВИЛЬНО
      GameState.errors++;
      GameState.currentStreak = 0;
      this.currentAttempts++;
      
      this.playErrorAnimation(card);
      SoundEffects.playError();
      
      // Показать подсказку
      this.showHint(card, this.currentAttempts);
      
      console.log(`❌ Wrong! Attempts: ${this.currentAttempts}`);
    }
    
    GameState.attempted++;
    this.updateStats();
    this.checkAchievements();
  }
  
  /**
   * 💡 Показать подсказку
   */
  showHint(card, level) {
    const hint = card.querySelector('.room-card__hint');
    if (!hint) return;
    
    const correctAnswer = card.dataset.translation || '';
    const firstLetter = correctAnswer[0] || '';
    const wordLength = correctAnswer.length;
    
    let hintText = '';
    
    switch(level) {
      case 1:
        // Первая буква
        hintText = `💡 Подсказка: Первая буква — "${firstLetter}"`;
        break;
      case 2:
        // Длина слова
        const masked = firstLetter + '_'.repeat(wordLength - 1);
        hintText = `💡 Подсказка: ${masked} (${wordLength} букв)`;
        break;
      default:
        // Полный ответ
        hintText = `📜 Правильный ответ: ${correctAnswer}`;
        break;
    }
    
    hint.textContent = hintText;
    hint.style.display = 'block';
    GameState.hints++;
  }
  
  /**
   * 🟢 Анимация успеха
   */
  playSuccessAnimation(card) {
    card.classList.add('room-card--success');
    
    // Показать иконку
    const icon = card.querySelector('.room-card__status-icon');
    if (icon) {
      icon.className = 'room-card__status-icon room-card__status-icon--success';
      setTimeout(() => {
        icon.className = 'room-card__status-icon';
      }, 1000);
    }
    
    setTimeout(() => {
      card.classList.remove('room-card--success');
    }, 600);
  }
  
  /**
   * 🔴 Анимация ошибки
   */
  playErrorAnimation(card) {
    card.classList.add('room-card--error');
    
    // Показать иконку
    const icon = card.querySelector('.room-card__status-icon');
    if (icon) {
      icon.className = 'room-card__status-icon room-card__status-icon--error';
      setTimeout(() => {
        icon.className = 'room-card__status-icon';
      }, 1000);
    }
    
    setTimeout(() => {
      card.classList.remove('room-card--error');
    }, 600);
  }
  
  /**
   * ✨ Создать частицы успеха
   */
  spawnSuccessParticles(card) {
    const emojis = ['✨', '⭐', '🌟', '💫', '🎉', '🎊', '✅', '💚'];
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Случайное направление (360 градусов)
      const angle = (i / 8) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      document.body.appendChild(particle);
      
      // Удалить после анимации
      setTimeout(() => particle.remove(), 1000);
    }
  }
  
  /**
   * 📊 Обновить статистику
   */
  updateStats() {
    const accuracy = document.getElementById('accuracy');
    const correct = document.getElementById('correct');
    const errors = document.getElementById('errors');
    const streak = document.getElementById('streak');
    
    if (accuracy) accuracy.textContent = `${GameState.accuracy}%`;
    if (correct) correct.textContent = GameState.correct;
    if (errors) errors.textContent = GameState.errors;
    if (streak) streak.textContent = `${GameState.currentStreak}🔥`;
  }
  
  /**
   * 🔊 Озвучить слово
   */
  speakWord(word) {
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
    
    console.log(`🔊 Speaking: "${word}"`);
  }
  
  /**
   * 👁️ Показать перевод (читерство)
   */
  revealTranslation(card) {
    const translation = card.querySelector('.room-card__translation');
    const example = card.querySelector('.room-card__example');
    const quiz = card.querySelector('.room-card__quiz');
    
    if (translation) {
      translation.style.display = 'block';
    }
    if (example) {
      example.style.display = 'none';
    }
    if (quiz) {
      quiz.style.display = 'none';
    }
    
    card.dataset.state = 'revealed';
    
    console.log(`👁️ Revealed translation: "${card.dataset.translation}"`);
  }
  
  /**
   * ❌ Закрыть quiz-режим
   */
  closeQuiz(card) {
    const quiz = card.querySelector('.room-card__quiz');
    if (quiz) quiz.style.display = 'none';
    
    const example = card.querySelector('.room-card__example');
    if (example) example.style.display = 'block';
    
    card.dataset.state = 'idle';
    this.currentCard = null;
    this.currentAttempts = 0;
  }
  
  /**
   * 🏆 Проверить достижения
   */
  checkAchievements() {
    Achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition()) {
        achievement.unlocked = true;
        this.showAchievement(achievement);
      }
    });
  }
  
  /**
   * 🏆 Показать достижение
   */
  showAchievement(achievement) {
    const toast = document.getElementById('achievement-toast');
    if (!toast) return;
    
    toast.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div>${achievement.name}</div>
      <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">${achievement.desc}</div>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
    
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }
}

/**
 * ⏰ Обновить отображение таймера
 */
function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  if (!timer) return;
  
  const seconds = GameState.duration;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}