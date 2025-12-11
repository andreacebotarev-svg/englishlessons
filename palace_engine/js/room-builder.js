/* ============================================
   ROOM BUILDER
   Описание: Создание комнат-боксов для 3D коридора
   Last update: 2025-12-11 (Stubs for linear mode)
   ============================================ */

import { CONFIG } from './config.js';

/**
 * Группирует слова по комнатам
 * ⚠️ Используется только если roomBox.enabled = true
 * @param {Array} words - Массив слов
 * @returns {Array<Array>} Массив групп слов
 */
export function groupWordsByRooms(words) {
    if (!CONFIG.corridor.roomBox.enabled) {
        // В линейном режиме возвращаем пустой массив
        return [];
    }
    
    const { wordsPerRoom } = CONFIG.corridor.roomBox;
    const groups = [];
    
    for (let i = 0; i < words.length; i += wordsPerRoom) {
        groups.push(words.slice(i, i + wordsPerRoom));
    }
    
    return groups;
}

/**
 * Создаёт комнату-бокс с карточками
 * ⚠️ Используется только если roomBox.enabled = true
 * @param {number} roomIndex - Индекс комнаты
 * @param {Array} roomWords - Слова для этой комнаты
 * @returns {HTMLElement} DOM-элемент комнаты
 */
export function createRoomBox(roomIndex, roomWords) {
    if (!CONFIG.corridor.roomBox.enabled) {
        console.warn('⚠️ createRoomBox called but roomBox.enabled = false');
        return document.createElement('div'); // Пустая заглушка
    }
    
    const roomBox = document.createElement('div');
    roomBox.className = 'room-box';
    roomBox.dataset.roomIndex = roomIndex;
    
    // TODO: Реализация создания комнаты-бокса
    console.log(`🏠 Creating room-box ${roomIndex} with ${roomWords.length} words`);
    
    return roomBox;
}