/**
 * Enhanced Hash-based Router
 * Features:
 * - Hash-based navigation (no server config needed)
 * - Query parameters support
 * - Navigation history (back/forward)
 * - Lazy loading pages
 * - Loading states
 * - Type-safe route parameters
 */

import type { EventBus } from './EventBus';
import type { Page, PageClass, RouteParams } from './types';

interface Route<P extends RouteParams = RouteParams> {
  pattern: string;
  loader: () => Promise<PageClass<P>>;
}

interface NavigationState {
  path: string;
  params: RouteParams;
  queryParams: RouteParams;
  timestamp: number;
}

export class Router {
  private routes: Route[] = [];
  private currentPage: Page | null = null;
  private history: NavigationState[] = [];
  private historyIndex = -1;
  private isNavigating = false;
  
  constructor(
    private container: HTMLElement,
    private eventBus: EventBus
  ) {}
  
  /**
   * Register a route with lazy loading
   */
  register<P extends RouteParams = RouteParams>(
    pattern: string,
    loader: () => Promise<PageClass<P>>
  ): void {
    this.routes.push({ pattern, loader } as Route);
  }
  
  /**
   * Navigate to a path
   */
  navigate(path: string, options: { replace?: boolean; queryParams?: RouteParams } = {}): void {
    let fullPath = path;
    
    // Add query parameters if provided
    if (options.queryParams && Object.keys(options.queryParams).length > 0) {
      const query = new URLSearchParams(options.queryParams).toString();
      fullPath = `${path}?${query}`;
    }
    
    if (options.replace) {
      // Replace current history entry
      window.location.replace(`#${fullPath}`);
    } else {
      // Add to history
      window.location.hash = fullPath;
    }
  }
  
  /**
   * Go back in history
   */
  back(): void {
    if (this.canGoBack()) {
      window.history.back();
    }
  }
  
