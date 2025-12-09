/* ============================================
   ROOM BUILDER
   Описание: Построитель 3D-комнат
   ============================================ */

import { CONFIG } from './config.js';
import { getRoomZPosition } from './room-geometry.js';

/**
 * Создаёт 3D-бокс комнаты с 6 гранями
 * @param {number} roomIndex - Индекс комнаты (0, 1, 2...)
 * @param {Array} words - Массив слов для этой комнаты
 * @returns {HTMLElement} DOM-элемент комнаты
 */
export function createRoomBox(roomIndex, words) {
    const roomBox = document.createElement('div');
    roomBox.className = 'room-box';
    roomBox.dataset.roomIndex = roomIndex;
    
    // Позиция комнаты в пространстве
    const z = getRoomZPosition(roomIndex);
    roomBox.style.transform = `translateZ(-${z}px)`;
    
    // Создаём 6 граней комнаты
    const walls = createWalls();
    walls.forEach(wall => roomBox.appendChild(wall));
    
    // 🎴 РАЗМЕЩАЕМ КАРТОЧКИ ВНУТРИ КОМНАТЫ
    placeCardsInRoom(roomBox, words, roomIndex);
    
    console.log(`🏠 Created room ${roomIndex} at Z=${z}px with ${words.length} words`);
    
    return roomBox;
}

/**
 * Создаёт массив из 6 стен комнаты
 * @returns {Array<HTMLElement>} Массив DOM-элементов стен
 */
function createWalls() {
    const { roomWidth, roomHeight, roomDepth } = CONFIG.corridor.roomBox;
    
    const wallConfigs = [
        // Пол
        { 
            name: 'floor', 
            width: roomWidth, 
            height: roomDepth,
            x: 0, 
            y: roomHeight / 2, 
            z: 0,
            rotation: 'rotateX(90deg)'
        },
        // Потолок
        { 
            name: 'ceiling', 
            width: roomWidth, 
            height: roomDepth,
            x: 0, 
            y: -roomHeight / 2, 
            z: 0,
            rotation: 'rotateX(-90deg)'
        },
        // Левая стена
        { 
            name: 'wall-left', 
            width: roomDepth, 
            height: roomHeight,
            x: -roomWidth / 2, 
            y: 0, 
            z: 0,
            rotation: 'rotateY(90deg)'
        },
        // Правая стена
        { 
            name: 'wall-right', 
            width: roomDepth, 
            height: roomHeight,
            x: roomWidth / 2, 
            y: 0, 
            z: 0,
            rotation: 'rotateY(-90deg)'
        },
        // Задняя стена
        { 
            name: 'wall-back', 
            width: roomWidth, 
            height: roomHeight,
            x: 0, 
            y: 0, 
            z: -roomDepth / 2,
            rotation: 'rotateY(0deg)'
        },
        // Передняя стена (с дверью в будущем)
        { 
            name: 'wall-front', 
            width: roomWidth, 
            height: roomHeight,
            x: 0, 
            y: 0, 
            z: roomDepth / 2,
            rotation: 'rotateY(180deg)'
        }
    ];
    
    return wallConfigs.map(config => createWall(config));
}

/**
 * Создаёт одну стену
 * @param {Object} config - Конфигурация стены
 * @returns {HTMLElement} DOM-элемент стены
 */
function createWall(config) {
    const wall = document.createElement('div');
    wall.className = `room-wall room-wall--${config.name}`;
    
    // Размеры
    wall.style.width = `${config.width}px`;
    wall.style.height = `${config.height}px`;
    
    // Позиция и поворот
    wall.style.transform = `
        translate3d(${config.x}px, ${config.y}px, ${config.z}px) 
        ${config.rotation}
    `;
    
    return wall;
}

/**
 * 🎴 РАЗМЕЩАЕТ КАРТОЧКИ СО СЛОВАМИ ВНУТРИ КОМНАТЫ НА СТЕНАХ
 * @param {HTMLElement} roomBox - Контейнер комнаты
 * @param {Array} words - Массив слов для этой комнаты (максимум 5)
 * @param {number} roomIndex - Индекс комнаты
 */
