/**
 * Validation helper functions
 */

import { isNonEmptyString, isStringArray } from './guards';

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: string[] };

/**
 * Create a successful validation result
 */
export function valid<T>(data: T): ValidationResult<T> {
  return { valid: true, data };
}

/**
 * Create a failed validation result
 */
export function invalid<T>(errors: string[]): ValidationResult<T> {
  return { valid: false, errors };
}

/**
 * Validate required string field
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string
): ValidationResult<string> {
  if (!isNonEmptyString(value)) {
    return invalid([`${fieldName} is required`]);
  }
  return valid(value);
}

/**
 * Validate optional string field
 */
export function validateOptionalString(
  value: unknown
): ValidationResult<string | null> {
  if (value === null || value === undefined) {
    return valid(null);
  }
  if (typeof value !== 'string') {
    return invalid(['Value must be a string or null']);
  }
  return valid(value);
}

/**
 * Validate string array field (can be empty)
 */
export function validateStringArray(
  value: unknown,
  fieldName: string
): ValidationResult<string[]> {
  if (value === null || value === undefined) {
    return valid([]);
  }
  if (!isStringArray(value)) {
    return invalid([`${fieldName} must be an array of strings`]);
  }
  return valid(value);
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: readonly string[]
): ValidationResult<string> {
  if (!allowedTypes.includes(mimeType)) {
    return invalid([`File type ${mimeType} is not allowed`]);
  }
  return valid(mimeType);
}

/**
 * Validate file size against maximum
 */
export function validateFileSize(
  size: number,
  maxSize: number
): ValidationResult<number> {
  if (size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return invalid([`File size exceeds maximum of ${maxMB}MB`]);
  }
  return valid(size);
}

/**
 * Combine multiple validation results
 */
export function combineValidations<T extends Record<string, unknown>>(
  validations: { [K in keyof T]: ValidationResult<T[K]> }
): ValidationResult<T> {
  const errors: string[] = [];
  const data = {} as T;

  for (const [key, result] of Object.entries(validations)) {
    if (!result.valid) {
      errors.push(...result.errors);
    } else {
      (data as Record<string, unknown>)[key] = result.data;
    }
  }

  if (errors.length > 0) {
    return invalid(errors);
  }
  return valid(data);
}
