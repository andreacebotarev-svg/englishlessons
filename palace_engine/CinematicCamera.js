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
    const points = this.railCurve.getPoints(100);
    let minDistance = Infinity;
    let closestIndex = 0;
    
    points.forEach((point, index) => {
      const distance = this.camera.position.distanceTo(point);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    const targetT = closestIndex / (points.length - 1);
    
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
