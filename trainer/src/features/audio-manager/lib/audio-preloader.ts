/**
 * Audio preloading utilities
 */

export class AudioPreloader {
  private cache: Map<string, HTMLAudioElement> = new Map();
  
  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.loadAudio(url));
    await Promise.all(promises);
  }
  
  private async loadAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      
      audio.addEventListener('canplaythrough', () => {
        this.cache.set(url, audio);
        resolve();
      });
      
      audio.addEventListener('error', reject);
      
      audio.load();
    });
  }
  
  play(url: string): void {
    const audio = this.cache.get(url);
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }
}
