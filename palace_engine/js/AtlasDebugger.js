// palace_engine/js/AtlasDebugger.js
export class AtlasDebugger {
    /**
     * Визуализация текстурного атласа в новом окне
     * @param {TextureAtlasManager} atlasManager 
     */
    static visualize(atlasManager) {
        if (!atlasManager.atlasTexture) {
            console.error('Atlas texture not created yet');
            return;
        }
        
        // Создать новое окно
        const win = window.open('', 'Atlas Debug', 'width=1024,height=768');
        
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Texture Atlas Debug</title>
                <style>
                    body {
                        margin: 0;
                        background: #1a1a1a;
                        color: white;
                        font-family: monospace;
                        padding: 20px;
                    }
                    canvas {
                        border: 2px solid #FFD60A;
                        max-width: 100%;
                        image-rendering: pixelated;
                    }
                    .stats {
                        background: rgba(0,0,0,0.8);
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                    }
                    .stats div {
                        margin: 5px 0;
                    }
                    .success { color: #4CAF50; }
                    .warning { color: #FFC107; }
                    .error { color: #F44336; }
                </style>
            </head>
            <body>
                <h1>🖼️ Texture Atlas Debugger</h1>
                <canvas id="atlas"></canvas>
                <div class="stats" id="stats"></div>
            </body>
            </html>
        `);
        
        // Отрисовать canvas
        const canvas = win.document.getElementById('atlas');
        const ctx = canvas.getContext('2d');
        
        const atlasCanvas = atlasManager.canvas;
        canvas.width = atlasCanvas.width;
        canvas.height = atlasCanvas.height;
        
        // Отрисовать atlas
        ctx.drawImage(atlasCanvas, 0, 0);
        
        // Отрисовать границы карточек
        ctx.strokeStyle = '#FFD60A';
        ctx.lineWidth = 2;
        
        atlasManager.uvMap.forEach((uv, index) => {
            const x = uv.uMin * atlasManager.atlasSize;
            const y = uv.vMin * atlasManager.atlasSize;
            const width = (uv.uMax - uv.uMin) * atlasManager.atlasSize;
            const height = (uv.vMax - uv.vMin) * atlasManager.atlasSize;
            
            ctx.strokeRect(x, y, width, height);
            
            // Номер карточки
            ctx.fillStyle = '#FFD60A';
            ctx.font = '24px monospace';
            ctx.fillText(`#${index}`, x + 10, y + 30);
        });
        
        // Статистика
        const totalArea = atlasManager.atlasSize * atlasManager.atlasSize;
        const usedArea = Array.from(atlasManager.uvMap.values()).reduce((sum, uv) => {
            const width = (uv.uMax - uv.uMin) * atlasManager.atlasSize;
            const height = (uv.vMax - uv.vMin) * atlasManager.atlasSize;
            return sum + (width * height);
        }, 0);
        
        const efficiency = ((usedArea / totalArea) * 100).toFixed(2);
        const statusClass = efficiency > 70 ? 'success' : efficiency > 50 ? 'warning' : 'error';
        
        win.document.getElementById('stats').innerHTML = `
            <div><strong>Atlas Size:</strong> ${atlasManager.atlasSize}x${atlasManager.atlasSize}</div>
            <div><strong>Cards Count:</strong> ${atlasManager.uvMap.size}</div>
            <div><strong>Total Area:</strong> ${totalArea.toLocaleString()} px²</div>
            <div><strong>Used Area:</strong> ${usedArea.toLocaleString()} px²</div>
            <div class="${statusClass}"><strong>Efficiency:</strong> ${efficiency}%</div>
            <div><strong>Wasted Space:</strong> ${(totalArea - usedArea).toLocaleString()} px²</div>
        `;
    }
}

// Добавить в window для быстрого доступа
if (typeof window !== 'undefined') {
    window.AtlasDebugger = AtlasDebugger;
}