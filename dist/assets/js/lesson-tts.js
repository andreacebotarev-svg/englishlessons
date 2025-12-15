/**
 * LESSON TTS (Text-to-Speech) MODULE
 * Handles audio playback using Google Translate TTS
 */

class LessonTTS {
  constructor() {
    this.currentAudio = null;
  }

  /**
   * Clean text for TTS
   * @param {string} text - Raw text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';
    
    // Remove translation markers and extra whitespace
    let cleaned = text.replace(/\[translate:|\]/gi, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Speak a single word or phrase
   * @param {string} text - Text to speak
   * @param {string} lang - Language code (default: 'en')
   */
  speak(text, lang = 'en') {
    const cleaned = this.cleanText(text);
    if (!cleaned) return;

    // Stop current audio if playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    // Construct Google TTS URL
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleaned)}&tl=${lang}&client=tw-ob`;
    
    try {
      this.currentAudio = new Audio(url);
      this.currentAudio.play().catch(err => {
        console.error('TTS playback error:', err);
      });
    } catch (e) {
      console.error('TTS error:', e);
    }
  }

  /**
   * Speak multiple texts in sequence
   * @param {Array<string>} texts - Array of texts to speak
   * @param {number} delay - Delay between each text in ms (default: 800)
   */
  async speakSequence(texts, delay = 800) {
    for (let i = 0; i < texts.length; i++) {
      this.speak(texts[i]);
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Stop current audio playback
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }

  /**
   * Vibrate device (if supported)
   * @param {number} duration - Vibration duration in ms
   */
  vibrate(duration = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
}