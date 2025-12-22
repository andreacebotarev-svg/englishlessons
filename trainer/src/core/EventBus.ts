/**
 * Event Bus for cross-component communication
 * Implements Pub/Sub pattern
 */

type EventHandler<T = any> = (data: T) => void;

export class EventBus {
  private events = new Map<string, Set<EventHandler>>();
  private readonly debug: boolean;
  
  constructor(debug = false) {
    this.debug = debug;
  }
  
  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler);
    
    if (this.debug) {
      console.log(`📡 EventBus: subscribed to "${event}"`);
    }
    
    // Return unsubscribe function
    return () => {
      this.events.get(event)?.delete(handler);
      
      if (this.debug) {
        console.log(`📯 EventBus: unsubscribed from "${event}"`);
      }
    };
  }
  
  /**
   * Subscribe to an event once
   */
  once<T = any>(event: string, handler: EventHandler<T>): void {
    const onceHandler: EventHandler<T> = (data: T) => {
      handler(data);
      this.off(event, onceHandler);
    };
    
    this.on(event, onceHandler);
  }
  
  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, handler: EventHandler<T>): void {
    this.events.get(event)?.delete(handler);
  }
  
  /**
   * Emit an event
   */
  emit<T = any>(event: string, data?: T): void {
    const handlers = this.events.get(event);
    
    if (!handlers || handlers.size === 0) {
      if (this.debug) {
        console.warn(`⚠️ EventBus: no handlers for "${event}"`);
      }
      return;
    }
    
    if (this.debug) {
      console.log(`📤 EventBus: emitting "${event}"`, data);
    }
    
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }
  
  /**
   * Remove all handlers for an event
   */
  clear(event: string): void {
    this.events.delete(event);
    
    if (this.debug) {
      console.log(`🧹 EventBus: cleared all handlers for "${event}"`);
    }
  }
  
  /**
   * Remove all event handlers
   */
  clearAll(): void {
    this.events.clear();
    
    if (this.debug) {
      console.log('🧹 EventBus: cleared all event handlers');
    }
  }
  
  /**
   * Get number of handlers for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }
}
