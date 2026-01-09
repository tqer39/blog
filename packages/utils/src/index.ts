// ID generation

// Fetch utilities
export { createFetchClient, type FetchClientConfig } from './fetch';
// Type guards
export {
  assertDefined,
  isArray,
  isDefined,
  isNonEmptyString,
  isNullish,
  isNumber,
  isObject,
  isString,
  isStringArray,
} from './guards';
export { generateHash, generateId } from './id';
// Result type for error handling
export { err, ok, type Result, toError } from './result';
// Style utilities
export { cn } from './style';
// Validators
export {
  combineValidations,
  invalid,
  type ValidationResult,
  valid,
  validateFileSize,
  validateFileType,
  validateOptionalString,
  validateRequiredString,
  validateStringArray,
} from './validators';
