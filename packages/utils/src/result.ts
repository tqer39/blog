/**
 * Result type for explicit error handling
 * Allows distinguishing between "no data" and "error occurred"
 */
export type Result<T, E = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/**
 * Create a successful Result
 */
export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

/**
 * Create a failed Result
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Convert an error to an Error object
 */
export function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
