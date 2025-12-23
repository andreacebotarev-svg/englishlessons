/**
 * Flashcards Module - Stage 1
 * Vocabulary learning with card-based interface
 */

class FlashcardsManager {
    constructor(vocabularyData) {
        this.vocabulary = vocabularyData || [];
        this.currentMode = 'list'; // 'list' or 'flashcards'
        this.currentCardIndex = 0;
        this.flashcardsContainer = null;
        this.listContainer = null;
        
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
            this.renderFlashcardsContainer();
        }

        console.log(`🔄 Switched to ${mode} mode`);
    }

    /**
     * Render flashcards container with placeholder (Stage 1)
     */
    renderFlashcardsContainer() {
        this.flashcardsContainer.innerHTML = `
            <div class="flashcards-wrapper">
                <div class="flashcards-header">
                    <h3>📚 Vocabulary Flashcards</h3>
                    <div class="flashcards-controls">
                        <!-- Filters and shuffle будут на Этапе 4 -->
                    </div>
                </div>

                <div class="flashcard-stage">
                    <button class="flashcard-nav flashcard-nav-prev" id="flashcard-prev">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>

                    <div class="flashcard-container" id="flashcard-current">
                        <!-- Карточка будет рендериться здесь на Этапе 2 -->
                        <div class="flashcard-placeholder">
                            <div class="placeholder-icon">🎴</div>
                            <p class="placeholder-title">Flashcards Mode Activated!</p>
                            <p class="placeholder-subtitle">Cards will appear here in Stage 2</p>
                            <div class="placeholder-info">
                                <span>📊 ${this.vocabulary.length} words loaded</span>
                            </div>
                        </div>
                    </div>

                    <button class="flashcard-nav flashcard-nav-next" id="flashcard-next">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="flashcards-progress">
                    <div class="progress-dots" id="progress-dots">
                        <!-- Dots будут на Этапе 2 -->
                    </div>
                    <div class="progress-text" id="progress-text">
                        0 / ${this.vocabulary.length}
                    </div>
                </div>
            </div>
        `;

        // Attach navigation event listeners (placeholders for Stage 2)
        document.getElementById('flashcard-prev')?.addEventListener('click', () => {
            console.log('⬅️ Previous card - будет реализовано на Этапе 2');
        });

        document.getElementById('flashcard-next')?.addEventListener('click', () => {
            console.log('➡️ Next card - будет реализовано на Этапе 2');
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashcardsManager;
}
