// palace_engine/js/builder.js

import { CONFIG } from './config.js';
import { QuizManager } from './quiz-manager.js';  // 🎮 ИМПОРТ ДЛЯ QUIZ
// 🏛️ НОВЫЕ ИМПОРТЫ ДЛЯ СИСТЕМЫ КОМНАТ
import {
    getRoomZPosition,
    getWordRoomIndex,
    logRoomInfo
} from './room-geometry.js';
// 🏠 НОВЫЙ ИМПОРТ - СОЗДАНИЕ КОМНАТ-БОКСОВ
import { createRoomBox, groupWordsByRooms } from './room-builder.js';

/**
 * Создает контейнер для 3D-коридора
 */
function createCorridor() {
  const corridor = document.createElement('div');
  corridor.id = 'corridor';
  
  // 🐛 FIX: Убран inline transform - он конфликтовал с camera.js
  // Центрирование теперь через CSS (position: relative)
  corridor.style.position = 'relative';
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
 * Создает "комнату" для одного слова
 * ✅ ОБНОВЛЕННАЯ СТРУКТУРА: Слово + Транскрипция + Картинка + Пример/Перевод + QUIZ
 */
function createRoom({ position, word, translation, example, transcription, image, difficulty, index }) {
  const room = document.createElement('div');
  room.className = 'room';
  room.dataset.word = word;
  room.dataset.translation = translation;  // 🎮 ДОБАВЛЕНО для Quiz
  room.dataset.position = position;
  room.dataset.index = index;
  room.dataset.state = 'idle';  // 🎮 ИЗМЕНЕНО: idle для Quiz
  
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
  
  // === 🆕 НОВАЯ СТРУКТУРА КАРТОЧКИ ===
  
  // 1. ЗАГОЛОВОК: Слово + Транскрипция
  const header = document.createElement('div');
  header.className = 'room-card__header';

  const wordGroup = document.createElement('div');
  wordGroup.className = 'room-card__word-group';

  const wordLabel = document.createElement('div');
  wordLabel.className = 'room-card__word';
  wordLabel.textContent = word;

  const transcriptionEl = document.createElement('div');
  transcriptionEl.className = 'room-card__transcription';
  transcriptionEl.textContent = transcription || `/${word}/`;  // Фолбэк если нет транскрипции

  wordGroup.appendChild(wordLabel);
  wordGroup.appendChild(transcriptionEl);
  header.appendChild(wordGroup);
  room.appendChild(header);
  
  // 2. КАРТИНКА (с wrapper для лучшего контроля)
  if (image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'room-card__image-wrapper';
    
    const img = document.createElement('img');
    img.className = 'room-card__image';
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
  
  // 🎮 3. QUIZ-БЛОК (скрыт изначально)
  const quizBlock = document.createElement('div');
  quizBlock.className = 'room-card__quiz';
  quizBlock.style.display = 'none';

  // Input для ввода ответа
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'room-card__input';
  input.placeholder = 'Введите перевод...';
  input.autocomplete = 'off';
  input.spellcheck = false;

  // Enter → проверка ответа
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Найти QuizManager через camera
      const camera = window.Camera;
      if (camera && camera.quizManager) {
        camera.quizManager.checkAnswer(room, input.value);
      } else {
        console.warn('⚠️ QuizManager not found');
      }
    }
  });

  // Hint для подсказок
  const hint = document.createElement('div');
  hint.className = 'room-card__hint';
  hint.style.display = 'none';

  quizBlock.appendChild(input);
  quizBlock.appendChild(hint);
  room.appendChild(quizBlock);
  
  // 4. КОНТЕНТ: ПРИМЕР ИЛИ ПЕРЕВОД
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'room-card__content';

  // 4.1 ПРИМЕР (показывается по умолчанию)
  const exampleEl = document.createElement('div');
  exampleEl.className = 'room-card__example';
  exampleEl.textContent = example || `Example: "${word}" in a sentence.`;
  contentWrapper.appendChild(exampleEl);

  // 4.2 ПЕРЕВОД (скрыт изначально)
  const translationEl = document.createElement('div');
  translationEl.className = 'room-card__translation';
  translationEl.textContent = translation;
  translationEl.style.display = 'none';  // ✅ Скрыто
  contentWrapper.appendChild(translationEl);

  room.appendChild(contentWrapper);
  
  // 🎮 5. STATUS ICON (для галочки/крестика)
  const statusIcon = document.createElement('div');
  statusIcon.className = 'room-card__status-icon';
  room.appendChild(statusIcon);
  
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
  
  console.log(`🏛️ Building palace with ${words.length} words...`);
  
  // 🏛️ ЛОГИРОВАНИЕ ИНФОРМАЦИИ О КОМНАТАХ (если режим включён)
  if (CONFIG.corridor.roomBox.enabled) {
    logRoomInfo(words.length);
  }
  
  // 🏠 РЕЖИМ КОМНАТ-БОКСОВ
  if (CONFIG.corridor.roomBox.enabled) {
    console.log('🏠 Building in ROOM-BOX mode');
    
    // Группируем слова по комнатам
    const roomGroups = groupWordsByRooms(words);
    
    // Создаём комнаты-боксы
    roomGroups.forEach((roomWords, roomIndex) => {
      const roomBox = createRoomBox(roomIndex, roomWords);
      corridor.appendChild(roomBox);
    });
    
    console.log(`✅ Created ${roomGroups.length} room-boxes`);
  } 
  // СТАРЫЙ РЕЖИМ ЛИНЕЙНОГО КОРИДОРА
  else {
    console.log('📏 Building in LINEAR CORRIDOR mode');
    
    // ДОБАВЛЯЕМ ПОЛ И СТЕНЫ (старые)
    corridor.appendChild(createFloor());
    corridor.appendChild(createWallLeft());
    corridor.appendChild(createWallRight());
    console.log('   ✅ Floor and walls added');
    
    // ✅ НАЧАЛЬНОЕ СМЕЩЕНИЕ всех карточек вглубь
    const startOffset = 0;
    
    // ДОБАВЛЯЕМ КАРТОЧКИ (чередуются слева/справа)
    words.forEach((word, index) => {
      const position = startOffset + ((index + 1) * CONFIG.cards.spacing);
      
      const room = createRoom({
        position: position,
        word: word.en,
        translation: word.ru,
        example: word.example || `Example with "${word.en}"`,  // ✅ Пример
        transcription: word.transcription || null,  // ✅ Транскрипция
        image: word.image,
        difficulty: getColorByDifficulty(word),
        index: index
      });
      
      corridor.appendChild(room);
      
      if (index < 3) {  // Логируем только первые 3
        console.log(`   Room ${index + 1}: "${word.en}" at Z=-${position}px`);
      }
    });
    
    console.log(`✅ Built corridor with ${words.length} rooms (spacing: ${CONFIG.cards.spacing}px)`);
    console.log('🎮 Quiz-mode enabled on all cards');
  }
  
  return corridor;
}

export { buildWorld, createRoom, createCorridor, createFloor, createWallLeft, createWallRight };