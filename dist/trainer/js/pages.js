import { dom, animate, array, calculateStars, formatTime } from './utils.js';

export class Pages {
  constructor(storage, lessonLoader, router) {
    this.storage = storage;
    this.lessonLoader = lessonLoader;
    this.router = router;
    this.currentLesson = null;
    this.currentWordIndex = 0;
    this.selectedPhonemes = [];
    this.score = 0;
    this.correctAnswers = 0;
    this.startTime = null;
  }

  // Lesson Selection Page
  async renderLessonSelect() {
    const app = document.getElementById('app');
    dom.clear(app);

    const page = dom.create('div', 'page');
    const container = dom.create('div', 'container');

    // Header
    const header = this.createHeader(
      '🎓 Тренажёр чтения',
      'Изучай буквы и слова на английском'
    );
    container.appendChild(header);

    // Stats Dashboard
    const stats = this.storage.getStats();
    const dashboard = this.createStatsDashboard(stats);
    container.appendChild(dashboard);

    // Lesson Grid
    const lessonGrid = dom.create('div', 'lesson-grid');
    
    try {
      const lessons = await this.lessonLoader.loadAllLessons();
      
      lessons.forEach(lesson => {
        const card = this.createLessonCard(lesson);
        lessonGrid.appendChild(card);
      });
    } catch (error) {
      console.error('Failed to load lessons:', error);
      lessonGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Ошибка загрузки уроков</p>';
    }

    container.appendChild(lessonGrid);
    page.appendChild(container);
    app.appendChild(page);
  }

  createHeader(title, subtitle) {
    const header = dom.create('div', 'header');
    const h1 = dom.create('h1', '', title);
    const p = dom.create('p', '', subtitle);
    header.appendChild(h1);
    header.appendChild(p);
    return header;
  }

  createStatsDashboard(stats) {
    const dashboard = dom.create('div', 'stats-dashboard');
    
    const statsData = [
      { label: 'Очки', value: stats.totalScore, emoji: '🎯' },
      { label: 'Слова', value: stats.totalWords, emoji: '📚' },
      { label: 'Уроки', value: stats.totalLessons, emoji: '⭐' }
    ];

    statsData.forEach(stat => {
      const card = dom.create('div', 'stat-card glass-card');
      card.innerHTML = `
        <span class="stat-value">${stat.emoji} ${stat.value}</span>
        <span class="stat-label">${stat.label}</span>
      `;
      dashboard.appendChild(card);
    });

    return dashboard;
  }

