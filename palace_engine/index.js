/**
 * 🏰 PALACE ENGINE - Main Export
 * 
 * Централизованный экспорт всех компонентов системы
 */

export { CinematicCamera } from './CinematicCamera.js';
export { CameraControls } from './CameraControls.js';
export { 
  setupCinematicCamera, 
  createTestCards, 
  initializeCinematicScene 
} from './example_integration.js';

// Version
export const VERSION = '1.0.0';

console.log('🏰 Palace Engine v' + VERSION + ' loaded');
