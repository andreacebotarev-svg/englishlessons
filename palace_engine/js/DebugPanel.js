/* ============================================
   DEBUG PANEL FOR GAMELOOP MONITORING
   Last update: 2025-12-11
   ============================================ */

/**
 * Простая debug-панель для мониторинга GameLoop
 * 
 * Показывает:
 * - Текущий FPS (с цветовой индикацией)
 * - Target FPS
 * - Toggle клавишей 'G'
 */
export class DebugPanel {
  constructor(gameLoop) {
    this.gameLoop = gameLoop;
    this.element = this.createPanel();
    this.visible = true;
    this.updateInterval = null;
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'game-loop-debug';
    panel.style.cssText = `
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
      min-width: 150px;
      user-select: none;
      border: 1px solid rgba(0, 255, 0, 0.3);
    `;
    
    panel.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: bold; color: #FFD60A;">⚙️ GAME LOOP</div>
      <div>FPS: <span id="debug-fps" style="font-weight: bold;">--</span></div>
      <div style="opacity: 0.7;">Target: ${this.gameLoop.targetFPS}</div>
      <div style="margin-top: 5px; font-size: 10px; opacity: 0.5;">
        Press 'G' to toggle
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Обработчик клавиши G для toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'g' || e.key === 'G') {
        this.toggle();
      }
    });
    
    // Обновляем FPS каждые 100ms
    this.updateInterval = setInterval(() => {
      const fpsSpan = document.getElementById('debug-fps');
      if (fpsSpan) {
        const fps = this.gameLoop.getFPS();
        fpsSpan.textContent = fps;
        
        // Цвет в зависимости от FPS
        if (fps >= 55) {
          fpsSpan.style.color = '#0f0'; // Зелёный
        } else if (fps >= 30) {
          fpsSpan.style.color = '#ff0'; // Жёлтый
        } else {
          fpsSpan.style.color = '#f00'; // Красный
        }
      }
    }, 100);
    
    return panel;
  }

  toggle() {
    this.visible = !this.visible;
    this.element.style.display = this.visible ? 'block' : 'none';
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.element.remove();
  }
}