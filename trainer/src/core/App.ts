/**
 * Main Application class
 * Manages app lifecycle and coordinates core systems
 */

import { Router } from './Router';
import { EventBus } from './EventBus';

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
      // Register routes
      await this.registerRoutes();
      
      // Start router
      this.router.start();
      
      console.log('✅ Application started successfully');
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      throw error;
    }
  }
  
  /**
   * Register all application routes
   */
  private async registerRoutes(): Promise<void> {
    // Lazy load pages
    this.router.register('/', async () => {
      const { LessonSelectPage } = await import('@/pages/LessonSelectPage');
      return LessonSelectPage;
    });
    
    this.router.register('/lesson/:id', async () => {
      const { LessonTrainerPage } = await import('@/pages/LessonTrainerPage');
      return LessonTrainerPage;
    });
    
    this.router.register('/results', async () => {
      const { ResultsPage } = await import('@/pages/ResultsPage');
      return ResultsPage;
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
   * Get EventBus instance for cross-component communication
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
}
