/**
 * Flashcards Module - Stage 2
 * Vocabulary learning with card-based interface
 * Added: Card rendering, navigation, touch swipe, progress bar
 */

class FlashcardsManager {
    constructor(vocabularyData) {
        this.vocabulary = vocabularyData || [];
        this.currentMode = 'list'; // 'list' or 'flashcards'
        this.currentCardIndex = 0;
        this.flashcardsContainer = null;
        this.listContainer = null;
        
        // Touch/swipe handling
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        
        console.log('🎴 FlashcardsManager initialized with', this.vocabulary.length, 'words');
    }

    /**
     * Initialize the flashcards system
     * Adds mode toggle buttons to vocabulary section
     */
    init(listContainerId = 'vocabulary-list-container') {
        this.listContainer = document.getElementById(listContainerId);
        
        if (!this.listContainer) {
            console.error('List container not found:', listContainerId);
            return;
        }

        // Create flashcards container
        this.createFlashcardsContainer();
        
        // Create mode toggle buttons
        this.createModeToggle();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
        
        console.log('✅ Flashcards module initialized');
    }

    /**
     * Create HTML structure for flashcards container
     */
    createFlashcardsContainer() {
        // Create container if it doesn't exist
        let container = document.getElementById('flashcards-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'flashcards-container';
            container.className = 'flashcards-container';
            container.style.display = 'none';
            
            // Insert after list container
            if (this.listContainer.parentNode) {
                this.listContainer.parentNode.insertBefore(container, this.listContainer.nextSibling);
            }
        }
        
        this.flashcardsContainer = container;
    }

