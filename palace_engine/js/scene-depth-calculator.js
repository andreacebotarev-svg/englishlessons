/* ============================================
   SCENE DEPTH CALCULATOR
   Описание: Рассчитывает глубину 3D-сцены
   Зависимости: config.js
   ============================================ */

import { CONFIG } from './config.js';

/**
 * Рассчитывает глубину сцены для viewport scrolling
 * Формула из эталона:
 * depth = windowHeight + perspective + (spacing × numberOfCards)
 */
export function calculateSceneDepth(numberOfCards) {
    const perspective = CONFIG.getPerspective();
    const spacing = CONFIG.getSpacing();
    
    const depth = 
        window.innerHeight + 
        perspective + 
        (spacing * numberOfCards);
    
    console.log(`📐 Scene depth calculation:`);
    console.log(`   Window height: ${window.innerHeight}px`);
    console.log(`   Perspective: ${perspective}px`);
    console.log(`   Spacing: ${spacing}px × ${numberOfCards} cards`);
    console.log(`   Total depth: ${depth}px`);
    
    return depth;
}

/**
 * Обновляет CSS переменную --viewport-height
 */
export function updateViewportHeight(numberOfCards) {
    const depth = calculateSceneDepth(numberOfCards);
    document.documentElement.style.setProperty('--viewport-height', `${depth}px`);
    
    console.log(`✅ --viewport-height set to ${depth}px`);
}

/**
 * Рассчитывает Z-позицию для карточки по индексу
 */
export function getCardZPosition(cardIndex) {
    const spacing = CONFIG.getSpacing();
    return spacing * cardIndex * -1;  // Отрицательное значение = вглубь
}