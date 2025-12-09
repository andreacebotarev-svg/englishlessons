// palace_engine/js/builder.js

import { CONFIG } from './config.js';

/**
 * Создает контейнер для 3D-коридора
 */
function createCorridor() {
  const corridor = document.createElement('div');
  corridor.id = 'corridor';
  corridor.className = 'corridor';
  
  corridor.style.width = `${CONFIG.corridor.width}px`;
  corridor.style.height = `${CONFIG.corridor.height}px`;
  corridor.style.position = 'relative';
  corridor.style.transformStyle = 'preserve-3d';
  
  return corridor;
}

/**
 * Создает "комнату" для одного слова
 */
function createRoom({ position, word, translation, color, image, difficulty }) {
  const room = document.createElement('div');
  room.className = 'room';
  room.dataset.word = word; // для поиска при приближении
  
  // Добавляем класс сложности
  if (difficulty) {
    room.classList.add(`room--${difficulty}`);
  }
  
  // 3D-позиционирование вдоль коридора
  room.style.transform = `translateZ(-${position}px)`;
  
  // Если цвет передан напрямую (для обратной совместимости)
  if (color && !difficulty) {
    room.style.backgroundColor = color;
  }
  
  // === 1. АНГЛИЙСКОЕ СЛОВО ===
  const label = document.createElement('div');
  label.className = 'room-word';
  label.textContent = word;
  room.appendChild(label);
  
  // === 2. КАРТИНКА (с wrapper для лучшего контроля) ===
  if (image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'room-image-wrapper';
    
    const img = document.createElement('img');
    img.className = 'room-image';
    img.src = `../images/${image}`;
    img.alt = word;
    img.loading = 'lazy';
    
    // Обработка ошибок загрузки
    img.onerror = () => {
      console.warn(`⚠️ Image not found: ${image}`);
      wrapper.style.display = 'none'; // скрываем весь wrapper
    };
    
    wrapper.appendChild(img);
    room.appendChild(wrapper);
  }
  
  // === 3. ПЕРЕВОД ===
  const subtitle = document.createElement('div');
  subtitle.className = 'room-translation';
  subtitle.textContent = translation;
  room.appendChild(subtitle);
  
  return room;
}

/**
 * Определяет сложность слова по длине
 */
function getColorByDifficulty(word) {
  const length = word.en.length;
  
  if (length <= 4) return 'easy';
  if (length <= 7) return 'medium';
  return 'hard';
}

/**
 * Строит весь 3D-мир из массива слов
 */
function buildWorld(words) {
  const corridor = createCorridor();
  
  words.forEach((word, index) => {
    const room = createRoom({
      position: index * CONFIG.corridor.roomSpacing,
      word: word.en,
      translation: word.ru,
      image: word.image, // из JSON: "263/vote.jpg"
      difficulty: getColorByDifficulty(word)
    });
    
    corridor.appendChild(room);
  });
  
  return corridor;
}

export { buildWorld, createRoom, createCorridor };
