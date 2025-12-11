/**
 * 📊 PERFORMANCE MONITOR FOR THREE.JS
 * 
 * Comprehensive performance monitoring system for the Palace Engine
 * Tracks FPS, memory usage, draw calls, and other critical metrics
 */

import Stats from 'stats.js';

export class PerformanceMonitor {
    constructor() {
        this.stats = new Stats();
        this.stats.showPanel(0); // FPS
        this.stats.dom.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 10000;
            opacity: 0.9;
        `;
        document.body.appendChild(this.stats.dom);

        // Additional panels
        this.memoryPanel = this.stats.addPanel(new Stats.Panel('MB', '#ff8', '#221'));
        this.drawCallsPanel = this.stats.addPanel(new Stats.Panel('DC', '#f8f', '#313'));
        this.trianglesPanel = this.stats.addPanel(new Stats.Panel('TRI', '#8ff', '#133'));

        this.renderer = null;
        this.lastTime = performance.now();
        
        // Memory tracking
        this.heapUsed = 0;
        this.heapTotal = 0;
        
        // Performance thresholds
        this.thresholds = {
            fps: { warning: 45, critical: 30 },
            memory: { warning: 100, critical: 150 }, // MB
            drawCalls: { warning: 25, critical: 40 }
        };
        
        // Performance warnings
        this.warnings = [];
        
        console.log('📊 Performance Monitor initialized');
    }

    begin(renderer = null) {
        this.stats.begin();
        this.renderer = renderer;
    }

    end() {
        // Update additional metrics
        this.updateMemoryMetrics();
        this.updateRenderMetrics();
        
        this.stats.end();
    }

    updateMemoryMetrics() {
        if (performance.memory) {
            this.heapUsed = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            this.heapTotal = (performance.memory.totalJSHeapSize / 1048576).toFixed(2);
            
            this.memoryPanel.update(parseFloat(this.heapUsed), 200);
            
            // Check for memory warnings
            if (parseFloat(this.heapUsed) > this.thresholds.memory.warning) {
                this.addWarning(`Memory usage high: ${this.heapUsed}MB`);
            }
        }
    }

    updateRenderMetrics() {
        if (this.renderer) {
            const info = this.renderer.info;
            const calls = info.render.calls;
            const triangles = info.render.triangles;
            
            this.drawCallsPanel.update(calls, 50);
            this.trianglesPanel.update(triangles, 100000);
            
            // Check for performance warnings
            if (calls > this.thresholds.drawCalls.warning) {
                this.addWarning(`High draw calls: ${calls}`);
            }
        }
    }

    addWarning(message) {
        const timestamp = new Date().toLocaleTimeString();
        const warning = `${timestamp}: ${message}`;
        
        // Only add if not duplicate
        if (!this.warnings.includes(warning)) {
            this.warnings.push(warning);
            console.warn('⚠️ Performance Warning:', message);
        }
    }

    getMetrics() {
        return {
            fps: this.stats.frames,
            memory: {
                used: this.heapUsed,
                total: this.heapTotal
            },
            render: {
                calls: this.renderer ? this.renderer.info.render.calls : 0,
                triangles: this.renderer ? this.renderer.info.render.triangles : 0,
                geometries: this.renderer ? this.renderer.info.memory.geometries : 0,
                textures: this.renderer ? this.renderer.info.memory.textures : 0
            },
            warnings: [...this.warnings]
        };
    }

    logMetrics(renderer) {
        if (renderer) {
            const info = renderer.info;
            console.log(`📊 Render Info - Calls: ${info.render.calls}, Triangles: ${info.render.triangles}, Geometries: ${info.memory.geometries}, Textures: ${info.memory.textures}`);
        }
    }

    destroy() {
        if (this.stats.dom && this.stats.dom.parentNode) {
            this.stats.dom.parentNode.removeChild(this.stats.dom);
        }
        this.warnings = [];
    }
}