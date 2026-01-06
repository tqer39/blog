// ID generation
export { generateId, generateHash } from './id';
// Slug utilities
export { slugify } from './slug';
// Style utilities
export { cn } from './style';
// Fetch utilities
export { createFetchClient, type FetchClientConfig } from './fetch';
// Result type for error handling
export { ok, err, toError, type Result } from './result';
// Type guards
export {
  isObject,
  isString,
  isNonEmptyString,
  isNumber,
  isArray,
  isStringArray,
  isNullish,
  isDefined,
  assertDefined,
} from './guards';
// Validators
export {
  valid,
  invalid,
  validateRequiredString,
  validateOptionalString,
  validateStringArray,
  validateFileType,
  validateFileSize,
  combineValidations,
  type ValidationResult,
} from './validators';
