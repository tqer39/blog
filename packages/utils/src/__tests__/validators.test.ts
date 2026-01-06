import { describe, expect, it } from 'vitest';
import {
  combineValidations,
  invalid,
  valid,
  validateFileSize,
  validateFileType,
  validateOptionalString,
  validateRequiredString,
  validateStringArray,
} from '../validators';

describe('validators', () => {
  describe('valid / invalid', () => {
    it('should create valid result', () => {
      const result = valid('data');
      expect(result).toEqual({ valid: true, data: 'data' });
    });

    it('should create invalid result', () => {
      const result = invalid(['error1', 'error2']);
      expect(result).toEqual({ valid: false, errors: ['error1', 'error2'] });
    });
  });

  describe('validateRequiredString', () => {
    it('should pass for non-empty strings', () => {
      const result = validateRequiredString('hello', 'field');
      expect(result).toEqual({ valid: true, data: 'hello' });
    });

    it('should fail for empty strings', () => {
      const result = validateRequiredString('', 'title');
      expect(result).toEqual({ valid: false, errors: ['title is required'] });
    });

    it('should fail for whitespace-only strings', () => {
      const result = validateRequiredString('   ', 'title');
      expect(result).toEqual({ valid: false, errors: ['title is required'] });
    });

    it('should fail for null/undefined', () => {
      expect(validateRequiredString(null, 'field').valid).toBe(false);
      expect(validateRequiredString(undefined, 'field').valid).toBe(false);
    });
  });

  describe('validateOptionalString', () => {
    it('should pass for strings', () => {
      const result = validateOptionalString('hello');
      expect(result).toEqual({ valid: true, data: 'hello' });
    });

    it('should pass for null/undefined', () => {
      expect(validateOptionalString(null)).toEqual({ valid: true, data: null });
      expect(validateOptionalString(undefined)).toEqual({
        valid: true,
        data: null,
      });
    });

    it('should fail for non-strings', () => {
      const result = validateOptionalString(123);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateStringArray', () => {
    it('should pass for string arrays', () => {
      const result = validateStringArray(['a', 'b'], 'tags');
      expect(result).toEqual({ valid: true, data: ['a', 'b'] });
    });

    it('should pass for empty arrays', () => {
      const result = validateStringArray([], 'tags');
      expect(result).toEqual({ valid: true, data: [] });
    });

    it('should return empty array for null/undefined', () => {
      expect(validateStringArray(null, 'tags')).toEqual({
        valid: true,
        data: [],
      });
      expect(validateStringArray(undefined, 'tags')).toEqual({
        valid: true,
        data: [],
      });
    });

    it('should fail for mixed arrays', () => {
      const result = validateStringArray([1, 'a'], 'tags');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileType', () => {
    const allowedTypes = ['image/jpeg', 'image/png'] as const;

    it('should pass for allowed types', () => {
      const result = validateFileType('image/jpeg', allowedTypes);
      expect(result).toEqual({ valid: true, data: 'image/jpeg' });
    });

    it('should fail for disallowed types', () => {
      const result = validateFileType('image/gif', allowedTypes);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    it('should pass for files under max size', () => {
      const result = validateFileSize(1000, maxSize);
      expect(result).toEqual({ valid: true, data: 1000 });
    });

    it('should fail for files over max size', () => {
      const result = validateFileSize(20 * 1024 * 1024, maxSize);
      expect(result.valid).toBe(false);
    });
  });

  describe('combineValidations', () => {
    it('should combine valid results', () => {
      const result = combineValidations({
        title: validateRequiredString('Hello', 'title'),
        tags: validateStringArray(['a', 'b'], 'tags'),
      });
      expect(result).toEqual({
        valid: true,
        data: { title: 'Hello', tags: ['a', 'b'] },
      });
    });

    it('should collect all errors', () => {
      const result = combineValidations({
        title: validateRequiredString('', 'title'),
        content: validateRequiredString('', 'content'),
      });
      expect(result).toEqual({
        valid: false,
        errors: ['title is required', 'content is required'],
      });
    });

    it('should fail if any validation fails', () => {
      const result = combineValidations({
        title: validateRequiredString('Hello', 'title'),
        content: validateRequiredString('', 'content'),
      });
      expect(result.valid).toBe(false);
    });
  });
});
