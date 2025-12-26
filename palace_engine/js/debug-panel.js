/**
 * DEBUG PANEL
 * Visual debug panel with performance stats
 * Last update: 2025-12-11
 */

export class DebugPanel {
  constructor() {
    this.visible = true;
    this.element = null;
    this.camera = null;
    this.gameLoop = null;
    this.cameraDebugger = null;
    this.builderDebugger = null;
  }

  /**
   * Set dependencies
   */
  setDependencies(camera, gameLoop, cameraDebugger, builderDebugger) {
    this.camera = camera;
    this.gameLoop = gameLoop;
    this.cameraDebugger = cameraDebugger;
    this.builderDebugger = builderDebugger;
    
    this.createPanel();
  }

  /**
   * Create debug panel UI
   */
  createPanel() {
    if (this.element) return;

    this.element = document.createElement('div');
    this.element.id = 'debug-panel';
    this.element.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      min-width: 200px;
      user-select: none;
      border: 1px solid rgba(0, 255, 0, 0.3);
    `;

    this.element.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: bold; color: #FFD60A;">DEBUG PANEL</div>
      <div>FPS: <span id="debug-fps" style="font-weight: bold;">--</span></div>
      <div>Camera: <span id="debug-camera">--</span></div>
      <div style="margin-top: 5px; font-size: 10px; opacity: 0.5;">Press G to toggle</div>
    `;

    document.body.appendChild(this.element);
    
    // Update every 100ms
    setInterval(() => this.update(), 100);
  }

  /**
   * Update panel data
   */
  update() {
    if (!this.element || !this.visible) return;

    // Update FPS
    const fpsSpan = document.getElementById('debug-fps');
    if (fpsSpan && this.gameLoop) {
      const fps = this.gameLoop.getFPS?.() || 0;
      fpsSpan.textContent = fps;
      
      // Color based on FPS
      if (fps >= 55) {
        fpsSpan.style.color = '#0f0';
      } else if (fps >= 30) {
        fpsSpan.style.color = '#ff0';
      } else {
        fpsSpan.style.color = '#f00';
      }
    }

    // Update camera info
    const cameraSpan = document.getElementById('debug-camera');
    if (cameraSpan && this.camera) {
      cameraSpan.textContent = `Z=${Math.round(this.camera.z)}`;
    }
  }

  /**
   * Update FPS display
   */
  updateFPS(fps) {
    const fpsSpan = document.getElementById('debug-fps');
    if (fpsSpan) {
      fpsSpan.textContent = fps;
    }
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    this.visible = !this.visible;
    if (this.element) {
      this.element.style.display = this.visible ? 'block' : 'none';
    }
  }

  /**
   * Toggle grid (placeholder)
   */
  toggleGrid() {
    console.log('Grid toggle not implemented yet');
  }
}

export default DebugPanel;
