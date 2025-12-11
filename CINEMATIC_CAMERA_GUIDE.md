# 🎬 CINEMATIC CAMERA (Portal 2 Style) — ПОЛНЫЙ ГАЙД РЕСУРСОВ

Вот все что нужно для реализации синематической камеры!

## 📚 JAVASCRIPT БИБЛИОТЕКИ & ФРЕЙМВОРКИ:

### 1. 🔴 THREE.js — основа для 3D камер
```javascript
// THREE.Camera, PathCamera, CatmullRomCurve3
// Идеально для рельсов и сглаживания

npm install three
// CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js 

// Примеры:
https://github.com/mrdoob/three.js/blob/master/examples/camera_orthographic.html 
https://github.com/mrdoob/three.js/blob/master/examples/objects_usd.html 
```

### 2. 📈 GSAP (GreenSock Animation Platform) — лучшее для переходов
```javascript
// Плавные анимации камеры, инерция, easing functions
// Идеально для медленных переходов Portal 2 стиля

npm install gsap
// CDN: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js 

// Примеры tweens для камеры:
gsap.to(camera, {
duration: 3,
x: targetX,
y: targetY,
z: targetZ,
ease: "power2.inOut"
})
```

### 3. 🎯 Babylon.js — встроенные камеры
```javascript
// UniversalCamera, ArcRotateCamera с плавными переходами
// Встроенная система анимации

npm install babylonjs
// CDN: https://cdn.babylonjs.com/babylon.js 

// Примеры:
https://www.babylonjs-playground.com/#7G51S#0
 https://doc.babylonjs.com/features/featuresDeepDive/Cameras 
```

### 4. ✨ Tweakpane или dat.GUI — отладка параметров
```javascript
// Для тестирования значений камеры в реальном времени
npm install tweakpane

import Pane from 'tweakpane';
const pane = new Pane();
pane.addInput(cameraParams, 'speed', { min: 0, max: 10 });
```

## 🎮 ALGORITHM & MATH БИБЛИОТЕКИ:

### 5. 🔢 gl-matrix — работа с векторами и матрицами
```javascript
// Для вычисления интерполяции позиций/ориентации камеры
npm install gl-matrix

import { vec3, mat4, quat } from 'gl-matrix';

// SLERP (Spherical Linear Interpolation) для плавного вращения
// Лучше чем линейная интерполяция
```

### 6. 📐 Easing функции (встроенные или tweakpane)
```javascript
// Для Portal 2 эффекта плавности:
// ease-in-out-quad, ease-in-out-cubic, ease-out-back

// Встроенные в JavaScript:
const easeInOutQuad = (t) =>
t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

const easeOutBack = (t) => {
const c1 = 1.70158, c3 = c1 + 1;
return c3 * t * t * t - c1 * t * t;
};
```

## 📺 ПРИМЕРЫ КОДА & ТУТОРИАЛЫ:

### 7. 🎬 Catmull-Rom Spline (рельсы для камеры)
```javascript
// Для плавных кривых траекторий (как рельсы в Portal 2)

// THREE.js встроенная поддержка:
https://threejs.org/docs/api/en/curves/CatmullRomCurve3.html 

// Пример:
const points = [
new THREE.Vector3(-10, 0, 10),
new THREE.Vector3(-5, 15, 5),
new THREE.Vector3(0, 0, 0),
new THREE.Vector3(10, -15, -10)
];

const curve = new THREE.CatmullRomCurve3(points);
const cameraPosition = curve.getPoint(t); // t = 0..1
```

### 8. 🔄 Lerp (Linear Interpolation)
```javascript
// Для переходов между позициями
function lerp(start, end, t) {
return start + (end - start) * t;
}

// Или для Vector3:
THREE.Vector3.lerp = function(v1, v2, t) {
return new THREE.Vector3(
lerp(v1.x, v2.x, t),
lerp(v1.y, v2.y, t),
lerp(v1.z, v2.z, t)
);
};
```

