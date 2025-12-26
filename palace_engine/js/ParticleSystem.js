/* ============================================
   PARTICLE SYSTEM WITH DETERMINISTIC PHYSICS
   Система частиц с фиксированным timestep
   Last update: 2025-12-11
   ============================================ */

/**
 * Детерминированная система частиц для визуальных эффектов
 * 
 * Примеры использования:
 * - Конфетти при правильном ответе в квизе
 * - Искры при наведении на карточку
 * - След за камерой при быстром движении
 * - Взрыв при ошибке
 */

class Particle {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.life = 0;
        this.maxLife = 1000;
        this.size = 5;
        this.color = '#FFD60A';
        this.alpha = 1;
        this.gravity = 0.5;
        this.friction = 0.98;
        this.element = null;
    }
    
    init(config) {
        this.active = true;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.z = config.z || 0;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.vz = config.vz || 0;
        this.life = 0;
        this.maxLife = config.maxLife || 1000;
        this.size = config.size || 5;
        this.color = config.color || '#FFD60A';
        this.alpha = 1;
        this.gravity = config.gravity !== undefined ? config.gravity : 0.5;
        this.friction = config.friction || 0.98;
        
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.className = 'particle';
            this.element.style.cssText = `
                position: absolute;
                pointer-events: none;
                border-radius: 50%;
                will-change: transform, opacity;
            `;
        }
        
        this.updateStyle();
    }
    
    update(dt) {
        if (!this.active) return;
        
        // Физика с fixed timestep
        this.vy += this.gravity * (dt / 16.67); // Нормализуем к 60 FPS
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vz *= this.friction;
        
        this.x += this.vx * (dt / 16.67);
        this.y += this.vy * (dt / 16.67);
        this.z += this.vz * (dt / 16.67);
        
        // Жизненный цикл
        this.life += dt;
        const lifeProgress = this.life / this.maxLife;
        this.alpha = 1 - lifeProgress;
        
        if (this.life >= this.maxLife) {
            this.deactivate();
        } else {
            this.updateStyle();
        }
    }
    
    updateStyle() {
        if (!this.element) return;
        
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = this.color;
        this.element.style.opacity = this.alpha;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, ${this.z}px)`;
    }
    
    deactivate() {
        this.active = false;
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export class ParticleSystem {
    constructor(gameLoop, containerSelector = '#world') {
        this.gameLoop = gameLoop;
        this.container = document.querySelector(containerSelector);
        
        if (!this.container) {
            console.error('[ParticleSystem] Container not found:', containerSelector);
            return;
        }
        
        // Object pooling
        this.pool = [];
        this.poolSize = 200;
        this.activeParticles = [];
        
        this.initPool();
        this.subscribeToGameLoop();
        
        console.log('✨ ParticleSystem initialized');
    }
    
    initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            this.pool.push(new Particle());
        }
    }
    
    subscribeToGameLoop() {
        if (!this.gameLoop) {
            console.warn('[ParticleSystem] No GameLoop provided');
            return;
        }
        
        // Обновляем частицы с fixed timestep
        this.gameLoop.onUpdate((dt) => {
            this.activeParticles.forEach(particle => particle.update(dt));
            
            // Удаляем неактивные
            this.activeParticles = this.activeParticles.filter(p => p.active);
        });
    }
    
    /**
     * Получить частицу из пула
     */
    getParticle() {
        for (let particle of this.pool) {
            if (!particle.active) {
                return particle;
            }
        }
        
        // Если пул закончился, создаём новую
        const newParticle = new Particle();
        this.pool.push(newParticle);
        return newParticle;
    }
    
    /**
     * Создать одну частицу
     */
    emit(config) {
        const particle = this.getParticle();
        particle.init(config);
        this.activeParticles.push(particle);
        this.container.appendChild(particle.element);
    }
    
    /**
     * Создать взрыв частиц
     */
    burst(x, y, z, count = 20, config = {}) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = config.speed || 5;
            const spread = config.spread || 1;
            
            this.emit({
                x, y, z,
                vx: Math.cos(angle) * speed * (0.5 + Math.random() * spread),
                vy: -Math.abs(Math.sin(angle) * speed * (0.5 + Math.random() * spread)),
                vz: (Math.random() - 0.5) * speed * 0.5,
                size: config.size || 5,
                color: config.color || '#FFD60A',
                maxLife: config.maxLife || 1000,
                gravity: config.gravity !== undefined ? config.gravity : 0.5,
                friction: config.friction || 0.98
            });
        }
    }
    
    /**
     * Конфетти (падающие сверху)
     */
    confetti(x, y, z, count = 50) {
        const colors = ['#FFD60A', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
        
        for (let i = 0; i < count; i++) {
            this.emit({
                x: x + (Math.random() - 0.5) * 200,
                y: y - 100,
                z: z + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2 - 5,
                vz: (Math.random() - 0.5) * 2,
                size: 3 + Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                maxLife: 2000 + Math.random() * 1000,
                gravity: 0.3,
                friction: 0.99
            });
        }
    }
    
    /**
     * Искры (короткие яркие вспышки)
     */
    sparkle(x, y, z, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            
            this.emit({
                x, y, z,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                vz: (Math.random() - 0.5) * speed,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#FFD60A' : '#FFFFFF',
                maxLife: 300 + Math.random() * 200,
                gravity: 0.1,
                friction: 0.95
            });
        }
    }
    
    /**
     * Взрыв (резкое расширение)
     */
    explosion(x, y, z, count = 30) {
        this.burst(x, y, z, count, {
            speed: 8,
            spread: 1.5,
            size: 6,
            color: '#FF6B6B',
            maxLife: 800,
            gravity: 0.2,
            friction: 0.96
        });
    }
    
    /**
     * След (непрерывный шлейф)
     */
    trail(x, y, z, vx, vy, vz) {
        this.emit({
            x, y, z,
            vx: -vx * 0.2 + (Math.random() - 0.5) * 0.5,
            vy: -vy * 0.2 + (Math.random() - 0.5) * 0.5,
            vz: -vz * 0.2 + (Math.random() - 0.5) * 0.5,
            size: 3,
            color: 'rgba(255, 214, 10, 0.6)',
            maxLife: 500,
            gravity: 0,
            friction: 0.97
        });
    }
    
    /**
     * Очистить все частицы
     */
    clear() {
        this.activeParticles.forEach(p => p.deactivate());
        this.activeParticles = [];
    }
}

/**
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ:
 * 
 * // В app.js или camera.js
 * import { ParticleSystem } from './ParticleSystem.js';
 * 
 * // Инициализация
 * const particles = new ParticleSystem(gameLoop, '#world');
 * 
 * // При правильном ответе в квизе
 * particles.confetti(cardX, cardY, cardZ, 50);
 * 
 * // При наведении на карточку
 * particles.sparkle(cardX, cardY, cardZ, 10);
 * 
 * // При ошибке
 * particles.explosion(cardX, cardY, cardZ, 20);
 * 
 * // След за камерой (в updateMovement)
 * if (this.keys.forward && this.keys.sprint) {
 *     particles.trail(this.x, this.y, this.z, this.velocity.x, this.velocity.y, this.velocity.z);
 * }
 */