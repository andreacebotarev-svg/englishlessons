/* ============================================
   CSS 3D WORLD BUILDER
   Описание: Создание HTML коридора с 3D карточками
   Зависимости: config.js, room-builder.js, room-geometry.js
   ============================================ */

import { CONFIG } from './config.js';
import { groupWordsByRooms } from './room-builder.js';
import { getCardZPosition } from './scene-depth-calculator.js';

/**
 * Создаёт HTML элемент коридора с карточками
 * @param {Array} words - Массив слов из JSON
 * @returns {HTMLElement} - Контейнер с 3D карточками
 */
export function buildWorld(words) {
    console.log(`🏛️ Building CSS 3D world with ${words.length} words...`);
    
    // Создаём основной контейнер коридора
    const corridor = document.createElement('div');
    corridor.id = 'corridor';
    corridor.className = 'corridor';
    
    // Группируем слова по комнатам (если режим комнат включён)
    const roomGroups = groupWordsByRooms(words);
    const useRoomBoxes = roomGroups.length > 0;
    
    if (useRoomBoxes) {
        console.log(`🏠 Room-box mode enabled: ${roomGroups.length} rooms`);
    } else {
        console.log('📏 Linear corridor mode enabled');
    }
    
    // Создаём карточки
    words.forEach((word, index) => {
        const card = createCardElement(word, index, words.length);
        corridor.appendChild(card);
        
        // Debug для первых 3 карточек
        if (index < 3) {
            console.log(`   Card ${index}: "${word.en}"`);
        }
    });
    
    console.log(`✅ Built CSS 3D world with ${words.length} cards`);
    
    return corridor;
}

/**
 * Создаёт HTML элемент карточки
 * @param {Object} word - Объект слова
 * @param {number} index - Индекс слова
 * @param {number} totalWords - Общее количество слов
 * @returns {HTMLElement} - Элемент карточки
 */
function createCardElement(word, index, totalWords) {
    // Вычисляем позицию Z для карточки
    const zPosition = getCardZPosition(index, totalWords);
    
    // Определяем, слева или справа будет карточка
    const isLeft = index % 2 === 0;
    
    // Создаём контейнер карточки
    const card = document.createElement('div');
    card.className = 'room';
    card.dataset.en = word.en;
    card.dataset.ru = word.ru;
    card.dataset.example = word.example || '';
    card.dataset.transcription = word.transcription || '';
    card.dataset.position = zPosition;
    card.dataset.state = 'idle';
    card.dataset.index = index;
    
    // Устанавливаем 3D трансформацию
    card.style.transform = `
        translate3d(${isLeft ? -CONFIG.cards.offsetX : CONFIG.cards.offsetX}px, 0, ${zPosition}px)
        rotateY(${isLeft ? CONFIG.cards.rotationY : -CONFIG.cards.rotationY}deg)
    `;
    
    // Устанавливаем HTML содержимое карточки
    card.innerHTML = `
        <div class="room-card">
            <div class="room-card__content">
                <div class="room-card__word" data-translate="word">${word.en}</div>
                <div class="room-card__transcription" data-translate="transcription">${word.transcription || ''}</div>
                <div class="room-card__example" data-translate="example">${word.example || ''}</div>
                <div class="room-card__translation" data-translate="translation">${word.ru}</div>
            </div>
        </div>
    `;
    
    // Если есть изображение, добавляем его
    if (word.image) {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'room-card__image';
        imgContainer.innerHTML = `<img src="../images/${word.image}" alt="${word.en}" loading="lazy">`;
        
        // Вставляем изображение перед содержимым
        const contentDiv = card.querySelector('.room-card__content');
        contentDiv.insertBefore(imgContainer, contentDiv.firstChild);
    }
    
    return card;
}