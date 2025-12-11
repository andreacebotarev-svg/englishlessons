/* ============================================
   SCROLL-BASED CAMERA
   Описание: Управление камерой через скроллинг
   Зависимости: config.js
   ============================================ */

export class ScrollCamera {
    constructor() {
        this.cameraZ = 0;
        this.isEnabled = false;
        
        // Bind handlers
        this.onScroll = this.onScroll.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        
        // Perspective origin (для движения угла камеры)
        this.perspectiveOrigin = {
            x: parseFloat(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--perspective-origin-x')
            ),
            y: parseFloat(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--perspective-origin-y')
            ),
            maxGap: 10  // Максимальное отклонение в %
        };
    }
    
    /**
     * Инициализация scroll-камеры
     */
    init() {
        window.addEventListener('scroll', this.onScroll);
        window.addEventListener('mousemove', this.onMouseMove);
        this.isEnabled = true;
        console.log('📹 ScrollCamera initialized');
    }
    
    /**
     * Обработчик скроллинга — движение камеры по Z
     */
    onScroll() {
        if (!this.isEnabled) return;
        
        this.cameraZ = window.pageYOffset;
        
        // Обновляем CSS переменную
        document.documentElement.style.setProperty('--camera-z', this.cameraZ);
        
        // Debug (раз в 100px)
        if (this.cameraZ % 100 === 0) {
            console.log(`📹 Camera Z: ${this.cameraZ}px`);
        }
    }
    
    /**
     * Обработчик мыши — изменение угла камеры
     * (perspective-origin меняется в зависимости от позиции курсора)
     */
    onMouseMove(event) {
        if (!this.isEnabled) return;
        
        // Вычисляем отклонение курсора от центра (в %)
        const xGap = (((event.clientX - window.innerWidth / 2) * 100) / 
                      (window.innerWidth / 2)) * -1;
        const yGap = (((event.clientY - window.innerHeight / 2) * 100) / 
                      (window.innerHeight / 2)) * -1;
        
        // Новые значения perspective-origin
        const newOriginX = this.perspectiveOrigin.x + 
                          (xGap * this.perspectiveOrigin.maxGap) / 100;
        const newOriginY = this.perspectiveOrigin.y + 
                          (yGap * this.perspectiveOrigin.maxGap) / 100;
        
        // Обновляем CSS
        document.documentElement.style.setProperty('--perspective-origin-x', newOriginX);
        document.documentElement.style.setProperty('--perspective-origin-y', newOriginY);
    }
    
    /**
     * Отключить scroll-камеру
     */
    disable() {
        this.isEnabled = false;
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('mousemove', this.onMouseMove);
    }
}