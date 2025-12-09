// palace_engine/js/builder.js

import { CONFIG } from './config.js';

/**
 * Создает контейнер для 3D-коридора
 * ВАЖНО: Возвращает DIV который будет двигаться камерой
 */
function createCorridor() {
  const corridor = document.createElement('div');
  corridor.id = 'corridor';
  
  // КРИТИЧНО: transform-style для 3D дочерних элементов
  corridor.style.position = 'absolute';
  corridor.style.top = '50%';
  corridor.style.left = '50%';
  corridor.style.transform = 'translate(-50%, -50%)';
  corridor.style.transformStyle = 'preserve-3d';
  corridor.style.width = '100%';
  corridor.style.height = '100%';
  
  return corridor;
}

/**
 * Создает "комнату" для одного слова
 */
function createRoom({ position, word, translation, color, image, difficulty }) {
  const room = document.createElement('div');
  room.className = 'room';
  room.dataset.word = word;
  room.dataset.position = position; // для отладки
  
  // Добавляем класс сложности
  if (difficulty) {
    room.classList.add(`room--${difficulty}`);
  }
  
  // 3D-позиционирование вдоль коридора
  // ВАЖНО: translateZ ведет в глубину, translateX/Y - центрируют карточку
  room.style.transform = `translateZ(-${position}px) translateX(-50%) translateY(-50%)`;
  
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
      wrapper.style.display = 'none';
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
  
  console.log(`🏗️ Building ${words.length} rooms...`);
  
  words.forEach((word, index) => {
    const position = index * CONFIG.corridor.roomSpacing;
    
    const room = createRoom({
      position: position,
      word: word.en,
      translation: word.ru,
      image: word.image,
      difficulty: getColorByDifficulty(word)
    });
    
    corridor.appendChild(room);
    
    console.log(`  Room ${index + 1}: "${word.en}" at Z=-${position}px`);
  });
  
  console.log(`✅ Built ${words.length} rooms in corridor`);
  
  return corridor;
}

export { buildWorld, createRoom, createCorridor };