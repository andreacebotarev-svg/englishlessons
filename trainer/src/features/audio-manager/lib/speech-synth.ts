/**
 * Web Speech API wrapper utilities
 */

export class SpeechSynthWrapper {
  private synth: SpeechSynthesis | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }
  
  speak(text: string, options?: { rate?: number; lang?: string }): void {
    if (!this.synth) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.lang || 'en-US';
    utterance.rate = options?.rate || 0.8;
    
    this.synth.speak(utterance);
  }
  
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
