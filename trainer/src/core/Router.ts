/**
 * Hash-based Router
 * Handles navigation between pages without full page reloads
 */

import type { EventBus } from './EventBus';
import type { Page, PageClass } from './types';

interface Route {
  pattern: string;
  loader: () => Promise<PageClass>;
}

export class Router {
  private routes: Route[] = [];
  private currentPage: Page | null = null;
  private params: Record<string, string> = {};
  
  constructor(
    private container: HTMLElement,
    private eventBus: EventBus
  ) {}
  
  /**
   * Register a route with lazy loading
   */
  register(pattern: string, loader: () => Promise<PageClass>): void {
    this.routes.push({ pattern, loader });
  }
  
  /**
   * Navigate to a path
   */
  navigate(path: string): void {
    window.location.hash = path;
  }
  
  /**
   * Start listening to hash changes
   */
  start(): void {
    window.addEventListener('hashchange', () => {
      this.render(this.getCurrentPath());
    });
    
    // Initial render
    this.render(this.getCurrentPath());
  }
  
  /**
   * Get current path from hash
   */
  private getCurrentPath(): string {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  }
  
  /**
   * Render the page for the current path
   */
  private async render(path: string): Promise<void> {
    // Find matching route
    const match = this.matchRoute(path);
    
    if (!match) {
      this.show404(path);
      return;
    }
    
    const { route, params } = match;
    this.params = params;
    
    try {
      // Unmount current page
      if (this.currentPage) {
        this.currentPage.destroy();
        this.currentPage = null;
      }
      
      // Clear container
      this.container.innerHTML = '';
      
      // Load and instantiate new page
      const PageClass = await route.loader();
      this.currentPage = new PageClass(this.container, params, this.eventBus);
      
      // Render new page
      await this.currentPage.render();
      
      // Emit navigation event
      this.eventBus.emit('router:navigate', { path, params });
      
    } catch (error) {
      console.error(`Failed to render page for path "${path}":`, error);
      this.showError(error);
    }
  }
  
  /**
   * Match path against registered routes
   */
  private matchRoute(path: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      const params = this.matchPattern(path, route.pattern);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }
  
  /**
   * Match path against pattern and extract parameters
   */
  private matchPattern(path: string, pattern: string): Record<string, string> | null {
    const pathParts = path.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);
    
    if (pathParts.length !== patternParts.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        // Dynamic segment
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Static segment doesn't match
        return null;
      }
    }
    
    return params;
  }
  
  /**
   * Show 404 page
   */
  private show404(path: string): void {
    this.container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 72px; margin: 0;">🔍</h1>
        <h2 style="color: #374151;">Страница не найдена</h2>
        <p style="color: #6b7280;">Path: <code>${path}</code></p>
        <button 
          onclick="window.location.hash='/'" 
          style="margin-top: 20px; padding: 10px 20px; cursor: pointer;"
        >
          🏠 На главную
        </button>
      </div>
    `;
  }
  
  /**
   * Show error page
   */
  private showError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    
    this.container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h1 style="font-size: 72px; margin: 0;">🚨</h1>
        <h2 style="color: #ef4444;">Ошибка загрузки</h2>
        <p style="color: #6b7280;">${message}</p>
        <button 
          onclick="history.back()" 
          style="margin-top: 20px; padding: 10px 20px; cursor: pointer;"
        >
          ← Назад
        </button>
      </div>
    `;
  }
  
  /**
   * Get current route parameters
   */
  getParams(): Record<string, string> {
    return { ...this.params };
  }
}
