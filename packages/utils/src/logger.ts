/**
 * Development-only logging utilities.
 * Logs are suppressed in production to avoid exposing debug information.
 */

const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/**
 * Log error messages only in development environment.
 * Use for debugging errors that don't need to be visible in production.
 */
export function devError(...args: unknown[]): void {
  if (isDev) {
    console.error(...args);
  }
}

/**
 * Log warning messages only in development environment.
 */
export function devWarn(...args: unknown[]): void {
  if (isDev) {
    console.warn(...args);
  }
}

/**
 * Log info messages only in development environment.
 */
export function devLog(...args: unknown[]): void {
  if (isDev) {
    console.log(...args);
  }
}
