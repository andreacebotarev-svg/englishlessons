import { useCallback, useEffect, useRef } from 'react';

/**
 * Audio management hook
 * Handles sound playback using Web Speech API or preloaded MP3s
 */
export function useAudio() {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);
  
  const playPhoneme = useCallback((phoneme: string) => {
    // TODO: Implement phoneme playback
    if (!synthRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(phoneme);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    synthRef.current.speak(utterance);
  }, []);
  
  const playWord = useCallback((word: string) => {
    // TODO: Implement word playback
    if (!synthRef.current) return;
    
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    synthRef.current.speak(utterance);
  }, []);
  
  const playSuccess = useCallback(() => {
    // TODO: Implement success sound
    console.log('Success sound!');
  }, []);
  
  const playError = useCallback(() => {
    // TODO: Implement error sound
    console.log('Error sound!');
  }, []);
  
  return {
    playPhoneme,
    playWord,
    playSuccess,
    playError,
  };
}
