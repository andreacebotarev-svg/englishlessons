// palace_engine/js/builder.js

import * as THREE from 'three';
import { CONFIG } from './config.js';
import { getCardZPosition } from './scene-depth-calculator.js';
import { createCardTexture } from './texture-generator.js';

/**
 * Creates a Three.js card mesh
 */
function createThreeJSCard({ position, word, translation, example, transcription, image, difficulty, index, scene }) {
  // Create geometry for the card (PlaneGeometry for flat card)
  const geometry = new THREE.PlaneGeometry(3, 2); // 3 units wide, 2 units high
  
  // Create texture for the card
  const texture = createCardTexture(word, translation, image, example, transcription);
  
  // Create material with the texture
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide, // Show material on both sides
    transparent: true,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // Create the mesh
  const card = new THREE.Mesh(geometry, material);
  
  // Position the card in 3D space
  const isLeft = index % 2 === 0;
  card.position.set(
    isLeft ? -2.5 : 2.5,  // x (left/right offset)
    2,                     // y (height)
    -position              // z (depth along corridor)
  );
  
  // Rotate the card slightly based on side
  card.rotation.y = isLeft ? Math.PI / 8 : -Math.PI / 8; // ~22.5 degrees
  
  // Store word data in userData for later access
  card.userData = {
    word,
    translation,
    example,
    transcription,
    image,
    difficulty,
    index
  };
  
  // Add the card to the scene if provided
  if (scene) {
    scene.add(card);
  }
  
  return card;
}

function getColorByDifficulty(word) {
  const length = word.en.length;
  if (length <= 4) return 'easy';
  if (length <= 7) return 'medium';
  return 'hard';
}

/** 
 * Builds the Three.js world with cards
 */
function buildThreeJSWorld(words, scene) {
  console.log(`🏛️ Building Three.js palace with ${words.length} words...`);
  
  const cards = [];
  // Use the spacing from CONFIG and convert from pixels to Three.js units (100px = 1 unit)
  const spacing = CONFIG.cards.spacing || 600; // Default spacing in pixels
  const threeJSspacing = spacing / 100; // Convert pixels to Three.js units (adjust ratio as needed)
  
  words.forEach((word, index) => {
    const zPosition = index * threeJSspacing;
    const card = createThreeJSCard({
      position: zPosition,
      word: word.en,
      translation: word.ru,
      example: word.example || `Example with "${word.en}"`,
      transcription: word.transcription || null,
      image: word.image,
      difficulty: getColorByDifficulty(word),
      index: index,
      scene: scene
    });
    
    cards.push(card);
    
    if (index < 3) {
      console.log(`   Card ${index}: "${word.en}" at Z=${zPosition.toFixed(2)} units`);
    }
  });
  
  console.log(`✅ Built Three.js world with ${cards.length} cards (spacing: ${threeJSspacing.toFixed(3)} units)`);
  
  return cards;
}

export { buildThreeJSWorld, createThreeJSCard };