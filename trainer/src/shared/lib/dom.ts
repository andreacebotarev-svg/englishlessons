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
 * Escape HTML to prevent XSS attacks
 */
export const escapeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Safe template literal tag for HTML
 * Automatically escapes all interpolated values
 * 
 * @example
 * const name = '<script>alert("XSS")</script>';
 * const html = html`<div>Hello ${name}</div>`;
 * // Result: <div>Hello &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>
 */
export const html = (
  strings: TemplateStringsArray,
  ...values: any[]
): string => {
  return strings.reduce((result, str, i) => {
    const value = values[i];
    
    if (value === undefined || value === null) {
      return result + str;
    }
    
    // Arrays - join without escaping (for nested HTML)
    if (Array.isArray(value)) {
      return result + str + value.join('');
    }
    
    // Escape strings, but allow numbers and booleans as-is
    const escaped = typeof value === 'string' 
      ? escapeHTML(value)
      : String(value);
    
    return result + str + escaped;
  }, '');
};

/**
 * Raw HTML (unsafe - use only with trusted content)
 */
export const raw = (htmlString: string): { __html: string } => {
  return { __html: htmlString };
};

/**
 * Set innerHTML safely
 */
export const setHTML = (
  element: HTMLElement,
  content: string | { __html: string }
): void => {
  if (typeof content === 'string') {
    element.textContent = content; // Safe by default
  } else {
    element.innerHTML = content.__html; // Explicit unsafe
  }
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
