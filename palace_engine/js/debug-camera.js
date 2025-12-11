/**
 * CAMERA DEBUGGER
 * Monitors camera state and provides validation
 * Last update: 2025-12-11
 */

export class CameraDebugger {
  constructor(camera) {
    this.camera = camera;
    this.snapshots = [];
  }

  /**
   * Update camera state (called every frame)
   */
  updateCameraState(camera) {
    if (!camera) return;
    this.camera = camera;
  }

  /**
   * Take snapshot of current camera state
   */
  takeSnapshot() {
    if (!this.camera) return null;

    const snapshot = {
      timestamp: Date.now(),
      position: { x: this.camera.x, y: this.camera.y, z: this.camera.z },
      rotation: { yaw: this.camera.yaw, pitch: this.camera.pitch },
      velocity: { ...this.camera.velocity },
      isPointerLocked: this.camera.isPointerLocked,
      targetedCard: this.camera.targetedCard?.dataset?.word || null
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > 10) this.snapshots.shift();

    return snapshot;
  }

  /**
   * Validate all camera parameters
   */
  validateAll() {
    if (!this.camera) return { valid: false, errors: ['Camera not initialized'] };

    const errors = [];

    // Check position bounds
    if (this.camera.x < -2000 || this.camera.x > 2000) {
      errors.push(`X position out of bounds: ${this.camera.x}`);
    }

    if (this.camera.z < this.camera.minZ || this.camera.z > this.camera.maxZ) {
      errors.push(`Z position out of bounds: ${this.camera.z} (min: ${this.camera.minZ}, max: ${this.camera.maxZ})`);
    }

    // Check FOV
    if (!this.camera.fov) {
      errors.push('FOV not defined');
    }

    return {
      valid: errors.length === 0,
      errors,
      state: this.takeSnapshot()
    };
  }

  /**
   * Get last N snapshots
   */
  getSnapshots(count = 5) {
    return this.snapshots.slice(-count);
  }
}

export default CameraDebugger;