### 9. 🎯 Quaternion (плавное вращение)
```javascript
// Для ориентации камеры без gimbal lock

const quat1 = new THREE.Quaternion();
const quat2 = new THREE.Quaternion();
const result = new THREE.Quaternion();

// SLERP (Spherical Linear Interpolation)
THREE.Quaternion.slerp(quat1, quat2, result, t);
```

## 🎥 ГОТОВЫЕ ПРИМЕРЫ & ДЕМО:

### 10. THREE.js примеры:
✅ PathCamera: https://github.com/mrdoob/three.js/blob/master/examples/camera_array.html 
✅ Smooth Animation: https://threejs.org/examples/#webgl_animation_cloth
✅ Follow Camera:  https://threejs.org/examples/#webgl_camera

### 11. Babylon.js примеры:
✅ Camera Animation:  https://playground.babylonjs.com/#KBS9I5
✅ Universal Camera:  https://playground.babylonjs.com/#B2CH74
✅ Animation Groups:  https://playground.babylonjs.com/#BKZPK6

### 12. Portal 2 вдохновение:
🎬 GDC Talk: "Portal 2 - Advanced Techniques"
 https://www.youtube.com/watch?v=b3XVaF9LGJI

🎬 Portal Cinematic Cameras
 https://www.youtube.com/watch?v=2FNK0v-NJSA

📖 Книга: "Game Camera Design"
 https://gamedevelopment.tutsplus.com/articles/ 
understanding-the-camera--gamedev-12138

## 📖 ДОКУМЕНТАЦИЯ & СТАТЬИ:

### 13. Cinematic Camera Техники:
📚 Game Developer Magazine:
https://gamedeveloper.com/disciplines/game-camera-design 

📚 GDC Vault (Portal 2 камеры):
https://www.gdcvault.com/ 

📚 Unreal Engine Cameras:
https://docs.unrealengine.com/5.0/en-US/ 
UnrealEngine/Camera/

### 14. Математика для камер:
📐 Vector Math for Cameras:
https://www.3dgep.com/ 
understanding-the-view-matrix/

📐 Bezier Curves (для гладких путей):
https://developer.mozilla.org/en-US/docs/ 
Glossary/Bezier_curve

📐 Quaternions в играх:
https://www.euclideanspace.com/maths/ 
algebra/realNormedAlgebra/quaternions/

## 🛠️ ИНСТРУМЕНТЫ ДЛЯ РАЗРАБОТКИ:

### 15. Отладка и визуализация:
Camera Path Visualizer
https://github.com/bhouston/three-gizmo 

Real-time parameter adjustment
https://github.com/cocopon/tweakpane 

Performance monitoring
https://github.com/spite/raf.js 

### 16. Утилиты:
Smooth Damping (инерция):
https://github.com/pmndrs/zustand 

Easing functions library:
https://easings.net/  (с примерами кода)

Animation timing:
https://www.npmjs.com/package/popmotion 

## 📝 ПОШАГОВЫЙ ПЛАН РЕАЛИЗАЦИИ:

### Шаг 1: Выбрать основу
✅ THREE.js (лучший для 3D)
или
✅ Встроенный WebGL API + мат-функции

### Шаг 2: Реализовать рельсы
```javascript
// Catmull-Rom кривая для траектории камеры
const railCurve = new CatmullRomCurve3(controlPoints);
```

### Шаг 3: Добавить плавные переходы
```javascript
// GSAP для анимации позиции/ротации
gsap.to(camera, { duration: 3, ...targetPos, ease: "power2.inOut" })
```

### Шаг 4: Настроить автофокус
```javascript
// LookAt целевую карточку
camera.lookAt(targetCard.position);
```

### Шаг 5: Ограничить угол обзора
```javascript
// Narrow FOV (Field of View)
camera.fov = 35; // Вместо 75
camera.updateProjectionMatrix();
```

## 🎁 ГОТОВЫЕ КОМПОНЕНТЫ:

