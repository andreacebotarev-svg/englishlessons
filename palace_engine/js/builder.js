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
function createRoom({ position, word, translation, color, image }) {
  const room = document.createElement('div');
  room.className = 'room';
  room.dataset.word = word; // для поиска при приближении
  
  // 3D-позиционирование вдоль коридора
  room.style.transform = `translateZ(-${position}px)`;
  room.style.backgroundColor = color || CONFIG.colors.accent;
  
  // Английское слово (большое)
  const label = document.createElement('div');
  label.className = 'room-word';
  label.textContent = word;
  room.appendChild(label);
  
  // Картинка (если есть)
  if (image) {
    const img = document.createElement('img');
    img.className = 'room-image';
    img.src = `../images/${image}`; // images/263/vote.jpg
    img.alt = word;
    img.loading = 'lazy'; // ленивая загрузка
    
    // Обработка ошибок загрузки
    img.onerror = () => {
      console.warn(`Image not found: ${image}`);
      img.style.display = 'none';
    };
    
    room.appendChild(img);
  }
  
  // Перевод (маленький, внизу)
  const subtitle = document.createElement('div');
  subtitle.className = 'room-translation';
  subtitle.textContent = translation;
  room.appendChild(subtitle);
  
  return room;
}

/**
 * Определяет цвет комнаты по сложности слова
 */
function getColorByDifficulty(word) {
  const length = word.en.length;
  
  if (length <= 4) return '#4CAF50'; // зеленый - простое
  if (length <= 7) return '#FFC107'; // желтый - среднее
  return '#F44336'; // красный - сложное
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
      color: getColorByDifficulty(word),
      image: word.image // из JSON: "263/vote.jpg"
    });
    
    corridor.appendChild(room);
  });
  
  return corridor;
}

export { buildWorld, createRoom, createCorridor };
