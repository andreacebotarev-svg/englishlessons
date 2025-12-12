import { describe, it, expect } from 'vitest';
import { TextureAtlasManager } from '../TextureAtlasManager.js';

describe('TextureAtlasManager', () => {
    describe('Dynamic Atlas Sizing', () => {
        it('should calculate correct atlas size for 25 cards (768x384)', () => {
            const manager = new TextureAtlasManager({
                cardCount: 25,
                cardSize: { width: 768, height: 384 }
            });
            
            // 25 cards × 768×384 = 7,372,800 pixels
            // With 75% efficiency: 7,372,800 / 0.75 = 9,830,400 pixels needed
            // sqrt(9,830,400) = 3,135px → next power of 2 = 4096px
            
            // BUT we set minimum to 4096, so it should use that
            expect(manager.atlasSize).toBeGreaterThanOrEqual(4096);
            expect(manager.atlasSize).toBeLessThanOrEqual(8192);
        });
        
        it('should upgrade atlas size if too small', () => {
            const manager = new TextureAtlasManager({
                atlasSize: 2048, // intentionally too small
                cardCount: 25,
                cardSize: { width: 768, height: 384 }
            });
            
            // Should auto-upgrade to 4096 or higher
            expect(manager.atlasSize).toBeGreaterThanOrEqual(4096);
        });
        
        it('should NOT exceed 8192px limit', () => {
            const manager = new TextureAtlasManager({
                cardCount: 500, // way too many cards
                cardSize: { width: 1024, height: 512 }
            });
            
            // Should cap at 8192
            expect(manager.atlasSize).toBeLessThanOrEqual(8192);
        });
    });
    
    describe('Pre-check in createAtlas', () => {
        it('should throw error if atlas is too large', async () => {
            const manager = new TextureAtlasManager({
                atlasSize: 2048,
                cardCount: 100,
                cardSize: { width: 1024, height: 512 }
            });
            
            const mockWords = Array(100).fill({
                en: 'test',
                ru: 'тест',
                transcription: '[test]',
                image: null,
                example: 'Test example'
            });
            
            await expect(manager.createAtlas(mockWords)).rejects.toThrow('Atlas would be too large');
        });
    });
});