### 17. A-Frame (высокоуровневая абстракция над THREE.js):
```xml
<!-- Готовая поддержка анимированных камер -->
<a-scene>
<a-entity camera="active: true" animation="...">
</a-entity>
</a-scene>
```

### 18. PlayCanvas (облачный игровой движок):
```javascript
// Встроенная система камер с готовыми эффектами
// https://playcanvas.com/ 
```

## 💾 ПОЛЕЗНЫЕ GIT РЕПОЗИТОРИИ:
🔗 Three.js Camera Examples:
https://github.com/mrdoob/three.js/tree/dev/examples/cameras 

🔗 Babylon.js Samples:
https://github.com/BabylonJS/Samples 

🔗 Game Camera Utils:
https://github.com/topics/game-camera 

🔗 Easing Animations:
https://github.com/popmotion/popmotion 

## 🎓 ВИДЕО-ОБУЧЕНИЕ:
🎥 Brackeys - Camera Scripting:
https://www.youtube.com/watch?v=X7jPW9dEFBE

🎥 Three.js Journey - Cameras:
 https://threejs-journey.com/lessons/cameras 

🎥 GDC - Portal 2 Design:
https://www.youtube.com/watch?v=2FNK0v-NJSA

🎥 Sebastian Lague - Game Cameras:
 https://www.youtube.com/watch?v=UCb-FKDJl0w

## 📦 NPM ПАКЕТЫ (ready-to-use):
```bash
# Основные
npm install three gsap

# Опциональные
npm install tweakpane # UI для настройки параметров
npm install gl-matrix # Математика
npm install cannon-es # Физика (если нужна)

# Утилиты
npm install popmotion # Анимации
npm install ease-component # Easing функции
```

## 🎯 РЕКОМЕНДУЕМЫЙ СТЕК:
```javascript
// Основа
THREE.js // 3D контекст
+ GSAP // Анимации переходов
+ Tweakpane // Параметры в реальном времени

// Кривые и пути
CatmullRomCurve3 // Встроено в THREE.js
Bezier curves // Для более гибкого контроля

// Интерполяция
Quaternion.slerp() // Вращение без gimbal lock
Vector3.lerp() // Линейная интерполяция позиции

// Эффекты
Easing functions // easings.net
Damping (инерция) // Custom implementation или tweakpane
```

## 🎬 ПОЛНЫЙ ПРИМЕР РЕАЛИЗАЦИИ КИНЕМАТИЧЕСКОЙ КАМЕРЫ:

Вот полный пример реализации системы кинематографической камеры в стиле Portal 2:

