/**
 * DOM manipulation utilities
 * Simplified jQuery-like selectors and helpers
 */

/**
 * Query selector shorthand (single element)
 */
export const $ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  context: ParentNode = document
): T | null => {
  return context.querySelector<T>(selector);
};

/**
 * Query selector shorthand (multiple elements)
 */
export const $$ = <T extends HTMLElement = HTMLElement>(
  selector: string,
  context: ParentNode = document
): T[] => {
  return Array.from(context.querySelectorAll<T>(selector));
};

/**
 * Create element with properties
 */
export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { className?: string; textContent?: string },
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);

  if (props) {
    Object.assign(element, props);
  }

  if (children) {
    element.append(...children);
  }

  return element;
};

/**
 * Add event listener with cleanup function
 */
export const on = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void => {
  element.addEventListener(event, handler as EventListener, options);

  return () => {
    element.removeEventListener(event, handler as EventListener);
  };
};

/**
 * Add multiple event listeners
 */
export const onMultiple = <K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  events: K[],
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions
): () => void => {
  const cleanups = events.map(event => on(element, event, handler, options));

  return () => {
    cleanups.forEach(cleanup => cleanup());
  };
};

/**
 * Toggle class on element
 */
export const toggleClass = (element: HTMLElement, className: string, force?: boolean): boolean => {
  return element.classList.toggle(className, force);
};

/**
 * Wait for element to appear in DOM
 */
export const waitForElement = <T extends HTMLElement = HTMLElement>(
  selector: string,
  timeout = 5000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const element = $(selector) as T;

    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = $(selector) as T;
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
};

/**
 * Batch DOM updates (minimize reflows)
 */
export const batchUpdate = (callback: () => void): void => {
  requestAnimationFrame(() => {
    callback();
  });
};
