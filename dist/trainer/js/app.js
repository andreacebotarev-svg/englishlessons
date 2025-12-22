import { Router } from './router.js';
import { Storage } from './storage.js';
import { LessonLoader } from './lessons.js';
import { Pages } from './pages.js';

class App {
  constructor() {
    this.storage = new Storage();
    this.lessonLoader = new LessonLoader();
    this.router = new Router();
    this.pages = new Pages(this.storage, this.lessonLoader, this.router);
    
    this.init();
  }

  init() {
    // Register routes
    this.router.register('/', () => this.pages.renderLessonSelect());
    this.router.register('/lesson/:id', (params) => this.pages.renderLessonTrainer(params));
    this.router.register('/results', () => this.pages.renderResults());

    // Hide loader after initialization
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
          loader.classList.add('hidden');
          setTimeout(() => loader.remove(), 300);
        }
      }, 500);
    });

    // Handle errors
    window.addEventListener('error', (e) => {
      console.error('Application error:', e.error);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
    });

    console.log('English Reading Trainer initialized');
  }
}

// Initialize app
new App();