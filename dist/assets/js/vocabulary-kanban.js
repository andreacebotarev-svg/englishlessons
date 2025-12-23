/**
 * KANBAN CONTROLLER MODULE
 * Slim controller for Kanban drag-and-drop functionality
 * 
 * Responsibilities:
 * - Handle drag and drop events ONLY
 * - Emit events to LessonEngine via event bus
 * - No rendering, no storage access, no business logic
 * 
 * Architecture: Event-driven, decoupled from other modules
 */

class KanbanController {
  /**
   * Create Kanban controller
   * @param {Object} eventBus - Event bus for communication { on, emit, off }
   */
  constructor(eventBus) {
    if (!eventBus || typeof eventBus.emit !== 'function') {
      throw new Error('KanbanController requires an event bus with emit() method');
    }
    
    this.eventBus = eventBus;
    this.container = null;
    this.draggedCard = null;
    this.sourceColumn = null;
    this.dragStartTime = 0;
    
    // Bind methods to preserve context
    this._handleDragStart = this._handleDragStart.bind(this);
    this._handleDragEnd = this._handleDragEnd.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._handleDragLeave = this._handleDragLeave.bind(this);
    this._handleDrop = this._handleDrop.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  /**
   * Attach drag-and-drop listeners to container
   * @param {HTMLElement} containerElement - Kanban board container
   */
  attach(containerElement) {
    if (!containerElement) {
      console.error('KanbanController: Invalid container element');
      return;
    }
    
    this.detach(); // Clean up previous listeners
    this.container = containerElement;
    
    // Use event delegation for all drag events
    this.container.addEventListener('dragstart', this._handleDragStart);
    this.container.addEventListener('dragend', this._handleDragEnd);
    this.container.addEventListener('dragover', this._handleDragOver);
    this.container.addEventListener('dragleave', this._handleDragLeave);
    this.container.addEventListener('drop', this._handleDrop);
    
    // Button clicks (audio, quick move)
    this.container.addEventListener('click', this._handleClick);
    
    console.log('[KanbanController] Attached to container');
  }

  /**
   * Detach all event listeners and cleanup
   */
  detach() {
    if (!this.container) return;
    
    this.container.removeEventListener('dragstart', this._handleDragStart);
    this.container.removeEventListener('dragend', this._handleDragEnd);
    this.container.removeEventListener('dragover', this._handleDragOver);
    this.container.removeEventListener('dragleave', this._handleDragLeave);
    this.container.removeEventListener('drop', this._handleDrop);
    this.container.removeEventListener('click', this._handleClick);
    
    this.container = null;
    this.draggedCard = null;
    this.sourceColumn = null;
    
    console.log('[KanbanController] Detached from container');
  }

  // ========================================
  // DRAG AND DROP HANDLERS
  // ========================================

  /**
   * Handle drag start on card
   * @private
   */
  _handleDragStart(e) {
    const card = e.target.closest('.kanban-card');
    if (!card) return;
    
    this.draggedCard = card;
    this.sourceColumn = card.closest('.kanban-column');
    this.dragStartTime = Date.now();
    
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.word);
    
    // Emit drag start event (optional, for analytics)
    this.eventBus.emit('kanban:drag-start', {
      word: card.dataset.word,
      sourceStatus: this.sourceColumn?.dataset.status
    });
  }

  /**
   * Handle drag end on card
   * @private
   */
  _handleDragEnd(e) {
    const card = e.target.closest('.kanban-card');
    if (!card) return;
    
    card.classList.remove('dragging');
    
    // Cleanup all drag-over states
    this._cleanupDragStates();
    
    this.draggedCard = null;
    this.sourceColumn = null;
  }

  /**
   * Handle drag over column
   * @private
   */
  _handleDragOver(e) {
    const column = e.target.closest('.kanban-column');
    if (!column) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    column.classList.add('drag-over');
  }

  /**
   * Handle drag leave column
   * @private
   */
  _handleDragLeave(e) {
    const column = e.target.closest('.kanban-column');
    if (!column) return;
    
    // Only remove if actually leaving (not hovering child)
    if (!column.contains(e.relatedTarget)) {
      column.classList.remove('drag-over');
    }
  }

