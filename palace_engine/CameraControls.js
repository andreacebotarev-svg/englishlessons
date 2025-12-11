/**
 * 🎮 CAMERA CONTROLS
 * 
 * Обработка управления камерой через клавиатуру и мышь
 */
import * as THREE from 'three';

export class CameraControls {
  constructor(cinematicCamera, domElement = window) {
    this.cinematicCamera = cinematicCamera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.domElement = domElement;
    this.enabled = true;
    
    // Состояние для вращения мышью
    this.isMouseDown = false;
    this.rotationEnabled = false;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.mouseSensitivity = 0.002;
    
    this.init();
  }
  
  init() {
    // Обработка клавиатуры
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this));
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Обработка мыши
    if (this.domElement !== window) {
      this.domElement.addEventListener('click', this.onClick.bind(this));
      this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
      this.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
      this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    } else {
      window.addEventListener('click', this.onClick.bind(this));
      window.addEventListener('mousedown', this.onMouseDown.bind(this));
      window.addEventListener('mouseup', this.onMouseUp.bind(this));
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
    
    console.log('🎮 Camera Controls initialized');
  }
  
  onMouseDown(event) {
    if (!this.enabled) return;
    if (event.button === 0) { // Левая кнопка мыши
      this.isMouseDown = true;
      this.rotationEnabled = true;
    }
  }
  
  onMouseUp(event) {
    if (event.button === 0) {
      this.isMouseDown = false;
      this.rotationEnabled = false;
    }
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
        // Включаем обратно автофокус
        this.cinematicCamera.autoFocusEnabled = true;
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
    if (!this.enabled) return;
    
    // Обновление координат для raycasting
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Вращение камеры при зажатой мыши
    if (this.rotationEnabled && this.isMouseDown) {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      
      // Получаем текущую ориентацию камеры
      this.euler.setFromQuaternion(this.cinematicCamera.camera.quaternion);
      
      // Применяем вращение
      this.euler.y -= movementX * this.mouseSensitivity;
      this.euler.x -= movementY * this.mouseSensitivity;
      
      // Ограничение вращения по вертикали
      this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
      
      // Обновляем quaternion камеры
      this.cinematicCamera.camera.quaternion.setFromEuler(this.euler);
      
      // Отключаем автофокус при ручном вращении
      this.cinematicCamera.autoFocusEnabled = false;
    }
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
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
