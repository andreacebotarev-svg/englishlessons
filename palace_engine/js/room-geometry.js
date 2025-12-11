/* ============================================
   ROOM GEOMETRY UTILITIES
   Описание: Утилиты для системы комнат-боксов
   Last update: 2025-12-11 (Stubs for linear mode)
   ============================================ */

import { CONFIG } from './config.js';

/**
 * Рассчитывает Z-позицию комнаты по индексу
 * ⚠️ Используется только если roomBox.enabled = true
 * @param {number} roomIndex - Индекс комнаты (0-based)
 * @returns {number} Z-позиция комнаты
 */
export function getRoomZPosition(roomIndex) {
    if (!CONFIG.corridor.roomBox.enabled) {
        return 0; // В линейном режиме не используется
    }
    
    const { roomDepth } = CONFIG.corridor.roomBox;
    const startOffset = 2000; // Начальная позиция первой комнаты
    
    return startOffset + (roomIndex * roomDepth);
}

/**
 * Определяет индекс комнаты для слова
 * @param {number} wordIndex - Индекс слова
 * @returns {number} Индекс комнаты
 */
export function getWordRoomIndex(wordIndex) {
    if (!CONFIG.corridor.roomBox.enabled) {
        return 0; // В линейном режиме все слова в "комнате 0"
    }
    
    const { wordsPerRoom } = CONFIG.corridor.roomBox;
    return Math.floor(wordIndex / wordsPerRoom);
}

/**
 * Логирует информацию о комнатах (для отладки)
 * @param {number} totalWords - Общее количество слов
 */
export function logRoomInfo(totalWords) {
    if (!CONFIG.corridor.roomBox.enabled) {
        console.log('📏 Room-box mode: DISABLED (using linear corridor)');
        return;
    }
    
    const { wordsPerRoom, roomDepth } = CONFIG.corridor.roomBox;
    const totalRooms = Math.ceil(totalWords / wordsPerRoom);
    
    console.log('🏛️ Room-box system:');
    console.log(`   📦 Total rooms: ${totalRooms}`);
    console.log(`   📚 Words per room: ${wordsPerRoom}`);
    console.log(`   📐 Room depth: ${roomDepth}px`);
}