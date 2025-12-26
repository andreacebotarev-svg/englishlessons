// palace_engine/js/quiz-manager.js

import { CONFIG } from './config.js';
import { CameraState } from './camera.js';

export const GameState = {
  totalWords: 0,
  attempted: 0,
  correct: 0,
  errors: 0,
  hints: 0,
  cheats: 0,
  
  get accuracy() {
    return this.attempted > 0 
      ? Math.round((this.correct / this.attempted) * 100) 
      : 0;
  },
  
  currentStreak: 0,
  maxStreak: 0,
  startTime: null,
  endTime: null,
  timerInterval: null,
  
  get duration() {
    if (!this.startTime) return 0;
    const end = this.endTime || Date.now();
    return Math.round((end - this.startTime) / 1000);
  },
  
  startTimer() {
    if (!this.startTime) {
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => updateTimerDisplay(), 1000);
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

export const SoundEffects = {
  audioContext: null,
  
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  playSuccess() {
    this.init();
    const ctx = this.audioContext;
    const now = ctx.currentTime;
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

const Achievements = [
  { 
    id: 'first_success', 
    name: 'Первые успехи', 
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

export class QuizManager {
  constructor(camera) {
    this.camera = camera;
    this.currentCard = null;
    this.currentAttempts = 0;
    console.log('🎮 QuizManager initialized with Smart Validation + TRANSITION_MODE');
  }
  
  initQuiz(card) {
    const distance = this.camera.getDistanceToCard(card);
    if (distance > 2000) {
      console.warn(`❌ Too far to start quiz (${Math.round(distance)}px)`);
      return;
    }
    
    console.log(`📝 Opening quiz for: "${card.dataset.word}"`);
    
    CameraState.mode = 'QUIZ_MODE';
    CameraState.activeCard = card;
    
    this.camera.keys.forward = false;
    this.camera.keys.backward = false;
    this.camera.keys.left = false;
    this.camera.keys.right = false;
    this.camera.keys.sprint = false;
    this.camera.velocity.x = 0;
    this.camera.velocity.y = 0;
    this.camera.velocity.z = 0;
    
    console.log('🛑 Movement STOPPED');
    
    this.currentCard = card;
    this.currentAttempts = 0;
    
    const example = card.querySelector('.room-card__example');
    if (example) example.style.display = 'none';
    
    const quiz = card.querySelector('.room-card__quiz');
    if (quiz) {
      quiz.style.display = 'flex';
      const input = quiz.querySelector('.room-card__input');
      if (input) {
        CameraState.activeInput = input;
        input.value = '';
        input.focus();
        const hint = quiz.querySelector('.room-card__hint');
        if (hint) hint.style.display = 'none';
      }
    }
    
    card.dataset.state = 'quiz';
    GameState.startTimer();
    
    const stats = document.getElementById('quiz-stats');
    if (stats) stats.style.display = 'block';
    
    console.log('🎮 Entered QUIZ_MODE');
  }
  
  checkAnswer(card, userInput) {
    const correctAnswer = (card.dataset.translation || '').toLowerCase().trim();
    const userAnswer = userInput.toLowerCase().trim();
    
    const normalize = (str) => str
      .replace(/[.,!?;:()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    
    console.log('═══════════════════════════════════════');
    console.log('📝 User input:', userAnswer);
    console.log('✅ Correct answer:', correctAnswer);
    console.log('🔍 Normalized user:', normalizedUser);
    console.log('🔍 Normalized correct:', normalizedCorrect);
    
    if (normalizedUser === normalizedCorrect) {
      console.log('✅ Full exact match!');
      console.log('═══════════════════════════════════════');
      return this.handleCorrect(card);
    }
    
    const separators = /[\/,;|]/;
    const variants = normalizedCorrect
      .split(separators)
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    console.log('🔍 Variants:', variants);
    
    if (variants.some(variant => normalizedUser === variant)) {
      console.log('✅ Partial match (variant accepted)!');
      console.log('═══════════════════════════════════════');
      return this.handleCorrect(card);
    }
    
    if (normalizedUser.length >= 5) {
      const maxDistance = Math.floor(normalizedUser.length * 0.2);
      
      console.log('🔍 Checking typos (max distance:', maxDistance + ')');
      
      for (const variant of variants) {
        if (variant.length < 5) {
          console.log(`  ⏭️ Skipping short word: "${variant}"`);
          continue;
        }
        
        const distance = this.levenshteinDistance(normalizedUser, variant);
        console.log(`  📏 "${normalizedUser}" ↔ "${variant}": distance = ${distance}`);
        
        if (distance <= maxDistance) {
          console.log(`  ✅ Typo accepted! (distance: ${distance} ≤ ${maxDistance})`);
          console.log('═══════════════════════════════════════');
          return this.handleCorrect(card);
        }
      }
    } else {
      console.log('⏭️ Input too short for typo check (< 5 chars)');
    }
    
    console.log('❌ No match found');
    console.log('═══════════════════════════════════════');
    return this.handleIncorrect(card);
  }
  
  levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
  
  // ════════════════════════════════════════════════════════════
  // 🚀 TRANSITION_MODE: предотвращает съезжание камеры
  // ════════════════════════════════════════════════════════════
  handleCorrect(card) {
    GameState.correct++;
    GameState.currentStreak++;
    if (GameState.currentStreak > GameState.maxStreak) {
      GameState.maxStreak = GameState.currentStreak;
    }
    
    this.playSuccessAnimation(card);
    SoundEffects.playSuccess();
    this.spawnSuccessParticles(card);
    console.log(`✅ Correct! Streak: ${GameState.currentStreak}`);
    
    // ════════════════════════════════════════════════════════════
    // ✅ СРАЗУ переходим в TRANSITION_MODE
    // ════════════════════════════════════════════════════════════
    CameraState.mode = 'TRANSITION_MODE';
    CameraState.activeInput = null;  // Отключаем input
    
    // ✅ Скрываем quiz UI сразу
    const quiz = card.querySelector('.room-card__quiz');
    if (quiz) quiz.style.display = 'none';
    const example = card.querySelector('.room-card__example');
    if (example) example.style.display = 'block';
    
    console.log('🎮 Entered TRANSITION_MODE (movement allowed)');
    
    // ════════════════════════════════════════════════════════════
    // ⏱️ Через 1.5 сек завершаем переход в IDLE
    // ════════════════════════════════════════════════════════════
    setTimeout(() => {
      CameraState.mode = 'IDLE';
      CameraState.activeCard = null;
      card.dataset.state = 'idle';
      this.currentCard = null;
      this.currentAttempts = 0;
      console.log('🎮 Exited TRANSITION_MODE → IDLE');
    }, 1500);
    
    GameState.attempted++;
    this.updateStats();
    this.checkAchievements();
  }
  
  handleIncorrect(card) {
    GameState.errors++;
    GameState.currentStreak = 0;
    this.currentAttempts++;
    
    this.playErrorAnimation(card);
    SoundEffects.playError();
    this.showHint(card, this.currentAttempts);
    console.log(`❌ Wrong! Attempts: ${this.currentAttempts}`);
    
    GameState.attempted++;
    this.updateStats();
    this.checkAchievements();
  }
  
  showHint(card, level) {
    const hint = card.querySelector('.room-card__hint');
    if (!hint) return;
    const correctAnswer = card.dataset.translation || '';
    const firstLetter = correctAnswer[0] || '';
    const wordLength = correctAnswer.length;
    let hintText = '';
    if (level === 1) {
      hintText = `💡 Подсказка: Первая буква — "${firstLetter}"`;
    } else if (level === 2) {
      const masked = firstLetter + '_'.repeat(wordLength - 1);
      hintText = `💡 Подсказка: ${masked} (${wordLength} букв)`;
    } else {
      hintText = `📜 Правильный ответ: ${correctAnswer}`;
    }
    hint.textContent = hintText;
    hint.style.display = 'block';
    GameState.hints++;
  }
  
  playSuccessAnimation(card) {
    card.classList.add('room-card--success');
    const icon = card.querySelector('.room-card__status-icon');
    if (icon) {
      icon.className = 'room-card__status-icon room-card__status-icon--success';
      setTimeout(() => icon.className = 'room-card__status-icon', 1000);
    }
    setTimeout(() => card.classList.remove('room-card--success'), 600);
  }
  
  playErrorAnimation(card) {
    card.classList.add('room-card--error');
    const icon = card.querySelector('.room-card__status-icon');
    if (icon) {
      icon.className = 'room-card__status-icon room-card__status-icon--error';
      setTimeout(() => icon.className = 'room-card__status-icon', 1000);
    }
    setTimeout(() => card.classList.remove('room-card--error'), 600);
  }
  
  spawnSuccessParticles(card) {
    const emojis = ['✨', '⭐', '🌟', '💫', '🎉', '🎊', '✅', '💚'];
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = (i / 8) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 1000);
    }
  }
  
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
  
  revealTranslation(card) {
    const translation = card.querySelector('.room-card__translation');
    const example = card.querySelector('.room-card__example');
    const quiz = card.querySelector('.room-card__quiz');
    if (translation) translation.style.display = 'block';
    if (example) example.style.display = 'none';
    if (quiz) quiz.style.display = 'none';
    card.dataset.state = 'revealed';
    GameState.cheats++;
    CameraState.mode = 'IDLE';
    CameraState.activeCard = null;
    CameraState.activeInput = null;
    console.log(`👁️ Revealed: "${card.dataset.translation}"`);
    console.log('🎮 Exited QUIZ_MODE');
  }
  
  hideTranslation(card) {
    const translation = card.querySelector('.room-card__translation');
    const example = card.querySelector('.room-card__example');
    const quiz = card.querySelector('.room-card__quiz');
    
    if (translation) translation.style.display = 'none';
    if (example) example.style.display = 'block';
    if (quiz) quiz.style.display = 'none';
    
    card.dataset.state = 'idle';
    
    if (CameraState.mode === 'QUIZ_MODE' && CameraState.activeCard === card) {
      CameraState.mode = 'IDLE';
      CameraState.activeCard = null;
      CameraState.activeInput = null;
    }
    
    console.log(`🔒 Translation hidden for: "${card.dataset.word}"`);
  }
  
  // ════════════════════════════════════════════════════════════
  // 🔧 CLOSEQ UIZ: с принудительным сбросом keys/velocity
  // ════════════════════════════════════════════════════════════
  closeQuiz(card) {
    CameraState.mode = 'IDLE';
    CameraState.activeCard = null;
    CameraState.activeInput = null;
    
    // ✅ ПРИНУДИТЕЛЬНЫЙ СБРОС ВСЕХ КЛАВИШ
    this.camera.keys.forward = false;
    this.camera.keys.backward = false;
    this.camera.keys.left = false;
    this.camera.keys.right = false;
    this.camera.keys.sprint = false;
    
    // ✅ СБРОС VELOCITY (предотвращает drift)
    this.camera.velocity.x = 0;
    this.camera.velocity.y = 0;
    this.camera.velocity.z = 0;
    
    const quiz = card.querySelector('.room-card__quiz');
    if (quiz) quiz.style.display = 'none';
    const example = card.querySelector('.room-card__example');
    if (example) example.style.display = 'block';
    card.dataset.state = 'idle';
    this.currentCard = null;
    this.currentAttempts = 0;
    
    console.log('🎮 Exited QUIZ_MODE (keys + velocity reset)');
  }
  
  checkAchievements() {
    Achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition()) {
        achievement.unlocked = true;
        this.showAchievement(achievement);
      }
    });
  }
  
  showAchievement(achievement) {
    const toast = document.getElementById('achievement-toast');
    if (!toast) return;
    toast.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div>${achievement.name}</div>
      <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">${achievement.desc}</div>
    `;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
    console.log(`🏆 Achievement unlocked: ${achievement.name}`);
  }
}

function updateTimerDisplay() {
  const timer = document.getElementById('timer');
  if (!timer) return;
  const seconds = GameState.duration;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}