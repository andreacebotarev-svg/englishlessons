const Camera = {
    z: 0,        // Текущая позиция
    speed: 50,   // Скорость движения
    maxZ: 0,     // Граница коридора (установит Builder)

    init() {
        // Слушаем колесико мыши
        window.addEventListener('wheel', (e) => {
            // e.deltaY > 0 это скролл вниз (идем вперед)
            const direction = e.deltaY > 0 ? 1 : -1;
            this.move(direction);
        });

        // Слушаем клавиатуру (стрелки)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') this.move(1);
            if (e.key === 'ArrowDown') this.move(-1);
        });
    },

    move(direction) {
        // Увеличиваем или уменьшаем Z
        this.z += direction * this.speed;

        // Ограничиваем движение
        // Нельзя уйти назад за старт (z < 0)
        // Нельзя уйти дальше конца коридора (z > maxZ)
        if (this.z < 0) this.z = 0;
        if (this.z > this.maxZ) this.z = this.maxZ;

        // Применяем к CSS
        // Мы двигаем мир НАЗАД (negative), чтобы создать иллюзию движения ВПЕРЕД
        document.documentElement.style.setProperty('--depth', `${this.z}px`);
    }
};
