/* ============================================
   THREE.JS WORLD BUILDER
   Описание: Создание Three.js карточек вместо HTML
   Зависимости: texture-generator.js, config.js
   ============================================ */

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { createCardTexture, createPlaceholderTexture } from './texture-generator.js';

/**
 * Создать Three.js карточку
 * @param {Object} options
 * @returns {Promise<THREE.Mesh>}
 */
export async function createThreeJSCard({ 
    word, 
    translation, 
    imagePath, 
    example, 
    transcription, 
    index, 
    position 
}) {
    // 1. Создать placeholder сначала
    const placeholderTexture = createPlaceholderTexture(word);
    
    // 2. Геометрия (3 units wide x 2 units tall)
    const geometry = new THREE.PlaneGeometry(3, 2);
    
    // 3. Материал с placeholder
    const material = new THREE.MeshStandardMaterial({
        map: placeholderTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
    });
    
    // 4. Создать меш
    const card = new THREE.Mesh(geometry, material);
    
    // 5. Позиционирование
    const isLeft = index % 2 === 0;
    
    // ВАЖНО: Правильная конвертация spacing
    const spacingInUnits = position / 100; // 600px → 6 units (НЕ 0.6!)
    
    card.position.set(
        isLeft ? -2.5 : 2.5,  // x (слева/справа от центра)
        2,                     // y (высота)
        -spacingInUnits        // z (глубина, отрицательная)
    );
    
    // 6. Поворот (смотрит на центр)
    card.rotation.y = isLeft ? Math.PI / 8 : -Math.PI / 8;
    
    // 7. Метаданные (для quiz и raycasting)
    card.userData = {
        word,
        translation,
        imagePath,
        example,
        transcription,
        index,
        type: 'card'
    };
    
    // 8. Загрузить полную текстуру асинхронно
    createCardTexture({ 
        word, 
        translation, 
        imagePath, 
        example, 
        transcription 
    }).then(fullTexture => {
        material.map = fullTexture;
        material.needsUpdate = true;
        console.log(`🖼️ Full texture loaded for: "${word}"`);
    }).catch(error => {
        console.error(`❌ Texture load failed for "${word}":`, error);
    });
    
    return card;
}

/**
 * Создать коридор с Three.js карточками
 * @param {Array} words - Массив слов из JSON
 * @param {THREE.Scene} scene - Three.js сцена
 * @returns {Promise<THREE.Mesh[]>}
 */
export async function buildThreeJSWorld(words, scene) {
    console.log(`🏗️ Building Three.js world with ${words.length} cards...`);
    
    const cards = [];
    const spacing = CONFIG.cards.spacing; // 600px
    
    // Создать карточки параллельно (Promise.all для скорости)
    const cardPromises = words.map(async (word, index) => {
        const card = await createThreeJSCard({
            word: word.en,
            translation: word.ru,
            imagePath: word.image,
            example: word.example,
            transcription: word.transcription,
            index: index,
            position: index * spacing
        });
        
        // Добавить в сцену
        scene.add(card);
        
        // Debug для первых 3 карточек
        if (index < 3) {
            console.log(`   Card ${index}: "${word.en}" at Z=${card.position.z.toFixed(2)}`);
        }
        
        return card;
    });
    
    // Дождаться всех карточек
    const loadedCards = await Promise.all(cardPromises);
    cards.push(...loadedCards);
    
    console.log(`✅ Built ${cards.length} Three.js cards`);
    console.log(`📏 Spacing: ${spacing}px → ${spacing / 100} units`);
    
    return cards;
}

/**
 * Создать пол (опционально)
 */
export function createThreeJSFloor(scene) {
    const floorGeometry = new THREE.PlaneGeometry(10, 60);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.8,
        metalness: 0.2
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    
    scene.add(floor);
    
    // Сетка для отладки
    const gridHelper = new THREE.GridHelper(60, 60, 0x444444, 0x222222);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
    
    console.log('✅ Floor added to scene');
}

/**
 * Создать стены (опционально)
 */
export function createThreeJSWalls(scene) {
    const wallGeometry = new THREE.PlaneGeometry(60, 5);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x16213e,
        side: THREE.DoubleSide,
        opacity: 0.8,
        transparent: true
    });
    
    // Левая стена
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-5, 2.5, 0);
    scene.add(leftWall);
    
    // Правая стена
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(5, 2.5, 0);
    scene.add(rightWall);
    
    console.log('✅ Walls added to scene');
}