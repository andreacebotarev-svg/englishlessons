/* ============================================
   TIME SCALING FOR GAMELOOP
   Замедление/ускорение времени для эффектов
   Last update: 2025-12-11
   ============================================ */

/**
 * Система масштабирования времени
 * 
 * Примеры:
 * - Slow-mo при правильном ответе (0.3x)
 * - Ускорение при пропуске анимаций (2x)
 * - Пауза для меню (0x)
 * - Буллет-тайм при критическом моенте (0.1x)
 */

export class TimeScaling {
    constructor(gameLoop) {
        this.gameLoop = gameLoop;
        this.currentScale = 1.0;
        this.targetScale = 1.0;
        this.transitionSpeed = 5.0; // Скорость плавного перехода
        
        // Предустановки
        this.presets = {
            pause: 0,
            bulletTime: 0.1,
            slowMo: 0.3,
            halfSpeed: 0.5,
            normal: 1.0,
            fastForward: 2.0,
            ultraFast: 5.0
        };
        
        this.wrapGameLoop();
        console.log('⏱️ TimeScaling initialized');
    }
    
    /**
     * Оборачиваем GameLoop для масштабирования dt
     */
    wrapGameLoop() {
        if (!this.gameLoop) {
            console.error('[TimeScaling] GameLoop not provided');
            return;
        }
        
        // Сохраняем оригинальный onUpdate
        const originalOnUpdate = this.gameLoop.onUpdate.bind(this.gameLoop);
        
        // Переопределяем onUpdate
        this.gameLoop.onUpdate = (callback) => {
            return originalOnUpdate((dt) => {
                // Плавный переход к target scale
                if (Math.abs(this.currentScale - this.targetScale) > 0.01) {
                    const delta = this.targetScale - this.currentScale;
                    this.currentScale += delta * this.transitionSpeed * (dt / 1000);
                } else {
                    this.currentScale = this.targetScale;
                }
                
                // Применяем масштаб
                const scaledDt = dt * this.currentScale;
                callback(scaledDt);
            });
        };
    }
    
    /**
     * Установить масштаб времени (плавно)
     * @param {number} scale - 0.0 (пауза) до 5.0 (ультрабыстро)
     */
    setScale(scale) {
        this.targetScale = Math.max(0, Math.min(5, scale));
        console.log(`⏱️ Time scale: ${this.currentScale.toFixed(2)}x → ${this.targetScale.toFixed(2)}x`);
    }
    
    /**
     * Установить масштаб мгновенно
     */
    setScaleInstant(scale) {
        this.currentScale = Math.max(0, Math.min(5, scale));
        this.targetScale = this.currentScale;
        console.log(`⏱️ Time scale (instant): ${this.currentScale.toFixed(2)}x`);
    }
    
    /**
     * Использовать предустановку
     */
    usePreset(presetName) {
        if (this.presets[presetName] !== undefined) {
            this.setScale(this.presets[presetName]);
        } else {
            console.warn(`[TimeScaling] Unknown preset: ${presetName}`);
        }
    }
    
    /**
     * Вернуть к нормальной скорости
     */
    reset() {
        this.setScale(1.0);
    }
    
    /**
     * Временный эффект (slow-mo на N секунд)
     */
    async temporaryEffect(scale, durationMs) {
        const originalScale = this.targetScale;
        this.setScale(scale);
        
        // Ждём в реальном времени (не в scaled)
        await this.wait(durationMs);
        
        this.setScale(originalScale);
    }
    
    /**
     * Пауза на N миллисекунд (реальных)
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Получить текущий масштаб
     */
    getScale() {
        return this.currentScale;
    }
    
    /**
     * Проверить, на паузе ли
     */
    isPaused() {
        return this.currentScale === 0;
    }
}

/**
 * ПРИМЕР ИСПОЛЬЗОВАНИЯ:
 * 
 * // В app.js
 * import { TimeScaling } from './TimeScaling.js';
 * 
 * // Инициализация (ДО инициализации камеры!)
 * const gameLoop = new GameLoop({ targetFPS: 60, debug: true });
 * const timeScaling = new TimeScaling(gameLoop);
 * 
 * // При правильном ответе в квизе
 * timeScaling.temporaryEffect(0.3, 1500); // Slow-mo на 1.5 секунды
 * 
 * // При открытии меню
 * timeScaling.usePreset('pause');
 * 
 * // При закрытии меню
 * timeScaling.reset();
 * 
 * // Bullet-time при критическом моменте
 * timeScaling.usePreset('bulletTime');
 * setTimeout(() => timeScaling.reset(), 2000);
 * 
 * // Ускорение для skip анимаций
 * timeScaling.usePreset('fastForward');
 * 
 * // Произвольный масштаб
 * timeScaling.setScale(0.5); // 50% скорости
 * 
 * // Проверка состояния
 * if (timeScaling.isPaused()) {
 *     console.log('Игра на паузе');
 * }
 * 
 * console.log('Current speed:', timeScaling.getScale() + 'x');
 */

/**
 * ПРИМЕР ИНТЕГРАЦИИ С QUIZ-MANAGER:
 * 
 * // В quiz-manager.js
 * initQuiz(card) {
 *     // Замедляем время при открытии квиза
 *     if (window.timeScaling) {
 *         window.timeScaling.temporaryEffect(0.5, 500);
 *     }
 *     
 *     // ... остальной код ...
 * }
 * 
 * handleCorrectAnswer() {
 *     // Slow-mo при правильном ответе
 *     if (window.timeScaling) {
 *         window.timeScaling.temporaryEffect(0.3, 1000);
 *     }
 *     
 *     // + конфетти из ParticleSystem
 *     if (window.particles) {
 *         window.particles.confetti(cardX, cardY, cardZ, 50);
 *     }
 * }
 * 
 * handleWrongAnswer() {
 *     // Микро-фриз при ошибке
 *     if (window.timeScaling) {
 *         window.timeScaling.setScaleInstant(0.1);
 *         setTimeout(() => window.timeScaling.reset(), 100);
 *     }
 * }
 */