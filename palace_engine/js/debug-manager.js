/**
 * DEBUG MANAGER
 * Centralized logging system with 5 levels
 * Last update: 2025-12-11
 */

export class DebugManager {
  constructor() {
    this.level = 3; // Default: INFO
    this.prefix = '[Debug]';
  }

  /**
   * Set debug level
   * 0 = SILENT, 1 = ERRORS, 2 = WARNINGS, 3 = INFO, 4 = DEBUG, 5 = TRACE
   */
  setLevel(level) {
    this.level = level;
    console.log(`${this.prefix} Level set to ${level}`);
  }

  /**
   * Log message if level permits
   */
  log(type, requiredLevel, ...args) {
    if (this.level < requiredLevel) return;

    const prefix = `${this.prefix}[${type.toUpperCase()}]`;
    
    switch (type) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'trace':
        console.trace(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }
}

export default DebugManager;
