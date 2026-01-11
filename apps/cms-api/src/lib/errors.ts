import type { ApiErrorCode } from '@blog/cms-types';
import { HTTPException } from 'hono/http-exception';

/**
 * Custom API exception with structured error information
 */
export class ApiException extends HTTPException {
  public readonly code: ApiErrorCode;
  public readonly details?: Record<string, string>;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    details?: Record<string, string>
  ) {
    super(status, { message });
    this.code = code;
    this.details = details;
  }
}

/**
 * Throw a 404 Not Found error
 */
export function notFound(message: string): never {
  throw new ApiException(404, 'NOT_FOUND', message);
}

/**
 * Throw a 400 Validation Error
 */
export function validationError(
  message: string,
  details?: Record<string, string>
): never {
  throw new ApiException(400, 'VALIDATION_ERROR', message, details);
}

/**
 * Throw a 409 Conflict error
 */
export function conflict(message: string): never {
  throw new ApiException(409, 'CONFLICT', message);
}

/**
 * Throw a 401 Unauthorized error
 */
export function unauthorized(message: string): never {
  throw new ApiException(401, 'UNAUTHORIZED', message);
}

/**
 * Throw a 500 Internal Server Error
 */
export function internalError(message: string): never {
  throw new ApiException(500, 'INTERNAL_ERROR', message);
}

/**
 * Check if error is a UNIQUE constraint violation and throw conflict error
 * @returns false if not a UNIQUE constraint error (caller should rethrow)
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return String(error).includes('UNIQUE constraint failed');
}

/**
 * Handle UNIQUE constraint error by throwing conflict, or rethrow original error
 */
export function throwIfUniqueConstraint(
  error: unknown,
  conflictMessage: string
): never {
  if (isUniqueConstraintError(error)) {
    conflict(conflictMessage);
  }
  throw error;
}
