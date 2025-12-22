/**
 * Main Application class
 * Manages app lifecycle and coordinates core systems
 */

import { Router } from './Router';
import { EventBus } from './EventBus';
import { routes } from './routes';

export class App {
  private router: Router;
  private eventBus: EventBus;
  
  constructor(private container: HTMLElement) {
    this.eventBus = new EventBus();
    this.router = new Router(container, this.eventBus);
    
    this.setupErrorHandling();
  }
  
  /**
   * Start the application
   */
  async start(): Promise<void> {
    console.log('🚀 Starting English Phonics Trainer...');
    
    try {
      // Show initial loader
      this.showLoader();
      
      // Register routes
      this.registerRoutes();
      
      // Small delay to show loader (smoother UX)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Hide loader and start router
      this.hideLoader();
      this.router.start();
      
      console.log('✅ Application started successfully');
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      this.hideLoader();
      throw error;
    }
  }
  
  /**
   * Register all application routes
   */
  private registerRoutes(): void {
    routes.forEach(route => {
      this.router.register(route.path, route.loader);
    });
  }
  
  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error:', event.error);
      this.eventBus.emit('app:error', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      this.eventBus.emit('app:error', event.reason);
    });
  }
  
  /**
   * Show application loader
   */
  private showLoader(): void {
    this.container.innerHTML = `
      <div id="app-loader" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <h1 style="
          color: white;
          margin-top: 2rem;
          font-size: 1.5rem;
          font-weight: 700;
        ">
          📚 English Phonics Trainer
        </h1>
        <p style="
          color: rgba(255, 255, 255, 0.8);
          margin-top: 0.5rem;
          font-size: 0.875rem;
        ">
          Загрузка приложения...
        </p>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }
  
  /**
   * Hide application loader
   */
  private hideLoader(): void {
    const loader = document.getElementById('app-loader');
    if (loader) {
      // Fade out animation
      loader.style.transition = 'opacity 0.3s ease-out';
      loader.style.opacity = '0';
      
      setTimeout(() => {
        loader.remove();
      }, 300);
    }
  }
  
  /**
   * Get EventBus instance for cross-component communication
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
  
  /**
   * Get Router instance
   */
  getRouter(): Router {
    return this.router;
  }
}
