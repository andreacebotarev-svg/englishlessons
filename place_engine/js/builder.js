const Builder = {
    step: 800, // Расстояние между картинами (в пикселях)

    build(words) {
        const world = document.getElementById('world');
        
        // 1. Создаем стены и пол
        // Стены должны быть длинными, как количество слов * шаг
        const corridorLength = words.length * this.step + 2000;
        
        // Передаем длину в камеру, чтобы знать где остановиться
        Camera.maxZ = corridorLength - 1000;

        world.innerHTML = `
            <div class="floor"></div>
            <div class="wall-left"></div>
            <div class="wall-right"></div>
        `;

        // 2. Создаем карточки слов
        words.forEach((wordObj, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Наполняем контентом
            card.innerHTML = `
                <h2>${wordObj.en}</h2>
                <p>${wordObj.ru}</p>
                <div class="example">${wordObj.example || ''}</div>
            `;

            // Логика расстановки:
            // z = глубина (чем больше индекс, тем дальше)
            const z = -(index * this.step + 500); // 500px отступ от старта
            
            // Четные слева, нечетные справа
            const isLeft = index % 2 === 0;
            
            // Позиционирование через CSS transform
            // translateZ(z) - двигает вглубь
            // translateX - сдвигает к стене (+300 или -300)
            // rotateY - поворачивает лицом к коридору
            const xOffset = isLeft ? -300 : 300;
            const rotation = isLeft ? 60 : -60; // Немного повернуты к зрителю

            card.style.transform = `
                translate(-50%, -50%) 
                translateZ(${z}px) 
                translateX(${xOffset}px) 
                rotateY(${rotation}deg)
            `;
            
            // Озвучка при клике
            card.onclick = () => this.speak(wordObj.en);

            world.appendChild(card);
        });
    },

    speak(text) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US';
        speechSynthesis.speak(utter);
    }
};
