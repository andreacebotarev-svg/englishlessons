/**
 * 🖼️ TEXTURE GENERATOR FOR CARDS
 * 
 * Creates beautiful canvas textures for Three.js card materials
 * Following Portal 2 style with gradient background and elegant text
 */

import * as THREE from 'three';

/**
 * Creates a texture for a card from word data
 * @param {Object} word - Word data object with en, ru, image, example, transcription
 * @returns {THREE.CanvasTexture} - Canvas texture for the card
 */
function createCardTexture(word, translation, imagePath, example, transcription) {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background (like Portal 2 style)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e'); // Dark blue
    gradient.addColorStop(1, '#0f3460'); // Rich blue
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = 'rgba(15, 76, 117, 0.8)';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    // Add inner glow effect
    ctx.shadowColor = 'rgba(15, 76, 117, 0.5)';
    ctx.shadowBlur = 15;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    ctx.shadowBlur = 0;
    
    // Draw word (English)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Wrap text if too long
    const maxWidth = canvas.width - 60;
    wrapText(ctx, word, canvas.width / 2, 40, maxWidth, 80);
    
    // Draw translation (Russian)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '48px Arial';
    ctx.fillText(translation, canvas.width / 2, 140);
    
    // Draw transcription if available
    if (transcription) {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.font = '36px Arial';
        ctx.fillText(transcription, canvas.width / 2, 200);
    }
    
    // Draw example if available
    if (example) {
        ctx.fillStyle = 'rgba(220, 220, 220, 0.8)';
        ctx.font = '32px Arial';
        wrapText(ctx, example, canvas.width / 2, 260, maxWidth - 100, 40);
    }
    
    // Draw image if available
    if (imagePath) {
        drawImageOnCanvas(ctx, imagePath, canvas.width / 2, 380, 200, 100);
    }
    
    // Create and return Three.js texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

/**
 * Wraps text to fit within a specified width
 */
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
    
    return currentY;
}

/**
 * Draws an image on the canvas
 */
function drawImageOnCanvas(ctx, imagePath, x, y, width, height) {
    if (!imagePath) return;
    
    // Create image element
    const img = new Image();
    img.crossOrigin = "Anonymous"; // For cross-origin images
    
    // Draw placeholder rectangle while image loads
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    const imgX = x - width / 2;
    const imgY = y - height / 2;
    ctx.fillRect(imgX, imgY, width, height);
    
    // Draw placeholder text
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Loading Image', x, y);
    
    // Attempt to load the image
    img.onload = () => {
        // Draw image with rounded corners
        ctx.save();
        ctx.beginPath();
        // Note: roundRect might not be supported in all browsers
        ctx.rect(imgX, imgY, width, height);
        ctx.clip();
        
        ctx.drawImage(img, imgX, imgY, width, height);
        ctx.restore();
    };
    
    img.onerror = () => {
        // If image fails to load, draw placeholder
        ctx.fillStyle = 'rgba(150, 150, 150, 0.4)';
        ctx.fillRect(imgX, imgY, width, height);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.fillText('No Image', x, y);
    };
    
    // Set the source to trigger loading
    // For this implementation, we'll use a placeholder if the image isn't available
    try {
        img.src = `../images/${imagePath}`;
    } catch (e) {
        console.warn('Could not load image:', imagePath);
    }
}

/**
 * Creates a placeholder texture while loading real image
 */
function createPlaceholderTexture(word, translation) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f3460');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = 'rgba(15, 76, 117, 0.8)';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
    
    // Draw word
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    wrapText(ctx, word, canvas.width / 2, 100, canvas.width - 60, 80);
    
    // Draw translation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '48px Arial';
    wrapText(ctx, translation, canvas.width / 2, 220, canvas.width - 60, 60);
    
    // Draw loading text
    ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.font = '36px Arial';
    ctx.fillText('Loading...', canvas.width / 2, 350);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

export { createCardTexture, createPlaceholderTexture };