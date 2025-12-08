/* ============================================
   CAMERA CONTROLLER - SIMPLIFIED VERSION
   Описание: Управление камерой с принципом направления
   ============================================ */

const Camera = {
    z: 0, // Текущая позиция
    speed: 50, // Скорость движения
    maxZ: 0, // Граница коридора (установит Builder)
    
    init() {
        // Слушаем колесико мыши
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            // e.deltaY > 0 это скролл вниз (идем вперед)
            const direction = e.deltaY > 0 ? 1 : -1;
            this.move(direction);
        }, { passive: false });
        
        // Слушаем клавиатуру (стрелки)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.move(1); // Вперед
            }
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.move(-1); // Назад
            }
        });
    },
    
    move(direction) {
        // Увеличиваем или уменьшаем Z
        // direction = 1  → вперед (зрите дальше в коридор)
        // direction = -1 → назад (вернитесь в начало)
        this.z += direction * this.speed;
        
        // Ограничиваем движение
        // Нельзя уйти назад за старт (z < 0)
        // Нельзя уйти дальше конца коридора (z > maxZ)
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;
        
        // Применяем к CSS
        // Мы двигаем мир ВО ПОБЕР (positive), чтобы сохранить иллюзию МОВЕНИЯ ВПЕРЕД
        document.documentElement.style.setProperty('--depth', `${this.z}px`);
        
        // Обновляем прогресс-бар
        this.updateProgress();
    },
    
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar && this.maxZ > 0) {
            const progress = (this.z / this.maxZ) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Camera;
}