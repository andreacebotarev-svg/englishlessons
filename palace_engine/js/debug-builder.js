/**
 * BUILDER DEBUGGER
 * Validates cards and provides scene geometry mapping
 * Last update: 2025-12-11
 */

export class BuilderDebugger {
  constructor() {
    this.cards = [];
  }

  /**
   * Show scene map - display all card positions
   */
  showSceneMap() {
    const rooms = document.querySelectorAll('.room');
    
    console.log('=== SCENE MAP ===');
    console.log(`Total cards: ${rooms.length}`);
    
    rooms.forEach((room, index) => {
      const position = room.dataset.position;
      const word = room.dataset.word;
      const visibility = room.style.visibility;
      const state = room.dataset.state;
      
      console.log(`Card ${index}: "${word}" at Z=-${position} (visible: ${visibility !== 'hidden'}, state: ${state})`);
    });
    
    return {
      totalCards: rooms.length,
      visibleCards: Array.from(rooms).filter(r => r.style.visibility !== 'hidden').length
    };
  }

  /**
   * Validate card positions and state
   */
  validateCards() {
    const rooms = document.querySelectorAll('.room');
    const errors = [];

    rooms.forEach((room, index) => {
      // Check required attributes
      if (!room.dataset.word) {
        errors.push(`Card ${index}: Missing word attribute`);
      }
      if (!room.dataset.position) {
        errors.push(`Card ${index}: Missing position attribute`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      totalCards: rooms.length
    };
  }
}

export default BuilderDebugger;