  /**
   * Handle drop on column
   * @private
   */
  _handleDrop(e) {
    const column = e.target.closest('.kanban-column');
    if (!column) return;
    
    e.preventDefault();
    column.classList.remove('drag-over');
    
    if (!this.draggedCard || !this.sourceColumn) return;
    
    const word = this.draggedCard.dataset.word;
    const newStatus = column.dataset.status;
    const oldStatus = this.sourceColumn.dataset.status;
    
    // Don't emit event if dropped in same column
    if (newStatus === oldStatus) {
      console.log('[KanbanController] Dropped in same column, no action');
      return;
    }
    
    // Calculate drag duration for analytics
    const dragDuration = Date.now() - this.dragStartTime;
    
    // Emit event to LessonEngine
    this.eventBus.emit('kanban:word-moved', {
      word,
      oldStatus,
      newStatus,
      dragDuration
    });
    
    console.log(`[KanbanController] Word "${word}" moved: ${oldStatus} → ${newStatus}`);
    
    // Haptic feedback on mobile
    this._vibrate(10);
  }

  /**
   * Handle button clicks (audio, quick move)
   * @private
   */
  _handleClick(e) {
    // Audio button
    const audioBtn = e.target.closest('.card-audio');
    if (audioBtn) {
      e.stopPropagation();
      const card = audioBtn.closest('.kanban-card');
      const word = card?.dataset.word;
      
      if (word) {
        this.eventBus.emit('kanban:audio-requested', { word });
        console.log(`[KanbanController] Audio requested: ${word}`);
      }
      return;
    }
    
    // Quick move button (→)
    const moveBtn = e.target.closest('.card-move');
    if (moveBtn) {
      e.stopPropagation();
      const card = moveBtn.closest('.kanban-card');
      const word = card?.dataset.word;
      const column = card?.closest('.kanban-column');
      const currentStatus = column?.dataset.status;
      
      if (word && currentStatus) {
        const nextStatus = this._getNextStatus(currentStatus);
        
        this.eventBus.emit('kanban:word-moved', {
          word,
          oldStatus: currentStatus,
          newStatus: nextStatus,
          isQuickMove: true
        });
        
        console.log(`[KanbanController] Quick move: ${word} → ${nextStatus}`);
        this._vibrate(10);
      }
      return;
    }
    
    // Reset button
    const resetBtn = e.target.closest('.kanban-reset-btn');
    if (resetBtn) {
      e.stopPropagation();
      
      if (confirm('Reset all word progress? This will move all words back to "To Learn".')) {
        this.eventBus.emit('kanban:reset-requested');
        console.log('[KanbanController] Reset requested');
      }
      return;
    }
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Get next status in progression
   * @param {string} currentStatus
   * @returns {string} Next status
   * @private
   */
  _getNextStatus(currentStatus) {
    const progression = {
      'to-learn': 'learning',
      'learning': 'known',
      'known': 'favorites',
      'favorites': 'known' // Loop back from favorites
    };
    return progression[currentStatus] || 'learning';
  }

  /**
   * Cleanup all drag-over states
   * @private
   */
  _cleanupDragStates() {
    if (!this.container) return;
    
    this.container.querySelectorAll('.kanban-column.drag-over').forEach(col => {
      col.classList.remove('drag-over');
    });
  }

  /**
   * Vibrate device (if supported)
   * @param {number} duration - Duration in milliseconds
   * @private
   */
  _vibrate(duration = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  /**
   * Destroy controller and cleanup
   */
  destroy() {
    this.detach();
    this.eventBus = null;
    console.log('[KanbanController] Destroyed');
  }
}

// ========================================
// SIMPLE EVENT BUS IMPLEMENTATION
// ========================================

/**
 * Lightweight event bus for component communication
 * Avoids tight coupling between modules
 */
class SimpleEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} [event] - Event name (optional)
   */
  clear(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KanbanController, SimpleEventBus };
}