  /**
   * Go forward in history
   */
  forward(): void {
    if (this.canGoForward()) {
      window.history.forward();
    }
  }
  
  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.historyIndex > 0;
  }
  
  /**
   * Check if can go forward
   */
  canGoForward(): boolean {
    return this.historyIndex < this.history.length - 1;
  }
  
  /**
   * Get current navigation state
   */
  getCurrentState(): Readonly<NavigationState> | null {
    return this.history[this.historyIndex] || null;
  }
  
  /**
   * Start listening to hash changes
   */
  start(): void {
    window.addEventListener('hashchange', () => {
      this.handleNavigation();
    });
    
    // Also listen to popstate for browser back/forward
    window.addEventListener('popstate', () => {
      this.handleNavigation();
    });
    
    // Initial render
    this.handleNavigation();
  }
  
  /**
   * Handle navigation (internal)
   */
  private async handleNavigation(): Promise<void> {
    if (this.isNavigating) return;
    
    this.isNavigating = true;
    
    try {
      const { path, queryParams } = this.parseHash();
      await this.render(path, queryParams);
    } finally {
      this.isNavigating = false;
    }
  }
  
  /**
   * Parse hash into path and query params
   */
  private parseHash(): { path: string; queryParams: RouteParams } {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    
    const queryParams: RouteParams = {};
    
    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
    }
    
    return { path, queryParams };
  }
  
  /**
   * Render the page for the current path
   */
  private async render(path: string, queryParams: RouteParams): Promise<void> {
    // Find matching route
    const match = this.matchRoute(path);
    
    if (!match) {
      this.show404(path);
      return;
    }
    
    const { route, params } = match;
    
    // Combine route params and query params
    const allParams = { ...params, ...queryParams };
    
    try {
      // Show loading state
      this.showLoading();
      
      // Unmount current page
      if (this.currentPage) {
        this.currentPage.destroy();
        this.currentPage = null;
      }
      
      // Clear container
      this.container.innerHTML = '';
      
      // Load and instantiate new page
      const PageClass = await route.loader();
      this.currentPage = new PageClass(this.container, allParams, this.eventBus);
      
      // Render new page
      await this.currentPage.render();
      
      // Update history
      this.updateHistory({ path, params, queryParams, timestamp: Date.now() });
      
      // Emit navigation event
      this.eventBus.emit('router:navigate', { path, params: allParams });
      
      // Scroll to top
      window.scrollTo(0, 0);
      
    } catch (error) {
      console.error(`Failed to render page for path "${path}":`, error);
      this.showError(error);
    }
  }
  
  /**
   * Update navigation history
   */
  private updateHistory(state: NavigationState): void {
    // Remove any forward history when navigating to a new page
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new state
    this.history.push(state);
    this.historyIndex++;
    
    // Limit history size (keep last 50 entries)
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  /**
   * Match path against registered routes
   */
  private matchRoute(path: string): { route: Route; params: RouteParams } | null {
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
  private matchPattern(path: string, pattern: string): RouteParams | null {
    const pathParts = path.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);
    
    if (pathParts.length !== patternParts.length) {
      return null;
    }
    
    const params: RouteParams = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        // Dynamic segment
        const paramName = patternPart.slice(1);
        params[paramName] = decodeURIComponent(pathPart);
      } else if (patternPart !== pathPart) {
        // Static segment doesn't match
        return null;
      }
    }
    
    return params;
  }
  
  /**
   * Show loading state
   */
  private showLoading(): void {
    // Only show loader if page takes more than 200ms
    const timeout = setTimeout(() => {
      if (this.isNavigating) {
        this.container.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 50vh;
            gap: 1rem;
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid #e5e7eb;
              border-top-color: #6366f1;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            "></div>
            <p style="color: #6b7280; font-size: 0.875rem;">Загрузка...</p>
          </div>
        `;
      }
    }, 200);
    
    // Clear timeout when page loads
    Promise.resolve().then(() => clearTimeout(timeout));
  }
  
  /**
   * Show 404 page
   */
  private show404(path: string): void {
    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        padding: 2rem;
        text-align: center;
      ">
        <h1 style="font-size: 4rem; margin: 0;">🔍</h1>
        <h2 style="color: #374151; margin: 1rem 0;">Страница не найдена</h2>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">
          Путь: <code style="
            background: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: monospace;
          ">${path}</code>
        </p>
        <button 
          onclick="window.location.hash='/'" 
          style="
            padding: 0.75rem 1.5rem;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#4f46e5'"
          onmouseout="this.style.background='#6366f1'"
        >
          🏠 На главную
        </button>
      </div>
    `;
    
    this.eventBus.emit('router:404', { path });
  }
  
  /**
   * Show error page
   */
  private showError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    
    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 50vh;
        padding: 2rem;
        text-align: center;
      ">
        <h1 style="font-size: 4rem; margin: 0;">🚨</h1>
        <h2 style="color: #ef4444; margin: 1rem 0;">Ошибка загрузки</h2>
        <p style="
          color: #6b7280;
          margin-bottom: 1.5rem;
          max-width: 600px;
        ">${message}</p>
        ${stack ? `
          <details style="
            margin-top: 1rem;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 0.5rem;
            text-align: left;
            max-width: 600px;
            width: 100%;
          ">
            <summary style="cursor: pointer; color: #6b7280; font-size: 0.875rem;">
              Подробности
            </summary>
            <pre style="
              margin-top: 0.5rem;
              font-size: 0.75rem;
              color: #374151;
              overflow-x: auto;
            ">${stack}</pre>
          </details>
        ` : ''}
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button 
            onclick="history.back()" 
            style="
              padding: 0.75rem 1.5rem;
              background: #6b7280;
              color: white;
              border: none;
              border-radius: 0.5rem;
              font-weight: 600;
              cursor: pointer;
            "
          >
            ← Назад
          </button>
          <button 
            onclick="location.reload()" 
            style="
              padding: 0.75rem 1.5rem;
              background: #6366f1;
              color: white;
              border: none;
              border-radius: 0.5rem;
              font-weight: 600;
              cursor: pointer;
            "
          >
            🔄 Перезагрузить
          </button>
        </div>
      </div>
    `;
    
    this.eventBus.emit('router:error', { error });
  }
}
