// palace_engine/js/PerformanceLogger.js
export class PerformanceLogger {
    constructor() {
        this.metrics = {
            atlasCreationTime: 0,
            instancedMeshCreationTime: 0,
            totalInitTime: 0,
            frameData: []
        };
    }
    
    /**
     * Замерить время создания атласа
     */
    startAtlasCreation() {
        this.atlasStartTime = performance.now();
    }
    
    endAtlasCreation() {
        this.metrics.atlasCreationTime = performance.now() - this.atlasStartTime;
        console.log(`⏱️ Atlas creation time: ${this.metrics.atlasCreationTime.toFixed(2)}ms`);
    }
    
    /**
     * Замерить время создания InstancedMesh
     */
    startInstancedMeshCreation() {
        this.meshStartTime = performance.now();
    }
    
    endInstancedMeshCreation() {
        this.metrics.instancedMeshCreationTime = performance.now() - this.meshStartTime;
        console.log(`⏱️ InstancedMesh creation time: ${this.metrics.instancedMeshCreationTime.toFixed(2)}ms`);
    }
    
    /**
     * Записать FPS + draw calls
     */
    recordFrame(renderer, fps) {
        if (this.metrics.frameData.length >= 600) { // Keep last 10 seconds at 60fps
            this.metrics.frameData.shift();
        }
        
        this.metrics.frameData.push({
            timestamp: performance.now(),
            fps,
            drawCalls: renderer.info.render.calls,
            triangles: renderer.info.render.triangles,
            textures: renderer.info.memory.textures,
            geometries: renderer.info.memory.geometries
        });
    }
    
    /**
     * Экспортировать метрики в JSON
     */
    export() {
        const avgFPS = this.metrics.frameData.reduce((sum, frame) => sum + frame.fps, 0) / this.metrics.frameData.length;
        
        return {
            ...this.metrics,
            avgFPS: avgFPS.toFixed(2),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Скачать метрики как JSON файл
     */
    download() {
        const data = this.export();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-metrics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}