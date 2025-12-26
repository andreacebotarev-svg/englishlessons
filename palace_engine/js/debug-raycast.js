/**
 * RAYCAST DEBUGGER
 * Visualizes raycasting and card boundaries
 * Last update: 2025-12-11
 */

export class RaycastDebugger {
  constructor() {
    this.markers = [];
  }

  /**
   * Visualize card bounds with red markers
   */
  visualizeCardBounds() {
    this.clearMarkers();

    const rooms = document.querySelectorAll('.room');
    
    rooms.forEach((room) => {
      const rect = room.getBoundingClientRect();
      
      // Create marker
      const marker = document.createElement('div');
      marker.className = 'debug-marker';
      marker.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 2px solid red;
        pointer-events: none;
        z-index: 9999;
      `;
      
      document.body.appendChild(marker);
      this.markers.push(marker);
    });

    console.log(`Visualized ${this.markers.length} card bounds`);
  }

  /**
   * Clear all debug markers
   */
  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }
}

export default RaycastDebugger;