  createLessonCard(lesson) {
    const card = dom.create('div', 'lesson-card');
    const progress = this.storage.getLessonProgress(lesson.id);
    const progressPercent = progress.totalWords > 0 
      ? (progress.completedWords / progress.totalWords) * 100 
      : 0;

    card.innerHTML = `
      <span class="lesson-card-emoji">${lesson.emoji}</span>
      <h3 class="lesson-card-title">${lesson.title}</h3>
      <p class="lesson-card-description">${lesson.description}</p>
      <div class="lesson-card-meta">
        <div class="lesson-card-words">
          <span>📝 ${lesson.wordCount} слов</span>
        </div>
        <div class="stars">
          ${this.createStarsHTML(progress.stars)}
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
      <p class="lesson-card-time">⏱ ${formatTime(lesson.estimatedTime)}</p>
    `;

    card.addEventListener('click', () => {
      this.router.navigate(`/lesson/${lesson.id}`);
    });

    // Accessibility
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Урок: ${lesson.title}`);
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.router.navigate(`/lesson/${lesson.id}`);
      }
    });

    return card;
  }

  createStarsHTML(count) {
    return Array(3).fill(0).map((_, i) => 
      `<span class="star ${i < count ? 'active' : ''}">⭐</span>`
    ).join('');
  }

  // Lesson Trainer Page
  async renderLessonTrainer(params) {
    const lessonId = parseInt(params.id);
    
    try {
      this.currentLesson = await this.lessonLoader.loadLesson(lessonId);
      this.currentWordIndex = 0;
      this.selectedPhonemes = [];
      this.score = 0;
      this.correctAnswers = 0;
      this.startTime = Date.now();

      const app = document.getElementById('app');
      dom.clear(app);

      const page = dom.create('div', 'page');
      const container = dom.create('div', 'container');

      // Header with back button
      const header = dom.create('div', 'header');
      const backBtn = dom.create('button', 'btn btn-ghost');
      backBtn.innerHTML = '← Назад';
      backBtn.onclick = () => this.router.navigate('/');
      header.appendChild(backBtn);

      const title = dom.create('h1', '', this.currentLesson.title);
      const rule = dom.create('p', '', `💡 ${this.currentLesson.rule}`);
      header.appendChild(title);
      header.appendChild(rule);
      container.appendChild(header);

      // Progress
      const progressContainer = dom.create('div', 'glass-card');
      progressContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
          <span>🎯 Очки: <strong id="score">0</strong></span>
          <span id="progress-text">1 / ${this.currentLesson.words.length}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      `;
      container.appendChild(progressContainer);

      // Word display area
      const wordArea = dom.create('div', 'glass-card word-display');
      wordArea.id = 'word-area';
      container.appendChild(wordArea);

      // Phoneme slots
      const slotsContainer = dom.create('div', 'phoneme-slots');
      slotsContainer.id = 'phoneme-slots';
      container.appendChild(slotsContainer);

      // Phoneme bank
      const bankContainer = dom.create('div', 'phoneme-bank');
      bankContainer.id = 'phoneme-bank';
      container.appendChild(bankContainer);

      // Check button
      const btnContainer = dom.create('div', '');
      btnContainer.style.textAlign = 'center';
      btnContainer.style.marginTop = '2rem';
      
      const checkBtn = dom.create('button', 'btn btn-primary');
      checkBtn.id = 'check-btn';
      checkBtn.textContent = 'Проверить';
      checkBtn.disabled = true;
      checkBtn.onclick = () => this.checkAnswer();
      btnContainer.appendChild(checkBtn);
      container.appendChild(btnContainer);

      page.appendChild(container);
      app.appendChild(page);

      // Render first word
      this.renderWord();
    } catch (error) {
      console.error('Failed to load lesson:', error);
      this.router.navigate('/');
    }
  }

  renderWord() {
    const word = this.currentLesson.words[this.currentWordIndex];
    
    // Update word display
    const wordArea = document.getElementById('word-area');
    wordArea.innerHTML = `
      <div class="word-emoji">${word.emoji || '📚'}</div>
      <div class="word-translation">${word.translation}</div>
      <div class="word-transcription">${word.transcription}</div>
    `;

    // Reset selected phonemes
    this.selectedPhonemes = [];

    // Render phoneme slots
    const slotsContainer = document.getElementById('phoneme-slots');
    dom.clear(slotsContainer);
    word.phonemes.forEach((_, index) => {
      const slot = dom.create('div', 'phoneme-slot');
      slot.dataset.index = index;
      slotsContainer.appendChild(slot);
    });

    // Render phoneme bank
    this.renderPhonemeBank(word);

    // Update progress
    this.updateProgress();

    // Disable check button
    document.getElementById('check-btn').disabled = true;
  }

  renderPhonemeBank(word) {
    const bankContainer = document.getElementById('phoneme-bank');
    dom.clear(bankContainer);

    // Get correct phonemes
    const correctPhonemes = [...word.phonemes];
    
    // Add 2-3 distractor phonemes
    const allPhonemes = this.currentLesson.phonemesSet;
    const distractors = allPhonemes
      .filter(p => !correctPhonemes.includes(p))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle
    const allOptions = array.shuffle([...correctPhonemes, ...distractors]);

    allOptions.forEach(phoneme => {
      const btn = dom.create('button', 'phoneme-button');
      btn.textContent = phoneme;
      btn.dataset.phoneme = phoneme;
      btn.onclick = () => this.selectPhoneme(phoneme, btn);
      
      // Accessibility
      btn.setAttribute('aria-label', `Буква ${phoneme}`);
      
      bankContainer.appendChild(btn);
    });
  }

  selectPhoneme(phoneme, button) {
    const word = this.currentLesson.words[this.currentWordIndex];
    
    // Check if we have space
    if (this.selectedPhonemes.length >= word.phonemes.length) {
      return;
    }

    // Add phoneme
    this.selectedPhonemes.push(phoneme);
    button.classList.add('used');

    // Update slot
    const slots = document.querySelectorAll('.phoneme-slot');
    const currentSlot = slots[this.selectedPhonemes.length - 1];
    currentSlot.textContent = phoneme;
    currentSlot.classList.add('filled');

    // Check if word is complete
    if (this.selectedPhonemes.length === word.phonemes.length) {
      document.getElementById('check-btn').disabled = false;
    }
  }

  checkAnswer() {
    const word = this.currentLesson.words[this.currentWordIndex];
    const isCorrect = this.selectedPhonemes.join('') === word.phonemes.join('');

    const slots = document.getElementById('phoneme-slots');
    const checkBtn = document.getElementById('check-btn');

    if (isCorrect) {
      // Success
      this.correctAnswers++;
      this.score += 10;
      document.getElementById('score').textContent = this.score;
      
      animate.success(slots);
      checkBtn.classList.add('btn-success');
      checkBtn.textContent = 'Правильно! ✓';

      // Move to next word
      setTimeout(() => {
        this.currentWordIndex++;
        
        if (this.currentWordIndex < this.currentLesson.words.length) {
          checkBtn.classList.remove('btn-success');
          checkBtn.textContent = 'Проверить';
          this.renderWord();
        } else {
          this.finishLesson();
        }
      }, 1500);
    } else {
      // Error
      animate.error(slots);
      
      // Reset and try again
      setTimeout(() => {
        this.selectedPhonemes = [];
        document.querySelectorAll('.phoneme-slot').forEach(slot => {
          slot.textContent = '';
          slot.classList.remove('filled');
        });
        document.querySelectorAll('.phoneme-button').forEach(btn => {
          btn.classList.remove('used');
        });
        checkBtn.disabled = true;
      }, 600);
    }
  }

  updateProgress() {
    const current = this.currentWordIndex + 1;
    const total = this.currentLesson.words.length;
    const percent = (current / total) * 100;

    document.getElementById('progress-text').textContent = `${current} / ${total}`;
    document.getElementById('progress-fill').style.width = `${percent}%`;
  }

  finishLesson() {
    const stars = calculateStars(this.correctAnswers, this.currentLesson.words.length);
    
    // Save result
    this.storage.saveLessonResult(this.currentLesson.id, {
      score: this.score,
      stars: stars,
      completedWords: this.correctAnswers,
      totalWords: this.currentLesson.words.length
    });

    // Navigate to results
    this.router.navigate('/results');
  }

  // Results Page
  renderResults() {
    const app = document.getElementById('app');
    dom.clear(app);

    const page = dom.create('div', 'page');
    const container = dom.create('div', 'container');

    const resultsCard = dom.create('div', 'glass-card');
    resultsCard.style.textAlign = 'center';
    resultsCard.style.maxWidth = '600px';
    resultsCard.style.margin = '2rem auto';

    const stars = calculateStars(this.correctAnswers, this.currentLesson.words.length);
    
    resultsCard.innerHTML = `
      <h1 style="font-size: 3rem; margin-bottom: 2rem;">🎉 Урок завершён!</h1>
      <div class="stars" style="justify-content: center; font-size: 3rem; margin: 2rem 0;">
        ${this.createStarsHTML(stars)}
      </div>
      <div style="font-size: 3rem; font-weight: 700; margin: 2rem 0;">
        🎯 ${this.score} очков
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 2rem 0;">
        <div>
          <div style="font-size: 2rem;">${this.correctAnswers}</div>
          <div style="color: var(--color-text-muted);">Слова выучены</div>
        </div>
        <div>
          <div style="font-size: 2rem;">${Math.round((this.correctAnswers / this.currentLesson.words.length) * 100)}%</div>
          <div style="color: var(--color-text-muted);">Точность</div>
        </div>
      </div>
    `;

    const btnContainer = dom.create('div', '');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '1rem';
    btnContainer.style.justifyContent = 'center';
    btnContainer.style.marginTop = '2rem';

    const retryBtn = dom.create('button', 'btn btn-secondary');
    retryBtn.textContent = 'Повторить урок';
    retryBtn.onclick = () => this.router.navigate(`/lesson/${this.currentLesson.id}`);

    const homeBtn = dom.create('button', 'btn btn-primary');
    homeBtn.textContent = 'Выбрать урок';
    homeBtn.onclick = () => this.router.navigate('/');

    btnContainer.appendChild(retryBtn);
    btnContainer.appendChild(homeBtn);
    resultsCard.appendChild(btnContainer);

    container.appendChild(resultsCard);
    page.appendChild(container);
    app.appendChild(page);

    // Animate stars
    setTimeout(() => {
      const starElements = resultsCard.querySelectorAll('.star.active');
      starElements.forEach((star, index) => {
        setTimeout(() => {
          star.style.animation = 'starPop 600ms cubic-bezier(0.34, 1.56, 0.64, 1)';
        }, index * 200);
      });
    }, 300);
  }
}