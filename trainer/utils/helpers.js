/**
 * Helper Utilities
 */

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Wait/delay utility
 */
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
