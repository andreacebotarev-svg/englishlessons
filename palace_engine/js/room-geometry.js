/* ============================================
   ROOM GEOMETRY UTILITIES
   Описание: Утилиты для расчёта геометрии 3D-комнат
   ============================================ */

import { CONFIG } from './config.js';

/**
 * Рассчитывает Z-координату комнаты по индексу
 * @param {number} roomIndex - Индекс комнаты (0, 1, 2...)
 * @returns {number} Z-координата в пикселях
 */
export function getRoomZPosition(roomIndex) {
    const startOffset = 2000; // должно совпадать с builder.js
    const roomDepth = CONFIG.corridor.roomBox.roomDepth;
    return startOffset + (roomIndex * roomDepth);
}

/**
 * Определяет индекс комнаты для слова
 * @param {number} wordIndex - Индекс слова в массиве
 * @returns {number} Индекс комнаты
 */
export function getWordRoomIndex(wordIndex) {
    const wordsPerRoom = CONFIG.corridor.roomBox.wordsPerRoom;
    return Math.floor(wordIndex / wordsPerRoom);
}

/**
 * Определяет позицию слова внутри комнаты (0-4)
 * @param {number} wordIndex - Глобальный индекс слова
 * @returns {number} Локальный индекс внутри комнаты
 */
export function getWordPositionInRoom(wordIndex) {
    const wordsPerRoom = CONFIG.corridor.roomBox.wordsPerRoom;
    return wordIndex % wordsPerRoom;
}

/**
 * Возвращает конфигурацию позиции карточки
 * @param {number} positionIndex - Индекс позиции (0-4)
 * @returns {Object} { x, y, z, rotY, wall }
 */
export function getCardPosition(positionIndex) {
    const positions = CONFIG.corridor.cardPositions;
    return positions[positionIndex] || positions[0];
}

/**
 * Рассчитывает общее количество комнат
 * @param {number} totalWords - Количество слов
 * @returns {number} Количество комнат
 */
export function calculateTotalRooms(totalWords) {
    const wordsPerRoom = CONFIG.corridor.roomBox.wordsPerRoom;
    return Math.ceil(totalWords / wordsPerRoom);
}

/**
 * Логирует информацию о комнатах (для отладки)
 * @param {number} totalWords - Общее количество слов
 */
export function logRoomInfo(totalWords) {
    const totalRooms = calculateTotalRooms(totalWords);
    console.log('🏗️ Room System Info:');
    console.log(`   - Total words: ${totalWords}`);
    console.log(`   - Words per room: ${CONFIG.corridor.roomBox.wordsPerRoom}`);
    console.log(`   - Total rooms: ${totalRooms}`);
    console.log(`   - Room dimensions: ${CONFIG.corridor.roomBox.roomWidth}x${CONFIG.corridor.roomBox.roomHeight}x${CONFIG.corridor.roomBox.roomDepth}px`);
}