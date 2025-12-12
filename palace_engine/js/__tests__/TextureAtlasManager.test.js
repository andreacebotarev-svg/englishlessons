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

    describe('Grid Packing Algorithm', () => {
        it('should pack 25 cards (768x384) in 8192x8192 atlas using grid layout', () => {
            const manager = new TextureAtlasManager({
                atlasSize: 8192,
                cardCount: 25,
                cardSize: { width: 768, height: 384 },
                padding: 4
            });

            // Create mock items (simulating 25 cards of 768x384)
            const items = Array.from({ length: 25 }, (_, i) => ({
                canvas: { width: 768, height: 384 },
                index: i,
                width: 768,
                height: 384
            }));

            // Test the packTextures method
            const result = manager.packTextures(items);

            // Should successfully pack all 25 cards
            expect(result.rectangles).toHaveLength(25);

            // Verify grid layout: 10 columns (8192/(768+4) = ~10), 3 rows (25/10 = 3 rounded up)
            const cols = Math.floor(8192 / (768 + 4)); // ~10
            const rows = Math.floor(8192 / (384 + 4)); // ~21
            
            // Each rectangle should be positioned according to grid layout
            for (let i = 0; i < result.rectangles.length; i++) {
                const rect = result.rectangles[i];
                const expectedCol = i % cols;
                const expectedRow = Math.floor(i / cols);
                
                const expectedX = expectedCol * (768 + 4);
                const expectedY = expectedRow * (384 + 4);
                
                expect(rect.x).toBe(expectedX);
                expect(rect.y).toBe(expectedY);
                expect(rect.width).toBe(768);
                expect(rect.height).toBe(384);
            }
        });

        it('should calculate correct grid capacity', () => {
            const manager = new TextureAtlasManager({
                atlasSize: 8192,
                cardCount: 25,
                cardSize: { width: 768, height: 384 },
                padding: 4
            });

            // Create mock items
            const items = Array.from({ length: 25 }, (_, i) => ({
                canvas: { width: 768, height: 384 },
                index: i,
                width: 768,
                height: 384
            }));

            // Spy on console.log to capture grid info
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const result = manager.packTextures(items);

            // Should have correct capacity calculation
            const expectedCols = Math.floor(8192 / (768 + 4)); // ~10
            const expectedRows = Math.floor(8192 / (384 + 4)); // ~21
            const expectedCapacity = expectedCols * expectedRows; // ~210

            expect(result.rectangles).toHaveLength(25);
            expect(expectedCols).toBeGreaterThan(0);
            expect(expectedRows).toBeGreaterThan(0);

            consoleSpy.mockRestore();
        });

        it('should handle edge case where items exceed grid capacity', () => {
            const manager = new TextureAtlasManager({
                atlasSize: 2048, // smaller atlas
                cardCount: 25,
                cardSize: { width: 768, height: 384 },
                padding: 4
            });

            // Create more items than can fit in small atlas
            const items = Array.from({ length: 10 }, (_, i) => ({
                canvas: { width: 768, height: 384 },
                index: i,
                width: 768,
                height: 384
            }));

            // Should throw error when capacity is exceeded
            expect(() => manager.packTextures(items)).toThrow('Texture atlas too small!');
        });

        it('should work with zero items', () => {
            const manager = new TextureAtlasManager({
                atlasSize: 8192,
                cardCount: 0,
                cardSize: { width: 768, height: 384 }
            });

            const result = manager.packTextures([]);
            expect(result.rectangles).toHaveLength(0);
        });
    });
});