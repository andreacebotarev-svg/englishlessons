/**
 * DEBUG SYSTEM INTEGRATION
 * Connects all debug modules and provides global access
 * Last update: 2025-12-11
 * 
 * KEY FIX: Using window globals instead of circular imports
 */

import DebugManager from './debug-manager.js';
import CameraDebugger from './debug-camera.js';
import BuilderDebugger from './debug-builder.js';
import RaycastDebugger from './debug-raycast.js';
import DebugPanel from './debug-panel.js';

// Module-level variables
let debugManager = null;
let cameraDebugger = null;
let builderDebugger = null;
let raycastDebugger = null;
let debugPanel = null;

/**
 * Initialize debug systems
 * @param {Object} camera - Camera object for debugging
 * @returns {Object} Debug system instance
 */
export function initializeDebugSystems(camera) {
  if (debugManager) {
    console.warn('Debug systems already initialized');
    return { debugManager, cameraDebugger, builderDebugger, raycastDebugger, debugPanel };
  }

  try {
    // Initialize debug manager (centralized logging)
    debugManager = new DebugManager();
    
    // Initialize specialized debuggers
    cameraDebugger = new CameraDebugger(camera);
    builderDebugger = new BuilderDebugger();
    raycastDebugger = new RaycastDebugger();
    debugPanel = new DebugPanel();

    // Set dependencies for the debug panel
    debugPanel.setDependencies(camera, null, cameraDebugger, builderDebugger);

    // Attach to global window object for console access
    window.debugManager = debugManager;
    window.cameraDebugger = cameraDebugger;
    window.builderDebugger = builderDebugger;
    window.raycastDebugger = raycastDebugger;
    window.debugPanel = debugPanel;

    // Log success
    debugManager.log('debug', 3, 'Debug systems initialized successfully');
    console.log('✓ Debug Systems Ready');
    console.log('  Use: G to toggle panel, F3-F8 for specific features');

    return {
      debugManager,
      cameraDebugger,
      builderDebugger,
      raycastDebugger,
      debugPanel
    };

  } catch (error) {
    console.error('Failed to initialize debug systems:', error);
    throw error;
  }
}

/**
 * Update debug info every frame
 * This is called from the render loop WITHOUT circular imports
 * @param {Object} camera - Camera object with current state
 * @param {Object} gameLoop - GameLoop object (optional)
 */
export function updateDebugInfo(camera, gameLoop) {
  if (!cameraDebugger) return; // Not initialized yet

  try {
    // Update camera debugger with current state
    if (cameraDebugger && camera) {
      cameraDebugger.updateCameraState(camera);
    }

    // Update FPS from GameLoop if available
    if (gameLoop && debugPanel) {
      debugPanel.updateFPS(gameLoop.getFPS?.() || 0);
    }

  } catch (error) {
    // Silent fail on update errors to not spam console
    // console.error('Debug update error:', error);
  }
}

/**
 * Setup keyboard shortcuts for debugging
 * Called automatically after initialization
 */
export function setupDebugKeyboardShortcuts() {
  if (!debugPanel) return;

  document.addEventListener('keydown', (e) => {
    // Prevent if user is typing in an input
    if (document.activeElement.tagName === 'INPUT') return;

    switch (e.key.toUpperCase()) {
      case 'G':
        // Toggle debug panel
        e.preventDefault();
        debugPanel.toggle?.();
        break;

      case 'F3':
        // Scene map - show geometry
        e.preventDefault();
        if (builderDebugger?.showSceneMap) {
          builderDebugger.showSceneMap();
          console.log('Scene Map: Displaying card positions and visibility');
        }
        break;

      case 'F4':
        // Full validation
        e.preventDefault();
        if (cameraDebugger?.validateAll) {
          const result = cameraDebugger.validateAll();
          console.log('Full Validation:', result);
        }
        break;

      case 'F5':
        // Camera snapshot
        e.preventDefault();
        if (cameraDebugger?.takeSnapshot) {
          const snapshot = cameraDebugger.takeSnapshot();
          console.log('Camera Snapshot:', snapshot);
        }
        break;

      case 'F6':
        // Card bounds visualization
        e.preventDefault();
        if (raycastDebugger?.visualizeCardBounds) {
          raycastDebugger.visualizeCardBounds();
          console.log('Card Bounds: Visualizing boundaries');
        }
        break;

      case 'F7':
        // Toggle coordinate grid
        e.preventDefault();
        if (debugPanel?.toggleGrid) {
          debugPanel.toggleGrid();
          console.log('Grid: Toggled coordinate visualization');
        }
        break;

      case 'F8':
        // Clear debug markers
        e.preventDefault();
        if (raycastDebugger?.clearMarkers) {
          raycastDebugger.clearMarkers();
          console.log('Debug Markers: Cleared');
        }
        break;
    }
  });

  console.log('✓ Debug Keyboard Shortcuts Ready');
}

/**
 * Get current debug level
 * @returns {number} Current debug level (0-5)
 */
export function getDebugLevel() {
  return debugManager?.level || 0;
}

/**
 * Set debug level
 * @param {number} level - Debug level 0-5
 */
export function setDebugLevel(level) {
  if (debugManager) {
    debugManager.setLevel(level);
    console.log(`Debug level set to ${level}`);
  }
}

/**
 * Export debug system for global access
 */
export {
  debugManager,
  cameraDebugger,
  builderDebugger,
  raycastDebugger,
  debugPanel
};
