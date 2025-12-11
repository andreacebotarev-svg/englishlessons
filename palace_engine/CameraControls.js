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
    
    this.init();
  }
  
  init() {
    // Обработка клавиатуры
    this.domElement.addEventListener('keydown', this.onKeyDown.bind(this));
    this.domElement.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Обработка мыши - только если domElement поддерживает мышиные события
    if (this.domElement !== window) {
      this.domElement.addEventListener('click', this.onClick.bind(this));
      this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    } else {
      window.addEventListener('click', this.onClick.bind(this));
      window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
    
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
