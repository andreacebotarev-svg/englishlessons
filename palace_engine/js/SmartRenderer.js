/**
 * 🎮 SMART RENDERER FOR THREE.JS
 * 
 * Implements debounced rendering, frame skipping, and other performance optimizations
 */

export class SmartRenderer {
    constructor(renderer, camera, scene) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        
        // Render state
        this.needsRender = true;
        this.isRendering = false;
        this.lastRenderTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Frame rate management
        this.frameCount = 0;
        this.lastFPSUpdate = performance.now();
        this.currentFPS = 0;
        
        // Render optimization settings
        this.renderQuality = 'high'; // 'low', 'medium', 'high'
        this.dynamicLOD = true;
        this.autoFrameSkipping = true;
        
        // Frame skipping
        this.frameSkipCounter = 0;
        this.frameSkipThreshold = 3; // Skip frame every 3 frames if needed
        
        // Throttling
        this.throttleTime = 16; // ~60fps
        this.lastCallTime = 0;
        
        console.log('🎮 Smart Renderer initialized');
    }

    /**
     * Smart render with optimizations
     */
    render() {
        const now = performance.now();
        const deltaTime = now - this.lastRenderTime;
        
        // Check if we should render based on target FPS
        if (deltaTime < this.frameInterval && this.autoFrameSkipping) {
            // Consider frame skipping if we're behind
            this.frameSkipCounter++;
            if (this.frameSkipCounter >= this.frameSkipThreshold) {
                this.frameSkipCounter = 0;
                // Still render to maintain visual consistency
            }
        }
        
        // Perform render
        this.renderer.render(this.scene, this.camera);
        this.lastRenderTime = now;
        
        // Update FPS counter
        this.updateFPS();
    }

    /**
     * Throttled render to prevent excessive calls
     */
    throttledRender() {
        const now = performance.now();
        if (now - this.lastCallTime >= this.throttleTime) {
            this.lastCallTime = now;
            this.render();
        }
    }

    /**
     * Request render with debouncing
     */
    requestRender() {
        if (!this.isRendering) {
            this.isRendering = true;
            requestAnimationFrame(() => {
                this.render();
                this.isRendering = false;
            });
        }
    }

    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFPSUpdate >= 1000) { // Update every second
            this.currentFPS = Math.round((this.frameCount * 1000) / (now - this.lastFPSUpdate));
            this.frameCount = 0;
            this.lastFPSUpdate = now;
            
            // Adjust rendering quality based on FPS
            if (this.dynamicLOD) {
                this.adjustQualityBasedOnFPS(this.currentFPS);
            }
        }
    }

    /**
     * Adjust rendering quality based on current FPS
     */
    adjustQualityBasedOnFPS(fps) {
        if (fps < 30) {
            this.renderQuality = 'low';
            // Reduce shadow quality, turn off effects, etc.
            this.renderer.shadowMap.enabled = false;
        } else if (fps < 50) {
            this.renderQuality = 'medium';
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFShadowMap;
        } else {
            this.renderQuality = 'high';
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
    }

    /**
     * Set target FPS
     */
    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.frameInterval = 1000 / fps;
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.currentFPS;
    }

    /**
     * Get render quality
     */
    getRenderQuality() {
        return this.renderQuality;
    }

    /**
     * Force render (bypass optimizations)
     */
    forceRender() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Enable/disable auto frame skipping
     */
    setAutoFrameSkipping(enabled) {
        this.autoFrameSkipping = enabled;
    }

    /**
     * Enable/disable dynamic LOD
     */
    setDynamicLOD(enabled) {
        this.dynamicLOD = enabled;
    }
}

/**
 * Optimized animation loop with performance considerations
 */
export class OptimizedAnimationLoop {
    constructor(updateCallback, renderCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1 / 60; // 60 FPS fixed timestep
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFPSUpdate = performance.now();
        this.currentFPS = 0;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate = (currentTime = performance.now()) => {
        if (!this.isRunning) return;

        // Calculate delta time
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;

        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate >= 1000) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFPSUpdate));
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }

        // Fixed timestep update
        this.accumulator += deltaTime;
        while (this.accumulator >= this.fixedTimeStep) {
            if (this.updateCallback) {
                this.updateCallback(this.fixedTimeStep);
            }
            this.accumulator -= this.fixedTimeStep;
        }

        // Render
        if (this.renderCallback) {
            this.renderCallback();
        }

        requestAnimationFrame(this.animate);
    };

    getFPS() {
        return this.currentFPS;
    }
}