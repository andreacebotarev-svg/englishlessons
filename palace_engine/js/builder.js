// palace_engine/js/builder.js

import { CONFIG } from './config.js';

/**
 * Создает контейнер для 3D-коридора
 */
function createCorridor() {
  const corridor = document.createElement('div');
  corridor.id = 'corridor';
  
  corridor.style.position = 'absolute';
  corridor.style.top = '50%';
  corridor.style.left = '50%';
  corridor.style.transform = 'translate(-50%, -50%)';
  corridor.style.transformStyle = 'preserve-3d';
  corridor.style.width = '100%';
  corridor.style.height = '100%';
  corridor.style.pointerEvents = 'none';  // контейнер НЕ кликабелен
  
  return corridor;
}

/**
 * Создает пол коридора
 */
function createFloor() {
  const floor = document.createElement('div');
  floor.className = 'floor';
  return floor;
}

/**
 * Создает левую стену
 */
function createWallLeft() {
  const wall = document.createElement('div');
  wall.className = 'wall-left';
  return wall;
}

/**
 * Создает правую стену
 */
function createWallRight() {
  const wall = document.createElement('div');
  wall.className = 'wall-right';
  return wall;
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
 * Создает "комнату" для одного слова
 */
function createRoom({ position, word, translation, image, difficulty, index }) {
  const room = document.createElement('div');
  room.className = 'room';
  room.dataset.word = word;
  room.dataset.position = position;
  room.dataset.index = index;
  room.dataset.state = 'example';
  
  // ЧЕРЕДОВАНИЕ: чётные слева, нечётные справа
  const isLeft = index % 2 === 0;
  room.classList.add(isLeft ? 'room--left' : 'room--right');
  
  // Добавляем класс сложности
  if (difficulty) {
    room.classList.add(`room--${difficulty}`);
  }
  
  // ✅ КРИТИЧНО: Используем left/top для позиционирования
  const xOffset = isLeft ? -250 : 250;
  room.style.left = `calc(50% + ${xOffset}px)`;
  room.style.top = '50%';
  
  // ✅ КРИТИЧНО: transform ТОЛЬКО для Z и поворота
  const rotation = isLeft ? 25 : -25;
  room.style.transform = `translateZ(-${position}px) rotateY(${rotation}deg)`;
  
  // === 1. АНГЛИЙСКОЕ СЛОВО + КНОПКА ОЗВУЧИВАНИЯ ===
  const header = document.createElement('div');
  header.className = 'room-header';

  const label = document.createElement('div');
  label.className = 'room-word';
  label.textContent = word;

  const speakerBtn = document.createElement('button');
  speakerBtn.className = 'room-speaker';
  speakerBtn.innerHTML = '🔊';
  speakerBtn.setAttribute('aria-label', 'Play pronunciation');

  header.appendChild(label);
  header.appendChild(speakerBtn);
  room.appendChild(header);
  
  // === 2. КАРТИНКА (с wrapper для лучшего контроля) ===
  if (image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'room-image-wrapper';
    
    const img = document.createElement('img');
    img.className = 'room-image';
    img.src = `../images/${image}`;
    img.alt = word;
    img.loading = 'lazy';
    
    img.onerror = () => {
      console.warn(`⚠️ Image not found: ${image}`);
      wrapper.style.display = 'none';
    };
    
    wrapper.appendChild(img);
    room.appendChild(wrapper);
  }
  
  // === 3. КОНТЕНТ (ПРИМЕР + ПЕРЕВОД) ===
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'room-content';

  const exampleEl = document.createElement('div');
  exampleEl.className = 'room-example';
  exampleEl.textContent = `Click to see translation`;
  contentWrapper.appendChild(exampleEl);

  const translationEl = document.createElement('div');
  translationEl.className = 'room-translation';
  translationEl.textContent = translation;
  translationEl.style.display = 'none';
  contentWrapper.appendChild(translationEl);

  room.appendChild(contentWrapper);
  
  // === 4. ИНТЕРАКТИВНОСТЬ ===
  
  // 4.1 Клик по карточке — переключение example/translation
  room.addEventListener('click', (e) => {
    if (e.target.closest('.room-speaker')) return;
    
    const currentState = room.dataset.state || 'example';
    const exampleEl = room.querySelector('.room-example');
    const translationEl = room.querySelector('.room-translation');
    
    if (currentState === 'example') {
      exampleEl.style.display = 'none';
      translationEl.style.display = 'block';
      room.dataset.state = 'translation';
    } else {
      exampleEl.style.display = 'block';
      translationEl.style.display = 'none';
      room.dataset.state = 'example';
    }
  });

  // 4.2 Озвучивание слова
  const speakerBtnFinal = room.querySelector('.room-speaker');
  if (speakerBtnFinal) {
    speakerBtnFinal.addEventListener('click', (e) => {
      e.stopPropagation();
      speakWord(word);
    });
  }
  
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
  
  console.log(`🏗️ Building corridor with ${words.length} rooms...`);
  
  // ДОБАВЛЯЕМ ПОЛ И СТЕНЫ
  corridor.appendChild(createFloor());
  corridor.appendChild(createWallLeft());
  corridor.appendChild(createWallRight());
  console.log('   ✅ Floor and walls added');
  
  // ✅ НАЧАЛЬНОЕ СМЕЩЕНИЕ всех карточек вглубь
  const startOffset = 0; // начинаем с 0, как в референсе
  
  // ДОБАВЛЯЕМ КАРТОЧКИ (чередуются слева/справа)
  words.forEach((word, index) => {
    const position = startOffset + ((index + 1) * CONFIG.cards.spacing);
    
    const room = createRoom({
      position: position,
      word: word.en,
      translation: word.ru,
      image: word.image,
      difficulty: getColorByDifficulty(word),
      index: index
    });
    
    corridor.appendChild(room);
    
    console.log(`   Room ${index + 1}: "${word.en}" at Z=-${position}px`);
  });
  
  console.log(`✅ Built corridor with ${words.length} rooms (spacing: ${CONFIG.cards.spacing}px)`);
  
  return corridor;
}

export { buildWorld, createRoom, createCorridor, createFloor, createWallLeft, createWallRight };