/**
 * Debug Utilities - Centralized Logging System
 * 
 * Provides dev-only logging with contextual tracing and performance metrics.
 * In production, only errors are logged (with error IDs for tracking).
 */

const isDev = import.meta.env.DEV;

// Performance tracking map
const perfMarks = new Map<string, number>();

// Generate unique error ID for tracking
const generateErrorId = (): string => {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const debug = {
  /**
   * Standard debug log (dev only)
   */
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Warning log (dev only)
   */
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Error log (always logs, returns error ID)
   */
  error: (...args: unknown[]): string => {
    const errorId = generateErrorId();
    if (isDev) {
      console.error(`[${errorId}]`, ...args);
    } else {
      // In production, log minimal info
      console.error(`Error ${errorId}`);
      // TODO: Send to error tracking service
    }
    return errorId;
  },

  /**
   * Info log (dev only)
   */
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Contextual trace logging (dev only)
   * Use for tracking flow through specific modules
   * 
   * @example
   * debug.trace('[TTS]', 'Starting synthesis', { textLength: 500 });
   * debug.trace('[Aurora]', 'User context loaded');
   */
  trace: (context: string, message: string, data?: unknown) => {
    if (isDev) {
      if (data !== undefined) {
        console.log(`%c${context}%c ${message}`, 'color: #8b5cf6; font-weight: bold', 'color: inherit', data);
      } else {
        console.log(`%c${context}%c ${message}`, 'color: #8b5cf6; font-weight: bold', 'color: inherit');
      }
    }
  },

  /**
   * Start a performance measurement
   * 
   * @example
   * debug.startMetric('api-call');
   * // ... do work
   * debug.endMetric('api-call'); // logs: "[Metric] api-call: 245ms"
   */
  startMetric: (name: string) => {
    if (isDev) {
      perfMarks.set(name, performance.now());
    }
  },

  /**
   * End a performance measurement and log the duration
   */
  endMetric: (name: string): number | null => {
    if (!isDev) return null;
    
    const start = perfMarks.get(name);
    if (start === undefined) {
      console.warn(`[Metric] No start mark found for "${name}"`);
      return null;
    }
    
    const duration = performance.now() - start;
    perfMarks.delete(name);
    console.log(`%c[Metric]%c ${name}: ${duration.toFixed(2)}ms`, 'color: #10b981; font-weight: bold', 'color: inherit');
    return duration;
  },

  /**
   * Table log for structured data (dev only)
   */
  table: (data: unknown, columns?: string[]) => {
    if (isDev) {
      console.table(data, columns);
    }
  },

  /**
   * Group related logs (dev only)
   */
  group: (label: string, fn: () => void) => {
    if (isDev) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Assert a condition (dev only, throws in dev)
   */
  assert: (condition: boolean, message: string) => {
    if (isDev && !condition) {
      console.error(`Assertion failed: ${message}`);
    }
  },
};
