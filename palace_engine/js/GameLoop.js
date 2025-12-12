/**
 * CENTRALIZED GAME LOOP WITH FIXED TIMESTEP
 * Last update: 2025-12-11
 * KEY FIX: No circular imports - uses window.updateDebugInfo
 * 
 * Features:
 * - Fixed timestep 16.67ms update (60 FPS)
 * - Variable timestep render (supports 60Hz-144Hz+)
 * - Accumulator pattern prevents lag spikes
 * - Interpolation for smooth visuals
 */

export class GameLoop {
  constructor(config = {}) {
    // Core timing
    this.targetFPS = config.targetFPS || 60;
    this.TIMESTEP = 1000 / this.targetFPS; // 16.67ms for 60 FPS
    this.maxDeltaCap = config.maxDeltaCap || 250; // Prevent spiral of death
    this.maxUpdatesPerFrame = config.maxUpdatesPerFrame || 5;
    this.maxAccumulator = config.maxAccumulator || (this.TIMESTEP * this.maxUpdatesPerFrame);

    // Accumulator for fixed timestep
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.frameCount = 0;
    this.currentFPS = 0;

    // Callback lists
    this.updateCallbacks = [];
    this.renderCallbacks = [];

    // Debug
    this.debugMode = config.debug || false;
    this.fpsUpdateInterval = 500; // Update FPS every 500ms
    this.lastFPSUpdate = 0;
    this.framesSinceLastFPSUpdate = 0;
  }

  /**
   * Subscribe to update events (fixed timestep)
   * @param {Function} callback - Called with (deltaTime)
   * @returns {Function} Unsubscribe function
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
    return () => this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Subscribe to render events (variable timestep)
   * @param {Function} callback - Called with (alpha) for interpolation
   * @returns {Function} Unsubscribe function
   */
  onRender(callback) {
    this.renderCallbacks.push(callback);
    return () => this.renderCallbacks = this.renderCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.lastFPSUpdate = this.lastTime;
    this.accumulator = 0;

    if (this.debugMode) {
      console.log(
        `GameLoop Started with ${this.targetFPS} FPS target, ${this.TIMESTEP.toFixed(2)}ms timestep`
      );
    }

    requestAnimationFrame((time) => this.loop(time));
  }

  /**
   * Main loop function (RAF callback)
   * Implements fixed timestep pattern with variable render rate
   */
  loop = (currentTime) => {
    if (!this.running) return;

    // Calculate delta time
    const deltaTime = Math.min(currentTime - this.lastTime, this.maxDeltaCap);
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    // DEBUG: FPS Calculation
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

    // FIXED TIMESTEP UPDATES
    let updatesThisFrame = 0;
    
    // Cap accumulator to prevent spiral of death
    if (this.accumulator > this.maxAccumulator) {
        console.warn(`⚠️ Accumulator overflow (${this.accumulator.toFixed(0)}ms), resetting`);
        this.accumulator = this.TIMESTEP;  // Reset to single frame
    }

    while (
      this.accumulator >= this.TIMESTEP &&
      updatesThisFrame < this.maxUpdatesPerFrame
    ) {
      // Call update callbacks
      this.updateCallbacks.forEach((callback) => {
        try {
          callback(this.TIMESTEP);
        } catch (error) {
          console.error('GameLoop Update callback error:', error);
        }
      });

      this.accumulator -= this.TIMESTEP;
      updatesThisFrame++;
    }

    // VARIABLE TIMESTEP RENDER (interpolation alpha for smooth motion)
    const alpha = this.accumulator / this.TIMESTEP;

    this.renderCallbacks.forEach((callback) => {
      try {
        callback(alpha);
      } catch (error) {
        console.error('GameLoop Render callback error:', error);
      }
    });

    // Update debug info if function is available
    // NO IMPORT NEEDED - use global function if available
    if (typeof window.updateDebugInfo === 'function' && window.Camera) {
      try {
        window.updateDebugInfo(window.Camera, this);
      } catch (error) {
        // Silently ignore debug update errors
      }
    }

    this.frameCount++;
    requestAnimationFrame((time) => this.loop(time));
  };

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;

    if (this.debugMode) {
      console.log(`GameLoop Stopped after ${this.frameCount} frames`);
    }
  }

  /**
   * Pause the game loop (preserves accumulator state)
   */
  pause() {
    this.running = false;
  }

  /**
   * Resume from pause
   */
  resume() {
    if (this.running) return;
    this.lastTime = performance.now();
    this.running = true;
    requestAnimationFrame((time) => this.loop(time));
  }

  /**
   * Get current FPS (debug only)
   * @returns {number} Current frames per second
   */
  getFPS() {
    return this.currentFPS;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.stop();
    this.updateCallbacks = [];
    this.renderCallbacks = [];
  }
}

export default GameLoop;
