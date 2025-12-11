/* ============================================
   CENTRALIZED GAME LOOP WITH FIXED TIMESTEP
   Last update: 2025-12-11
   ============================================ */

/**
 * Централизованный игровой цикл с fixed timestep
 * 
 * АРХИТЕКТУРА:
 * - Fixed timestep (16.67ms) для update() — логика всегда одинаковая
 * - Variable timestep для render() — максимальный FPS
 * - Accumulator pattern — компенсирует lag spikes
 * - Interpolation alpha — плавность рендера между updates
 * 
 * ЗАЧЕМ:
 * - Квиз-таймеры работают точно (10 секунд = ровно 10 секунд)
 * - Анимации переходов занимают одинаковое время на любом устройстве
 * - Движение камеры предсказуемо на 60Hz и 144Hz мониторах
 */
export class GameLoop {
  constructor(config = {}) {
    // Конфигурация
    this.targetFPS = config.targetFPS || 60;
    this.TIMESTEP = 1000 / this.targetFPS; // 16.67 мс для 60 FPS
    this.maxDeltaCap = config.maxDeltaCap || 250; // Защита от спирали смерти при лагах
    
    // Состояние
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.frameCount = 0;
    this.currentFPS = 0;
    
    // Подписчики
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    
    // Debug
    this.debugMode = config.debug || false;
    this.fpsUpdateInterval = 500; // Обновлять FPS каждые 500ms
    this.lastFPSUpdate = 0;
    this.framesSinceLastFPSUpdate = 0;
  }

  /**
   * Подписка на update (вызывается с фиксированным шагом)
   * @param {Function} callback - (deltaTime: number) => void
   * @returns {Function} unsubscribe function
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
    return () => this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Подписка на render (вызывается каждый кадр)
   * @param {Function} callback - (alpha: number) => void
   * alpha = прогресс между последним и следующим update (0-1)
   * @returns {Function} unsubscribe function
   */
  onRender(callback) {
    this.renderCallbacks.push(callback);
    return () => this.renderCallbacks = this.renderCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Запуск цикла
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.lastFPSUpdate = this.lastTime;
    this.accumulator = 0;
    
    if (this.debugMode) {
      console.log(`[GameLoop] Started with ${this.targetFPS} FPS target (${this.TIMESTEP.toFixed(2)}ms timestep)`);
    }
    
    requestAnimationFrame(this.loop);
  }

  /**
   * Главный цикл (приватный метод, вызывается через RAF)
   */
  loop = (currentTime) => {
    if (!this.running) return;

    // Вычисляем deltaTime с защитой от огромных скачков
    const deltaTime = Math.min(currentTime - this.lastTime, this.maxDeltaCap);
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // DEBUG: Считаем FPS
    if (this.debugMode) {
      this.framesSinceLastFPSUpdate++;
      if (currentTime - this.lastFPSUpdate >= this.fpsUpdateInterval) {
        this.currentFPS = Math.round(
          (this.framesSinceLastFPSUpdate * 1000) / (currentTime - this.lastFPSUpdate)
        );
        this.framesSinceLastFPSUpdate = 0;
        this.lastFPSUpdate = currentTime;
      }
    }

    // FIXED TIMESTEP: Обновляем логику фиксированными шагами
    let updatesThisFrame = 0;
    const maxUpdatesPerFrame = 5; // Защита от spiral of death
    
    while (this.accumulator >= this.TIMESTEP && updatesThisFrame < maxUpdatesPerFrame) {
      // Вызываем все update callbacks
      this.updateCallbacks.forEach(callback => {
        try {
          callback(this.TIMESTEP);
        } catch (error) {
          console.error('[GameLoop] Update callback error:', error);
        }
      });
      
      this.accumulator -= this.TIMESTEP;
      updatesThisFrame++;
    }

    // VARIABLE TIMESTEP: Рендерим с interpolation alpha
    const alpha = this.accumulator / this.TIMESTEP;
    
    this.renderCallbacks.forEach(callback => {
      try {
        callback(alpha);
      } catch (error) {
        console.error('[GameLoop] Render callback error:', error);
      }
    });

    this.frameCount++;
    requestAnimationFrame(this.loop);
  }

  /**
   * Остановка цикла
   */
  stop() {
    this.running = false;
    
    if (this.debugMode) {
      console.log(`[GameLoop] Stopped after ${this.frameCount} frames`);
    }
  }

  /**
   * Пауза/возобновление
   */
  pause() {
    this.running = false;
  }

  resume() {
    if (this.running) return;
    this.lastTime = performance.now(); // Сбрасываем время, чтобы не было скачка
    this.running = true;
    requestAnimationFrame(this.loop);
  }

  /**
   * Геттер для текущего FPS (для debug UI)
   */
  getFPS() {
    return this.currentFPS;
  }

  /**
   * Очистка всех подписчиков
   */
  dispose() {
    this.stop();
    this.updateCallbacks = [];
    this.renderCallbacks = [];
  }
}