function placeCardsInRoom(roomBox, words, roomIndex) {
    const { cardPositions } = CONFIG.corridor;
    
    words.forEach((wordData, localIndex) => {
        // Получаем позицию карточки из конфига
        const position = cardPositions[localIndex];
        if (!position) {
            console.warn(`⚠️ No position config for word ${localIndex} in room ${roomIndex}`);
            return;
        }
        
        // Глобальный индекс слова в уроке
        const globalIndex = (roomIndex * CONFIG.corridor.roomBox.wordsPerRoom) + localIndex;
        
        // Создаём карточку
        const card = createWordCard({
            word: wordData.en,
            translation: wordData.ru,
            image: wordData.image,
            position: position,
            globalIndex: globalIndex,
            localIndex: localIndex,
            roomIndex: roomIndex
        });
        
        roomBox.appendChild(card);
        
        console.log(`   📍 Placed card "${wordData.en}" at wall:${position.wall} (${position.x}, ${position.y}, ${position.z})`);
    });
}

/**
 * Создаёт карточку слова для размещения в комнате
 * @param {Object} params - Параметры карточки
 * @returns {HTMLElement} DOM-элемент карточки
 */
function createWordCard({ word, translation, image, position, globalIndex, localIndex, roomIndex }) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.dataset.word = word;
    card.dataset.globalIndex = globalIndex;
    card.dataset.localIndex = localIndex;
    card.dataset.roomIndex = roomIndex;
    card.dataset.wall = position.wall;
    card.dataset.state = 'word';
    
    // Размеры карточки (можно вынести в CONFIG при желании)
    const cardWidth = 280;
    const cardHeight = 350;
    
    card.style.width = `${cardWidth}px`;
    card.style.height = `${cardHeight}px`;
    
    // Позиционирование и поворот карточки
    card.style.transform = `
        translate3d(${position.x}px, ${position.y}px, ${position.z}px)
        rotateY(${position.rotY}deg)
    `;
    
    // === СТРУКТУРА КАРТОЧКИ ===
    
    // 1. Заголовок (английское слово + кнопка озвучивания)
    const header = document.createElement('div');
    header.className = 'room-card__header';
    
    const wordLabel = document.createElement('div');
    wordLabel.className = 'room-card__word';
    wordLabel.textContent = word;
    
    const speakerBtn = document.createElement('button');
    speakerBtn.className = 'room-card__speaker';
    speakerBtn.innerHTML = '🔊';
    speakerBtn.setAttribute('aria-label', 'Play pronunciation');
    
    header.appendChild(wordLabel);
    header.appendChild(speakerBtn);
    card.appendChild(header);
    
    // 2. Картинка (опционально)
    if (image) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'room-card__image-wrapper';
        
        const img = document.createElement('img');
        img.className = 'room-card__image';
        img.src = `../images/${image}`;
        img.alt = word;
        img.loading = 'lazy';
        
        img.onerror = () => {
            console.warn(`⚠️ Image not found: ${image}`);
            imgWrapper.style.display = 'none';
        };
        
        imgWrapper.appendChild(img);
        card.appendChild(imgWrapper);
    }
    
    // 3. Контент (перевод, скрыт по умолчанию)
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'room-card__content';
    
    const translationEl = document.createElement('div');
    translationEl.className = 'room-card__translation';
    translationEl.textContent = translation;
    translationEl.style.display = 'none';
    
    contentWrapper.appendChild(translationEl);
    card.appendChild(contentWrapper);
    
    // === ИНТЕРАКТИВНОСТЬ ===
    
    // Клик по карточке — показать/скрыть перевод
    card.addEventListener('click', (e) => {
        if (e.target.closest('.room-card__speaker')) return;
        
        const currentState = card.dataset.state;
        
        if (currentState === 'word') {
            translationEl.style.display = 'block';
            card.dataset.state = 'translation';
            card.classList.add('room-card--flipped');
        } else {
            translationEl.style.display = 'none';
            card.dataset.state = 'word';
            card.classList.remove('room-card--flipped');
        }
    });
    
    // Озвучивание слова
    speakerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speakWord(word);
    });
    
    return card;
}

/**
 * Функция озвучивания слова
 */
function speakWord(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
    console.log(`🔊 Speaking: "${text}"`);
}

/**
 * Группирует слова по комнатам
 * @param {Array} words - Все слова урока
 * @returns {Array<Array>} Массив массивов слов по комнатам
 */
export function groupWordsByRooms(words) {
    const wordsPerRoom = CONFIG.corridor.roomBox.wordsPerRoom;
    const rooms = [];
    
    for (let i = 0; i < words.length; i += wordsPerRoom) {
        rooms.push(words.slice(i, i + wordsPerRoom));
    }
    
    return rooms;
}