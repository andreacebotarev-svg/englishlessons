/* ============================================
   WORLD BUILDER - SIMPLIFIED VERSION
   Описание: Создание 3D объектов (пол, стены, карточки)
   ============================================ */

const Builder = {
    step: 800, // Расстояние между карточками (в пикселях)
    
    build(words) {
        const world = document.getElementById('world');
        
        // 1. Очистим мир
        world.innerHTML = '';
        
        // 2. Сохраняем длину коридора
        // Камере нужно знать, где остановиться
        const corridorLength = words.length * this.step + 2000;
        Camera.maxZ = corridorLength - 1000;
        
        // 3. Не создаём стены - их описывают в CSS
        // как wall-left и wall-right
        
        // 4. Создаем карточки слов
        words.forEach((wordObj, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.word = wordObj.en;
            
            // Рассчитываем глубину
            const z = this.step * (index + 1); // 800, 1600, 2400, 3200...
            
            // Направление (левая или правая)
            const side = index % 2 === 0 ? 'left' : 'right';
            const xOffset = side === 'left' ? -250 : 250;
            
            // Позиций
            card.style.left = `calc(50% + ${xOffset}px)`;
            card.style.top = '50%';
            
            // 3D трансформация
            const rotateY = side === 'left' ? '25deg' : '-25deg';
            card.style.transform = `translateZ(${z}px) rotateY(${rotateY})`;
            
            // Контент
            card.innerHTML = `
                <h2>${wordObj.en}</h2>
                <p>${wordObj.ru}</p>
                ${wordObj.transcription ? `<span class="transcription">${wordObj.transcription}</span>` : ''}
                ${wordObj.example ? `<p class="example">${wordObj.example}</p>` : ''}
            `;
            
            // Обработчик клика
            card.addEventListener('click', () => {
                card.classList.toggle('learned');
            });
            
            world.appendChild(card);
        });
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Builder;
}