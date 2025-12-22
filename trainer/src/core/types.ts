/**
 * Core types for the application
 */

import type { EventBus } from './EventBus';

/**
 * Route parameters base interface
 */
export interface RouteParams {
  [key: string]: string;
}

/**
 * Empty route params (for pages without parameters)
 */
export type EmptyParams = Record<string, never>;

/**
 * Lesson route parameters
 */
export interface LessonParams extends RouteParams {
  id: string;
}

/**
 * Base page interface
 */
export interface Page {
  render(): Promise<void> | void;
  destroy(): void;
}

/**
 * Page constructor interface with typed parameters
 */
export interface PageClass<P extends RouteParams = RouteParams> {
  new (
    container: HTMLElement,
    params: P,
    eventBus: EventBus
  ): Page;
}

/**
 * Route definition
 */
export interface RouteDefinition<P extends RouteParams = RouteParams> {
  path: string;
  loader: () => Promise<PageClass<P>>;
}

/**
 * Base page abstract class
 */
export abstract class BasePage<P extends RouteParams = RouteParams> implements Page {
  protected cleanup: Array<() => void> = [];
  
  constructor(
    protected container: HTMLElement,
    protected params: P,
    protected eventBus: EventBus
  ) {}
  
  abstract render(): Promise<void> | void;
  
  destroy(): void {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
    this.container.innerHTML = '';
  }
  
  protected addCleanup(fn: () => void): void {
    this.cleanup.push(fn);
  }
}
