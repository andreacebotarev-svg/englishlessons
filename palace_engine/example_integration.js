/**
 * 📖 ПРИМЕР ИНТЕГРАЦИИ CINEMATIC CAMERA
 * 
 * Этот файл показывает как интегрировать систему камеры
 * в существующий проект с карточками
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { CinematicCamera } from './CinematicCamera.js';
import { CameraControls } from './CameraControls.js';

// ============================================
// ПРИМЕР 1: Базовая интеграция
// ============================================

export function setupCinematicCamera(scene, camera, existingCards) {
  // Инициализация системы камеры
  const cinematicCamera = new CinematicCamera(scene, camera, existingCards);
  const controls = new CameraControls(cinematicCamera);
  
  console.log('✅ Cinematic camera system ready!');
  
  return { cinematicCamera, controls };
}

// ============================================
// ПРИМЕР 2: Создание тестовых карточек
// ============================================

export function createTestCards(scene) {
  const cards = [];
  const words = [
    'Hello', 'World', 'Three', 'Camera', 'Portal',
    'Cinema', 'Focus', 'Smooth', 'Animation', 'Rail'
  ];
  
  const cardWidth = 3;
  const cardHeight = 2;
  const spacing = 5;
  
  words.forEach((word, index) => {
    // Геометрия карточки
    const geometry = new THREE.PlaneGeometry(cardWidth, cardHeight);
    
    // Материал с текстом (упрощённо)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Фон
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Текст
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, canvas.width / 2, canvas.height / 2);
    
    // Создание текстуры
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    });
    
    // Создание меша
    const card = new THREE.Mesh(geometry, material);
    
    // Позиционирование вдоль коридора
    card.position.set(
      0,
      2,
      25 - index * spacing // От +25 до -25
    );
    
    // Сохранение метаданных
    card.userData.word = word;
    card.userData.index = index;
    
    scene.add(card);
    cards.push(card);
  });
  
  console.log(`✅ Created ${cards.length} test cards`);
  return cards;
}

// ============================================
// ПРИМЕР 3: Полная инициализация
// ============================================

export function initializeCinematicScene() {
  // Сцена
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);
  scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
  
  // Камера
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  
  // Рендерер
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);
  
  // Освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);
  
  // Создание коридора (пол, стены)
  createCorridor(scene);
  
  // Создание карточек
  const cards = createTestCards(scene);
  
  // Инициализация системы камеры
  const { cinematicCamera, controls } = setupCinematicCamera(scene, camera, cards);
  
  // Настройка параметров
  cinematicCamera.setParams({
    fov: 35,
    animationDuration: 2.5,
    friction: 0.92,
    rotationSpeed: 0.07
  });
  
  // Анимационный цикл
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Обновление камеры
    cinematicCamera.update(deltaTime);
    
    // Рендеринг
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Адаптивность
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  console.log('🎬 Cinematic scene initialized!');
  console.log('Controls:');
  console.log('  W/S or ↑/↓ - Move forward/backward');
  console.log('  Space - Next waypoint');
  console.log('  Home - Jump to start');
  console.log('  End - Jump to end');
  console.log('  Escape - Return to rail');
  console.log('  R - Toggle rail visualization');
  console.log('  Click on card - Focus');
  
  return { scene, camera, renderer, cinematicCamera, controls, cards };
}

// ============================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Создание коридора
// ============================================

function createCorridor(scene) {
  // Пол
  const floorGeometry = new THREE.PlaneGeometry(10, 60);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a2e,
    roughness: 0.8
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);
  
  // Сетка на полу
  const gridHelper = new THREE.GridHelper(60, 60, 0x444444, 0x222222);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);
  
  // Боковые стены (опционально)
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
}

// ============================================
// ПРИМЕР 4: Использование в существующем проекте
// ============================================

/*
В вашем основном файле (например, main.js или app.js):

import { initializeCinematicScene } from './palace_engine/example_integration.js';

// Инициализация
const { scene, camera, renderer, cinematicCamera, controls, cards } = initializeCinematicScene();

// Или если у вас уже есть сцена и карточки:
import { setupCinematicCamera } from './palace_engine/example_integration.js';

const { cinematicCamera, controls } = setupCinematicCamera(
  yourExistingScene,
  yourExistingCamera,
  yourExistingCards
);

// В анимационном цикле:
function animate() {
  requestAnimationFrame(animate);
  
  cinematicCamera.update(deltaTime);
  
  renderer.render(scene, camera);
}
*/
