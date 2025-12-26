/**
 * 🖼️ TEXTURE GENERATOR FOR CARDS
 * 
 * Creates beautiful canvas textures for Three.js card materials
 * Following Portal 2 style with gradient background and elegant text
 */

import * as THREE from 'three';

/**
 * Загрузить изображение асинхронно
 */
function loadImageAsync(imagePath) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            resolve(img);
        };
        
        img.onerror = () => {
            console.warn(`⚠️ Failed to load image: ${imagePath}`);
            reject(null);
        };
        
        img.src = `../images/${imagePath}`;
        
        // Timeout 5 секунд
        setTimeout(() => {
            if (!img.complete) {
                console.warn(`⏱️ Image load timeout: ${imagePath}`);
                reject(null);
            }
        }, 5000);
    });
}

/**
 * Нарисовать фон карточки
 */
function drawBackground(ctx, width, height) {
    // Градиент от тёмно-синего к синему
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f3460');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Рамка
    ctx.strokeStyle = 'rgba(15, 76, 117, 0.8)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);
}

/**
 * Нарисовать текст на карточке
 */
function drawText(ctx, word, translation, transcription, example, width, height) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 1. Слово (крупно, белый)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "SF Pro Display", Arial, sans-serif';
    ctx.fillText(word, width / 2, 120);
    
    // 2. Транскрипция (под словом, серый)
    if (transcription) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '28px "SF Pro Display", Arial, sans-serif';
        ctx.fillText(transcription, width / 2, 170);
    }
    
    // 3. Пример (внизу, мелкий)
    if (example) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'italic 24px "SF Pro Display", Arial, sans-serif';
        
        // Перенос текста если слишком длинный
        const maxWidth = width - 40;
        const words = example.split(' ');
        let line = '';
        let y = height - 100;
        
        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, width / 2, y);
                line = word + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width / 2, y);
    }
    
    // 4. Перевод (самый низ, скрыт по умолчанию — будет в quiz режиме)
    // НЕ рисуем здесь, будет в HTML overlay
}

/**
 * Нарисовать изображение на карточке
 */
async function drawImage(ctx, imagePath, width, height) {
    try {
        const img = await loadImageAsync(imagePath);
        
        if (!img) return;
        
        // Размеры области для картинки (центр карточки)
        const imageAreaWidth = width - 100;
        const imageAreaHeight = 200;
        const imageX = 50;
        const imageY = 220;
        
        // Вычислить масштаб (cover)
        const scale = Math.max(
            imageAreaWidth / img.width,
            imageAreaHeight / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Центрировать
        const offsetX = imageX + (imageAreaWidth - scaledWidth) / 2;
        const offsetY = imageY + (imageAreaHeight - scaledHeight) / 2;
        
        // Rounded corners clip
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imageX, imageY, imageAreaWidth, imageAreaHeight, 12);
        ctx.clip();
        
        // Нарисовать изображение
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        
        ctx.restore();
        
    } catch (error) {
        console.warn('Image drawing failed:', error);
    }
}

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Создать текстуру для карточки
 * @param {Object} options
 * @param {string} options.word - Английское слово
 * @param {string} options.translation - Русский перевод
 * @param {string} [options.imagePath] - Путь к картинке
 * @param {string} [options.example] - Пример использования
 * @param {string} [options.transcription] - Транскрипция
 * @returns {Promise<THREE.CanvasTexture>}
 */
export async function createCardTexture({ 
    word, 
    translation, 
    imagePath = null, 
    example = null, 
    transcription = null 
}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    
    const ctx = canvas.getContext('2d');
    
    // 1. Фон
    drawBackground(ctx, canvas.width, canvas.height);
    
    // 2. Изображение (если есть)
    if (imagePath) {
        await drawImage(ctx, imagePath, canvas.width, canvas.height);
    }
    
    // 3. Текст
    drawText(ctx, word, translation, transcription, example, canvas.width, canvas.height);
    
    // 4. Создать Three.js текстуру
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    console.log(`✅ Texture created for: "${word}"`);
    
    return texture;
}

/**
 * Создать placeholder текстуру (для быстрой загрузки)
 */
export function createPlaceholderTexture(word) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    
    const ctx = canvas.getContext('2d');
    
    // Серый фон
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Текст
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word, canvas.width / 2, canvas.height / 2);
    
    return new THREE.CanvasTexture(canvas);
}