    /**
     * Create mode toggle buttons (List / Flashcards)
     */
    createModeToggle() {
        // Find or create vocabulary header
        let header = this.listContainer.previousElementSibling;
        
        if (!header || !header.classList.contains('vocabulary-header')) {
            header = document.createElement('div');
            header.className = 'vocabulary-header';
            this.listContainer.parentNode.insertBefore(header, this.listContainer);
        }

        // Add toggle buttons
        const toggleHTML = `
            <div class="vocab-mode-toggle">
                <button class="vocab-mode-btn active" data-mode="list">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z"/>
                    </svg>
                    List
                </button>
                <button class="vocab-mode-btn" data-mode="flashcards">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                    </svg>
                    Flashcards
                </button>
            </div>
        `;

        header.insertAdjacentHTML('beforeend', toggleHTML);

        // Attach event listeners
        header.querySelectorAll('.vocab-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.toggleVocabularyMode(mode);
            });
        });
    }

    /**
     * Toggle between List and Flashcards modes
     * @param {string} mode - 'list' or 'flashcards'
     */
    toggleVocabularyMode(mode) {
        if (mode !== 'list' && mode !== 'flashcards') {
            console.error('Invalid mode:', mode);
            return;
        }

        this.currentMode = mode;
        
        // Update active state of buttons
        document.querySelectorAll('.vocab-mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');

        // Switch visibility
        if (mode === 'list') {
            this.listContainer.style.display = 'block';
            this.flashcardsContainer.style.display = 'none';
        } else {
            this.listContainer.style.display = 'none';
            this.flashcardsContainer.style.display = 'flex';
            this.currentCardIndex = 0; // Reset to first card
            this.renderFlashcardsContainer();
        }

        console.log(`🔄 Switched to ${mode} mode`);
    }

    /**
     * Render flashcards container with cards (Stage 2)
     */
    renderFlashcardsContainer() {
        if (this.vocabulary.length === 0) {
            this.flashcardsContainer.innerHTML = `
                <div class="flashcards-wrapper">
                    <div class="flashcard-placeholder">
                        <div class="placeholder-icon">⚠️</div>
                        <p class="placeholder-title">No vocabulary loaded</p>
                        <p class="placeholder-subtitle">Please add words to start learning</p>
                    </div>
                </div>
            `;
            return;
        }

        this.flashcardsContainer.innerHTML = `
            <div class="flashcards-wrapper">
                <div class="flashcards-header">
                    <h3>📚 Vocabulary Flashcards</h3>
                    <div class="flashcards-controls">
                        <!-- Фильтры и shuffle будут на Этапе 4 -->
                    </div>
                </div>

                <div class="flashcard-stage">
                    <button class="flashcard-nav flashcard-nav-prev" id="flashcard-prev" aria-label="Previous card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>

                    <div class="flashcard-container" id="flashcard-current">
                        <!-- Карточка будет здесь -->
                    </div>

                    <button class="flashcard-nav flashcard-nav-next" id="flashcard-next" aria-label="Next card">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="flashcards-progress">
                    <div class="progress-dots" id="progress-dots"></div>
                    <div class="progress-text" id="progress-text">
                        ${this.currentCardIndex + 1} / ${this.vocabulary.length}
                    </div>
                </div>
            </div>
        `;

        // Render first card
        this.renderCurrentCard();
        
        // Render progress dots
        this.renderProgressDots();
        
        // Update navigation buttons state
        this.updateNavigationButtons();
        
        // Attach navigation event listeners
        this.attachNavigationListeners();
        
        // Setup touch swipe
        this.setupTouchSwipe();
    }

    /**
     * Render the current card based on currentCardIndex
     */
    renderCurrentCard() {
        const cardContainer = document.getElementById('flashcard-current');
        if (!cardContainer) return;

        const word = this.vocabulary[this.currentCardIndex];
        if (!word) return;

        const cardHTML = `
            <div class="flashcard" data-index="${this.currentCardIndex}">
                <div class="flashcard-content">
                    <div class="flashcard-word">${word.word || ''}</div>
                    <div class="flashcard-transcription">${word.transcription || ''}</div>
                    <div class="flashcard-hint">Tap to reveal translation</div>
                </div>
                <div class="flashcard-translation">
                    ${word.translation || ''}
                </div>
            </div>
        `;

        cardContainer.innerHTML = cardHTML;
        
        // Add entrance animation
        setTimeout(() => {
            const card = cardContainer.querySelector('.flashcard');
            if (card) card.classList.add('flashcard-enter');
        }, 10);
    }

    /**
     * Render progress dots indicator
     */
    renderProgressDots() {
        const dotsContainer = document.getElementById('progress-dots');
        if (!dotsContainer) return;

        // Limit dots for large vocabularies (show max 20 dots)
        const maxDots = 20;
        const showDots = this.vocabulary.length <= maxDots;

        if (!showDots) {
            dotsContainer.style.display = 'none';
            return;
        }

        dotsContainer.style.display = 'flex';
        dotsContainer.innerHTML = this.vocabulary
            .map((_, index) => {
                const isActive = index === this.currentCardIndex;
                return `<div class="progress-dot ${isActive ? 'active' : ''}" data-index="${index}"></div>`;
            })
            .join('');

        // Add click handlers to dots
        dotsContainer.querySelectorAll('.progress-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToCard(index));
        });
    }

    /**
     * Update progress text
     */
    updateProgress() {
        const progressText = document.getElementById('progress-text');
        if (progressText) {
            progressText.textContent = `${this.currentCardIndex + 1} / ${this.vocabulary.length}`;
        }

        // Update dots
        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            if (index === this.currentCardIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    /**
     * Update navigation buttons (disable at boundaries)
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('flashcard-prev');
        const nextBtn = document.getElementById('flashcard-next');

        if (prevBtn) {
            prevBtn.disabled = this.currentCardIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentCardIndex === this.vocabulary.length - 1;
        }
    }

    /**
     * Attach navigation event listeners
     */
    attachNavigationListeners() {
        const prevBtn = document.getElementById('flashcard-prev');
        const nextBtn = document.getElementById('flashcard-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateCard('prev'));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateCard('next'));
        }
    }

    /**
     * Navigate to previous or next card
     * @param {string} direction - 'prev' or 'next'
     */
    navigateCard(direction) {
        if (direction === 'prev' && this.currentCardIndex > 0) {
            this.currentCardIndex--;
        } else if (direction === 'next' && this.currentCardIndex < this.vocabulary.length - 1) {
            this.currentCardIndex++;
        } else {
            return; // Already at boundary
        }

        this.renderCurrentCard();
        this.updateProgress();
        this.updateNavigationButtons();

        console.log(`📊 Card ${this.currentCardIndex + 1}/${this.vocabulary.length}`);
    }

    /**
     * Go to specific card by index
     * @param {number} index - Card index
     */
    goToCard(index) {
        if (index < 0 || index >= this.vocabulary.length) return;
        
        this.currentCardIndex = index;
        this.renderCurrentCard();
        this.updateProgress();
        this.updateNavigationButtons();
    }

    /**
     * Setup keyboard navigation (arrow keys)
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only handle keys when in flashcards mode
            if (this.currentMode !== 'flashcards') return;

            switch(e.key) {
                case 'ArrowLeft':
                    this.navigateCard('prev');
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.navigateCard('next');
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * Setup touch swipe navigation for mobile
     */
    setupTouchSwipe() {
        const cardContainer = document.getElementById('flashcard-current');
        if (!cardContainer) return;

        // Touch start
        cardContainer.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        // Touch end
        cardContainer.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;

        if (Math.abs(swipeDistance) < this.minSwipeDistance) {
            return; // Not a swipe, just a tap
        }

        if (swipeDistance > 0) {
            // Swipe right -> previous card
            this.navigateCard('prev');
        } else {
            // Swipe left -> next card
            this.navigateCard('next');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashcardsManager;
}
