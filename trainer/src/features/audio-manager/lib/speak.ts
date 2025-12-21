/**
 * Озвучивает текст через Web Speech API
 * @param text - текст для озвучивания (слово или фонема)
 * @param rate - скорость речи (0.5 = медленно, 1.0 = нормально)
 */
export const speak = (text: string, rate: number = 0.8): void => {
  if (!window.speechSynthesis) {
    console.warn('Web Speech API не поддерживается браузером');
    return;
  }

  // Останавливаем предыдущее озвучивание
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // Английский язык
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Пытаемся найти английский голос
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
  
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Останавливает текущее озвучивание
 */
export const stopSpeaking = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