```javascript
/**
 * 🎬 CINEMATIC CAMERA SYSTEM (Portal 2 Style)
 * 
 * Система синематической камеры с плавными переходами,
 * автофокусом на карточках и движением по рельсам
 */

import * as THREE from 'three';
import gsap from 'gsap';

export class CinematicCamera {
  constructor(scene, camera, cards = []) {
    this.scene = scene;
    this.camera = camera;
    this.cards = cards;
    
    // Параметры камеры
    this.currentT = 0;           // Позиция на кривой (0..1)
    this.velocity = 0;           // Скорость движения
    this.targetT = 0;            // Целевая позиция
    
    // Настройки
    this.params = {
      acceleration: 0.0015,      // Ускорение
      friction: 0.92,            // Трение (инерция)
      maxVelocity: 0.008,        // Максимальная скорость
      lookAheadDistance: 0.06,   // Дистанция "взгляда вперёд"
      fov: 35,                   // Узкий FOV для кинематографики
      rotationSpeed: 0.07,       // Скорость поворота (SLERP)
      animationDuration: 2.5,    // Длительность GSAP анимаций
      easing: 'power2.inOut'     // Easing функция
    };
    
    // Состояние
    this.isAnimating = false;
    this.focusedCard = null;
    this.autoFocusEnabled = true;
    
    // Управление
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };
    
    // Waypoints (ключевые позиции)
    this.waypoints = [];
    
    // Кривая движения
    this.railCurve = null;
    this.railLine = null;
    
    // Quaternion для плавного вращения
    this.targetQuaternion = new THREE.Quaternion();
    this.targetLookAt = new THREE.Vector3();
    
    this.init();
  }
  
  init() {
    // Установка узкого FOV
    this.camera.fov = this.params.fov;
    this.camera.updateProjectionMatrix();
    
    // Создание waypoints
    this.createWaypoints();
    
    // Создание рельсовой кривой
    this.createRailCurve();
    
    // Установка начальной позиции
    this.updateCameraPosition();
    
    console.log('🎬 Cinematic Camera System initialized');
  }
  
  /**
   * Создание waypoints вдоль коридора
   */
  createWaypoints() {
    const corridorLength = 50;
    const numWaypoints = 8;
    const height = 2;
    
    for (let i = 0; i < numWaypoints; i++) {
      const z = (corridorLength / 2) - (i / (numWaypoints - 1)) * corridorLength;
      const x = 0; // Можно добавить небольшие отклонения
      const y = height + Math.sin(i * 0.5) * 0.3; // Лёгкие волны
      
      this.waypoints.push(new THREE.Vector3(x, y, z));
    }
  }
  
  /**
   * Создание Catmull-Rom кривой для плавного движения
   */
  createRailCurve() {
    this.railCurve = new THREE.CatmullRomCurve3(this.waypoints);
    this.railCurve.closed = false;
    this.railCurve.curveType = 'catmullrom';
    this.railCurve.tension = 0.5;
    
    // Визуализация рельсов (для отладки)
    this.visualizeRail();
  }
  
  /**
   * Визуализация пути камеры
   */
  visualizeRail(visible = true) {
    if (this.railLine) {
      this.scene.remove(this.railLine);
    }
    
    if (!visible) return;
    
    const points = this.railCurve.getPoints(200);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00,
      opacity: 0.3,
      transparent: true,
      linewidth: 2
    });
    
    this.railLine = new THREE.Line(geometry, material);
    this.scene.add(this.railLine);
    
    // Визуализация waypoints
    this.waypoints.forEach((point, index) => {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({ 
        color: index === 0 ? 0x00ff00 : (index === this.waypoints.length - 1 ? 0xff0000 : 0xffff00),
        opacity: 0.5,
        transparent: true
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(point);
      this.scene.add(sphere);
    });
  }
  
  /**
   * Обновление позиции камеры по рельсам
   */
  updateCameraPosition() {
    // Ограничение t в диапазоне [0, 1]
    this.currentT = THREE.MathUtils.clamp(this.currentT, 0, 1);
    
    // Получение позиции на кривой
    const position = this.railCurve.getPointAt(this.currentT);
    this.camera.position.copy(position);
    
    // Определение точки взгляда
    if (this.focusedCard && this.autoFocusEnabled) {
      // Фокус на выбранной карточке
      this.targetLookAt.copy(this.focusedCard.position);
    } else {
      // Взгляд вперёд по пути
      const lookAheadT = Math.min(this.currentT + this.params.lookAheadDistance, 1);
      this.targetLookAt.copy(this.railCurve.getPointAt(lookAheadT));
    }
    
    // Плавное вращение камеры (SLERP)
    this.smoothRotation();
  }
  
  /**
   * Плавное вращение камеры к цели (SLERP)
   */
  smoothRotation() {
    // Создаём матрицу lookAt для целевого quaternion
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(this.camera.position, this.targetLookAt, this.camera.up);
    this.targetQuaternion.setFromRotationMatrix(lookAtMatrix);
    
    // SLERP между текущим и целевым quaternion
    this.camera.quaternion.slerp(this.targetQuaternion, this.params.rotationSpeed);
  }
  
  /**
   * Обновление (вызывается каждый кадр)
   */
  update(deltaTime = 0.016) {
    if (this.isAnimating) return;
    
    // Применение управления клавиатурой
    if (this.keys.forward) {
      this.velocity -= this.params.acceleration;
    }
    if (this.keys.backward) {
      this.velocity += this.params.acceleration;
    }
    
    // Ограничение максимальной скорости
    this.velocity = THREE.MathUtils.clamp(
      this.velocity,
      -this.params.maxVelocity,
      this.params.maxVelocity
    );
    
    // Применение трения (инерция)
    this.velocity *= this.params.friction;
    
    // Обновление позиции
    this.currentT += this.velocity;
    
    // Обновление камеры
    this.updateCameraPosition();
    
    // Автофокус на ближайшую карточку
    if (this.autoFocusEnabled && !this.focusedCard) {
      this.autoFocusNearestCard();
    }
  }
  
  /**
   * Автофокус на ближайшую видимую карточку
   */
  autoFocusNearestCard() {
    if (this.cards.length === 0) return;
    
    let nearest = null;
    let minDistance = Infinity;
    
    this.cards.forEach(card => {
      const distance = this.camera.position.distanceTo(card.position);
      if (distance < minDistance && distance < 15) { // Радиус автофокуса
        minDistance = distance;
        nearest = card;
      }
    });
    
    if (nearest && nearest !== this.focusedCard) {
      this.targetLookAt.copy(nearest.position);
    }
  }
  
  /**
   * Плавный переход к определённому waypoint
   */
  moveToWaypoint(index) {
    if (index < 0 || index >= this.waypoints.length) return;
    
    const targetT = index / (this.waypoints.length - 1);
    this.animateToT(targetT);
  }
  
  /**
   * Анимация движения к позиции t на кривой
   */
  animateToT(targetT, duration = null) {
    this.isAnimating = true;
    
    gsap.to(this, {
      currentT: targetT,
      duration: duration || this.params.animationDuration,
      ease: this.params.easing,
      onUpdate: () => {
        this.updateCameraPosition();
      },
      onComplete: () => {
        this.isAnimating = false;
      }
    });
  }
  
  /**
   * Фокус на конкретной карточке с zoom эффектом
   */
  focusOnCard(card, zoom = true) {
    this.focusedCard = card;
    this.isAnimating = true;
    
    // Вычисляем оптимальную позицию камеры
    const direction = new THREE.Vector3(0, 0.3, 1).normalize();
    const distance = zoom ? 3 : 5;
    const targetPosition = card.position.clone().add(direction.multiplyScalar(distance));
    
    // Анимация позиции камеры
    gsap.to(this.camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: this.params.animationDuration,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.targetLookAt.copy(card.position);
        this.smoothRotation();
      },
      onComplete: () => {
        this.isAnimating = false;
      }
    });
    
    // Опционально: zoom FOV
    if (zoom) {
      gsap.to(this.camera, {
        fov: 30,
        duration: this.params.animationDuration * 0.7,
        ease: 'power2.out',
        onUpdate: () => {
          this.camera.updateProjectionMatrix();
        }
      });
    }
  }
  
  /**
   * Возврат к обычному режиму (отмена фокуса)
   */
  returnToRail() {
    this.focusedCard = null;
    this.isAnimating = true;
    
    // Находим ближайшую позицию на рельсах
    const closestPoint = this.railCurve.getClosestPoint(this.camera.position);
    const targetT = this.railCurve.getUtoTmapping(closestPoint);
    
    // Анимация возврата
    this.animateToT(targetT);
    
    // Восстановление FOV
    gsap.to(this.camera, {
      fov: this.params.fov,
      duration: this.params.animationDuration * 0.5,
      ease: 'power2.in',
      onUpdate: () => {
        this.camera.updateProjectionMatrix();
      }
    });
  }
  
  /**
   * Быстрые переходы
   */
  jumpToStart() {
    this.animateToT(0, 1.5);
  }
  
  jumpToEnd() {
    this.animateToT(1, 1.5);
  }
  
  /**
   * Переключение видимости рельсов
   */
  toggleRailVisualization() {
    if (this.railLine) {
      this.railLine.visible = !this.railLine.visible;
    }
  }
  
  /**
   * Установка параметров
   */
  setParams(newParams) {
    Object.assign(this.params, newParams);
    if (newParams.fov) {
      this.camera.fov = newParams.fov;
      this.camera.updateProjectionMatrix();
    }
  }
  
  /**
   * Cleanup
   */
  dispose() {
    if (this.railLine) {
      this.scene.remove(this.railLine);
    }
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.camera);
    gsap.killTweensOf(this.camera.position);
  }
}
```

