/**
 * Audio Manager
 * Handles sound playback using Web Speech API
 */

let synth = null;

if (typeof window !== 'undefined' && window.speechSynthesis) {
    synth = window.speechSynthesis;
}

export function playPhoneme(phoneme) {
    if (!synth) return;
    
    const utterance = new SpeechSynthesisUtterance(phoneme);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    synth.speak(utterance);
}

export function playWord(word) {
    if (!synth) return;
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    synth.speak(utterance);
}

export function playSuccess() {
    // Simple beep for success
    console.log('DING! 🔔');
}

export function playError() {
    // Simple buzz for error
    console.log('BUZZ! ❌');
}
