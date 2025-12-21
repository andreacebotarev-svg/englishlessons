/**
 * WordCard Component
 * Displays the word image/emoji
 */

export function WordCard(word) {
    return `
        <div class="visual-cue" 
             id="word-image" 
             data-word="${word.text}"
             onclick="window.playWord('${word.text}')">
            ${word.image}
        </div>
    `;
}