## 🎮 УПРАВЛЕНИЕ КАМЕРОЙ

```javascript
/**
 * 🎮 CAMERA CONTROLS
 * 
 * Обработка управления камерой через клавиатуру и мышь
 */

export class CameraControls {
  constructor(cinematicCamera) {
    this.cinematicCamera = cinematicCamera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.enabled = true;
    
    this.init();
  }
  
  init() {
    // Обработка клавиатуры
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Обработка мыши
    window.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    console.log('🎮 Camera Controls initialized');
  }
  
  onKeyDown(event) {
    if (!this.enabled) return;
    
    switch(event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.cinematicCamera.keys.forward = true;
        break;
      
      case 'KeyS':
      case 'ArrowDown':
        this.cinematicCamera.keys.backward = true;
        break;
      
      case 'KeyA':
      case 'ArrowLeft':
        // Опционально: движение влево/вправо
        break;
      
      case 'KeyD':
      case 'ArrowRight':
        // Опционально: движение влево/вправо
        break;
      
      case 'Space':
        // Jump to next waypoint
        event.preventDefault();
        this.jumpToNextWaypoint();
        break;
      
      case 'Home':
        // Jump to start
        this.cinematicCamera.jumpToStart();
        break;
      
      case 'End':
        // Jump to end
        this.cinematicCamera.jumpToEnd();
        break;
      
      case 'Escape':
        // Return to rail mode
        this.cinematicCamera.returnToRail();
        break;
      
      case 'KeyR':
        // Toggle rail visualization
        this.cinematicCamera.toggleRailVisualization();
        break;
    }
  }
  
  onKeyUp(event) {
    if (!this.enabled) return;
    
    switch(event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.cinematicCamera.keys.forward = false;
        break;
      
      case 'KeyS':
      case 'ArrowDown':
        this.cinematicCamera.keys.backward = false;
        break;
      
      case 'KeyA':
      case 'ArrowLeft':
        this.cinematicCamera.keys.left = false;
        break;
      
      case 'KeyD':
      case 'ArrowRight':
        this.cinematicCamera.keys.right = false;
        break;
    }
  }
  
  onClick(event) {
    if (!this.enabled) return;
    
    // Raycasting для определения клика по карточке
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.cinematicCamera.camera);
    
    const intersects = this.raycaster.intersectObjects(
      this.cinematicCamera.cards,
      true // recursive
    );
    
    if (intersects.length > 0) {
      const clickedCard = intersects[0].object;
      
      // Находим родительскую карточку (если кликнули на child)
      let cardObject = clickedCard;
      while (cardObject.parent && !this.cinematicCamera.cards.includes(cardObject)) {
        cardObject = cardObject.parent;
      }
      
      if (this.cinematicCamera.cards.includes(cardObject)) {
        this.cinematicCamera.focusOnCard(cardObject, true);
        console.log('🎯 Focused on card:', cardObject.userData.word || 'unknown');
      }
    }
  }
  
  onMouseMove(event) {
    // Опционально: можно добавить легкий parallax эффект
    if (!this.enabled) return;
    
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  jumpToNextWaypoint() {
    const currentWaypoint = Math.floor(
      this.cinematicCamera.currentT * (this.cinematicCamera.waypoints.length - 1)
    );
    const nextWaypoint = Math.min(
      currentWaypoint + 1,
      this.cinematicCamera.waypoints.length - 1
    );
    
    this.cinematicCamera.moveToWaypoint(nextWaypoint);
  }
  
  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
```

Этот гайд предоставляет полную информацию для реализации кинематографической камеры в стиле Portal 2, включая все необходимые библиотеки, примеры кода, управление и рекомендации по настройке параметров.

Запомни