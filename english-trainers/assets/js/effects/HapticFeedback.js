/**
 * HAPTIC FEEDBACK
 * Mobile vibration patterns with fallback.
 */

class HapticFeedback {
  constructor(config = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      patterns: config.patterns || {
        success: [10, 30, 10],        // Quick double tap
        error: [50],                  // Single buzz
        milestone: [20, 50, 20, 50, 20] // Triple tap
      }
    };

    this._isSupported = 'vibrate' in navigator;
    this._isDestroyed = false;
  }

  /**
   * Trigger vibration pattern
   */
  vibrate(pattern) {
    if (!this.config.enabled || !this._isSupported || this._isDestroyed) return;

    try {
      const vibrationPattern = typeof pattern === 'string' 
        ? this.config.patterns[pattern] 
        : pattern;

      if (vibrationPattern) {
        navigator.vibrate(vibrationPattern);
        window.debugEffects && window.debugEffects('haptic', { pattern: vibrationPattern });
      }
    } catch (e) {
      window.debugEffects && window.debugEffects('haptic_failed', { error: e.message });
    }
  }

  /**
   * Cancel any ongoing vibration
   */
  cancel() {
    if (this._isSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this._isDestroyed = true;
    this.cancel();
    window.debugEffects && window.debugEffects('haptic_destroyed');
  }
}
