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