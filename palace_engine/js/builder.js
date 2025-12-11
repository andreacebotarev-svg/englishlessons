// palace_engine/js/builder.js

import { CONFIG } from './config.js';
import { getCardZPosition } from './scene-depth-calculator.js';
import { QuizManager } from './quiz-manager.js';
import { getRoomZPosition, getWordRoomIndex, logRoomInfo } from './room-geometry.js';
import { createRoomBox, groupWordsByRooms } from './room-builder.js';

/**
 * Создает контейнер для 3D-коридора
 */
function createCorridor() {
  const corridor = document.createElement('div');
  corridor.id = 'corridor';
  corridor.style.position = 'relative';
  corridor.style.transformStyle = 'preserve-3d';
  corridor.style.width = '100%';
  corridor.style.height = '100%';
  corridor.style.pointerEvents = 'none';
  return corridor;
}

function createFloor() {
  const floor = document.createElement('div');
  floor.className = 'floor';
  return floor;
}

function createWallLeft() {
  const wall = document.createElement('div');
  wall.className = 'wall-left';
  return wall;
}

function createWallRight() {
  const wall = document.createElement('div');
  wall.className = 'wall-right';
  return wall;
}

function createRoom({ position, word, translation, example, transcription, image, difficulty, index }) {
  const room = document.createElement('div');
  room.className = 'room';
  room.dataset.word = word;
  room.dataset.translation = translation;
  room.dataset.position = position;
  room.dataset.index = index;
  room.dataset.state = 'idle';
  
  const isLeft = index % 2 === 0;
  room.classList.add(isLeft ? 'room--left' : 'room--right');
  
  if (difficulty) {
    room.classList.add(`room--${difficulty}`);
  }
  
  const xOffset = isLeft ? -250 : 250;
  room.style.left = `calc(50% + ${xOffset}px)`;
  room.style.top = '50%';
  
  const rotation = isLeft ? 25 : -25;
  room.style.transform = `translateZ(-${position}px) rotateY(${rotation}deg)`;
  
  // HEADER
  const header = document.createElement('div');
  header.className = 'room-card__header';
  const wordGroup = document.createElement('div');
  wordGroup.className = 'room-card__word-group';
  const wordLabel = document.createElement('div');
  wordLabel.className = 'room-card__word';
  wordLabel.textContent = word;
  const transcriptionEl = document.createElement('div');
  transcriptionEl.className = 'room-card__transcription';
  transcriptionEl.textContent = transcription || `/${word}/`;
  wordGroup.appendChild(wordLabel);
  wordGroup.appendChild(transcriptionEl);
  header.appendChild(wordGroup);
  room.appendChild(header);
  
  // IMAGE
  if (image) {
    const wrapper = document.createElement('div');
    wrapper.className = 'room-card__image-wrapper';
    const img = document.createElement('img');
    img.className = 'room-card__image';
    img.src = `../images/${image}`;
    img.alt = word;
    img.loading = 'lazy';
    img.onerror = () => { wrapper.style.display = 'none'; };
    wrapper.appendChild(img);
    room.appendChild(wrapper);
  }
  
  // QUIZ BLOCK
  const quizBlock = document.createElement('div');
  quizBlock.className = 'room-card__quiz';
  quizBlock.style.display = 'none';
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'room-card__input';
  input.placeholder = 'Введите перевод...';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const camera = window.Camera;
      if (camera && camera.quizManager) {
        camera.quizManager.checkAnswer(room, input.value);
      }
    }
  });
  const hint = document.createElement('div');
  hint.className = 'room-card__hint';
  hint.style.display = 'none';
  quizBlock.appendChild(input);
  quizBlock.appendChild(hint);
  room.appendChild(quizBlock);
  
  // CONTENT
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'room-card__content';
  const exampleEl = document.createElement('div');
  exampleEl.className = 'room-card__example';
  exampleEl.textContent = example || `Example: "${word}" in a sentence.`;
  contentWrapper.appendChild(exampleEl);
  const translationEl = document.createElement('div');
  translationEl.className = 'room-card__translation';
  translationEl.textContent = translation;
  translationEl.style.display = 'none';
  contentWrapper.appendChild(translationEl);
  room.appendChild(contentWrapper);
  
  // STATUS ICON
  const statusIcon = document.createElement('div');
  statusIcon.className = 'room-card__status-icon';
  room.appendChild(statusIcon);
  
  return room;
}

function getColorByDifficulty(word) {
  const length = word.en.length;
  if (length <= 4) return 'easy';
  if (length <= 7) return 'medium';
  return 'hard';
}

function buildWorld(words) {
  const corridor = createCorridor();
  console.log(`🏛️ Building palace with ${words.length} words...`);
  
  if (CONFIG.corridor.roomBox.enabled) {
    logRoomInfo(words.length);
  }
  
  if (CONFIG.corridor.roomBox.enabled) {
    console.log('🏠 Building in ROOM-BOX mode');
    const roomGroups = groupWordsByRooms(words);
    roomGroups.forEach((roomWords, roomIndex) => {
      const roomBox = createRoomBox(roomIndex, roomWords);
      corridor.appendChild(roomBox);
    });
    console.log(`✅ Created ${roomGroups.length} room-boxes`);
  } else {
    console.log('📏 Building in LINEAR CORRIDOR mode');
    corridor.appendChild(createFloor());
    corridor.appendChild(createWallLeft());
    corridor.appendChild(createWallRight());
    console.log('   ✅ Floor and walls added');
    
    words.forEach((word, index) => {
      const zPosition = getCardZPosition(index);
      const room = createRoom({
        position: Math.abs(zPosition),
        word: word.en,
        translation: word.ru,
        example: word.example || `Example with "${word.en}"`,
        transcription: word.transcription || null,
        image: word.image,
        difficulty: getColorByDifficulty(word),
        index: index
      });
      corridor.appendChild(room);
      
      if (index < 3) {
        console.log(`   Card ${index}: "${word.en}" at Z=${zPosition}px`);
      }
    });
    
    console.log(`✅ Built corridor with ${words.length} rooms (spacing: ${CONFIG.cards.spacing}px)`);
    console.log('🎮 Quiz-mode enabled on all cards');
  }
  
  return corridor;
}

export { buildWorld, createRoom, createCorridor, createFloor, createWallLeft, createWallRight };