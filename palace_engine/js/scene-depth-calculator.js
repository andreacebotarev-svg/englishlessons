/* ============================================
   SCENE DEPTH CALCULATOR
   Описание: Расчёт позиций карточек для WASD-режима
   Last update: 2025-12-11 (WASD mode stub)
   ============================================ */

import { CONFIG } from './config.js';

/**
 * Рассчитывает Z-позицию карточки по индексу
 * @param {number} index - Индекс карточки (0-based)
 * @returns {number} Z-позиция в пикселях (отрицательная)
 */
export function getCardZPosition(index) {
    // Простая формула: spacing × index
    // Первая карточка на Z=0, вторая на -500, третья на -1000...
    return -(CONFIG.cards.spacing * index);
}

/**
 * Обновляет высоту viewport для scroll-режима
 * ⚠️ В WASD-режиме НЕ используется (заглушка)
 * @param {number} numberOfCards - Количество карточек
 */
export function updateViewportHeight(numberOfCards) {
    // В WASD-режиме viewport не нужен
    // Эта функция вызывается из app.js, но ничего не делает
    console.log(`ℹ️ updateViewportHeight called (${numberOfCards} cards) - skipped for WASD mode`);
}

/**
 * Рассчитывает глубину сцены
 * @param {number} numberOfCards - Количество карточек
 * @returns {number} Глубина сцены в пикселях
 */
export function calculateSceneDepth(numberOfCards) {
    return CONFIG.cards.spacing * numberOfCards;
}