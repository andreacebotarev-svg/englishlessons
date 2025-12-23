/**
 * VOCABULARY KANBAN CONTROLLER
 * Manages drag-and-drop interactions and event communication for Kanban board
 */

/* ========================================
   EVENT BUS (Pub/Sub Pattern)
======================================== */

class SimpleEventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners = {};
  }
}

/* ========================================
   KANBAN CONTROLLER
======================================== */

class KanbanController {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.draggedCard = null;
    this.sourceColumn = null;
    this.boundHandlers = {};
    
    console.log('[KanbanController] Initialized');
  }

  /**
   * Attach drag-and-drop listeners to Kanban board
   * @param {HTMLElement} container - Kanban container element
   */
  attach(container) {
    if (!container) {
      console.warn('[KanbanController] Container not found');
      return;
    }

    console.log('[KanbanController] Attaching listeners...');

    // Find all draggable cards
    const cards = container.querySelectorAll('.kanban-card[draggable="true"]');
    const columns = container.querySelectorAll('.kanban-column');
    const resetBtn = container.querySelector('.kanban-reset-btn');

    // Attach card drag listeners
    cards.forEach(card => {
      this._attachCardListeners(card);
    });

    // Attach column drop listeners
    columns.forEach(column => {
      this._attachColumnListeners(column);
    });

    // Attach audio button listeners
    const audioButtons = container.querySelectorAll('.card-audio');
    audioButtons.forEach(btn => {
      const handler = (e) => this._handleAudioClick(e);
      btn.addEventListener('click', handler);
      this.boundHandlers[btn] = handler;
    });

    // Attach reset button listener
    if (resetBtn) {
      const handler = (e) => this._handleResetClick(e);
      resetBtn.addEventListener('click', handler);
      this.boundHandlers[resetBtn] = handler;
    }

    console.log('[KanbanController] Listeners attached:', {
      cards: cards.length,
      columns: columns.length,
      audioButtons: audioButtons.length,
      hasResetBtn: !!resetBtn
    });
  }

  /**
   * Detach all listeners (cleanup)
   */
  detach() {
    console.log('[KanbanController] Detaching listeners...');
    
    // Remove all bound handlers
    Object.keys(this.boundHandlers).forEach(element => {
      if (element && this.boundHandlers[element]) {
        element.removeEventListener('click', this.boundHandlers[element]);
      }
    });
    
    this.boundHandlers = {};
    this.draggedCard = null;
    this.sourceColumn = null;
    
    console.log('[KanbanController] Cleanup complete');
  }

  /* ========================================
     PRIVATE METHODS - Card Listeners
  ======================================== */

  _attachCardListeners(card) {
    // Drag start
    const dragStartHandler = (e) => this._onDragStart(e, card);
    card.addEventListener('dragstart', dragStartHandler);
    this.boundHandlers[`${card}_dragstart`] = dragStartHandler;

    // Drag end
    const dragEndHandler = (e) => this._onDragEnd(e, card);
    card.addEventListener('dragend', dragEndHandler);
    this.boundHandlers[`${card}_dragend`] = dragEndHandler;
  }

  _onDragStart(e, card) {
    this.draggedCard = card;
    this.sourceColumn = card.closest('.kanban-column');
    
    card.classList.add('dragging');
    
    // Set data for compatibility
    const word = card.dataset.word;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', word);
    
    console.log('[KanbanController] Drag started:', word);
  }

  _onDragEnd(e, card) {
    card.classList.remove('dragging');
    
    // Remove drag-over class from all columns
    document.querySelectorAll('.kanban-column.drag-over').forEach(col => {
      col.classList.remove('drag-over');
    });
    
    this.draggedCard = null;
    this.sourceColumn = null;
    
    console.log('[KanbanController] Drag ended');
  }

  /* ========================================
     PRIVATE METHODS - Column Listeners
  ======================================== */

  _attachColumnListeners(column) {
    const columnContent = column.querySelector('.column-content');
    if (!columnContent) return;

    // Drag over
    const dragOverHandler = (e) => this._onDragOver(e, column);
    columnContent.addEventListener('dragover', dragOverHandler);
    this.boundHandlers[`${columnContent}_dragover`] = dragOverHandler;

    // Drag enter
    const dragEnterHandler = (e) => this._onDragEnter(e, column);
    columnContent.addEventListener('dragenter', dragEnterHandler);
    this.boundHandlers[`${columnContent}_dragenter`] = dragEnterHandler;

    // Drag leave
    const dragLeaveHandler = (e) => this._onDragLeave(e, column);
    columnContent.addEventListener('dragleave', dragLeaveHandler);
    this.boundHandlers[`${columnContent}_dragleave`] = dragLeaveHandler;

    // Drop
    const dropHandler = (e) => this._onDrop(e, column);
    columnContent.addEventListener('drop', dropHandler);
    this.boundHandlers[`${columnContent}_drop`] = dropHandler;
  }

  _onDragOver(e, column) {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';
  }

  _onDragEnter(e, column) {
    e.preventDefault();
    
    // Only highlight if dragging a card
    if (this.draggedCard) {
      column.classList.add('drag-over');
    }
  }

  _onDragLeave(e, column) {
    // Only remove highlight if leaving column completely
    const rect = column.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      column.classList.remove('drag-over');
    }
  }

  _onDrop(e, column) {
    e.preventDefault();
    e.stopPropagation();
    
    column.classList.remove('drag-over');
    
    if (!this.draggedCard) {
      console.warn('[KanbanController] No dragged card found on drop');
      return;
    }

    const word = this.draggedCard.dataset.word;
    const oldStatus = this.sourceColumn?.dataset.status;
    const newStatus = column.dataset.status;

    // Check if status changed
    if (oldStatus === newStatus) {
      console.log('[KanbanController] Card dropped in same column, no action needed');
      return;
    }

    console.log('[KanbanController] Card dropped:', {
      word,
      oldStatus,
      newStatus
    });

    // Emit event to LessonEngine
    this.eventBus.emit('kanban:word-moved', {
      word,
      oldStatus,
      newStatus
    });
  }

  /* ========================================
     PRIVATE METHODS - Button Handlers
  ======================================== */

  _handleAudioClick(e) {
    e.stopPropagation();
    
    const card = e.target.closest('.kanban-card');
    if (!card) return;
    
    const word = card.dataset.word;
    
    console.log('[KanbanController] Audio requested:', word);
    
    // Emit event
    this.eventBus.emit('kanban:audio-requested', { word });
  }

  _handleResetClick(e) {
    e.preventDefault();
    
    const confirmed = confirm('Reset all vocabulary progress? This will move all words back to "To Learn".');
    
    if (confirmed) {
      console.log('[KanbanController] Reset requested');
      this.eventBus.emit('kanban:reset-requested');
    }
  }
}

/* ========================================
   EXPORT TO GLOBAL SCOPE
======================================== */

// Make classes available globally for LessonEngine
window.SimpleEventBus = SimpleEventBus;
window.KanbanController = KanbanController;

console.log('[Kanban Module] Loaded successfully');
