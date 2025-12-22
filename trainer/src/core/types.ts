/**
 * Core types for the application
 */

import type { EventBus } from './EventBus';

/**
 * Base page interface
 */
export interface Page {
  render(): Promise<void> | void;
  destroy(): void;
}

/**
 * Page constructor interface
 */
export interface PageClass {
  new (
    container: HTMLElement,
    params: Record<string, string>,
    eventBus: EventBus
  ): Page;
}

/**
 * Base page abstract class
 */
export abstract class BasePage implements Page {
  protected cleanup: Array<() => void> = [];
  
  constructor(
    protected container: HTMLElement,
    protected params: Record<string, string>,
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
