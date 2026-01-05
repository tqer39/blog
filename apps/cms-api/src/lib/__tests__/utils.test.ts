import { describe, expect, it } from 'vitest';
import { generateId, slugify } from '../utils';

describe('generateId', () => {
  it('should generate a 16 character hex string', () => {
    const id = generateId();
    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('should replace underscores with hyphens', () => {
    expect(slugify('hello_world')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld');
  });

  it('should collapse multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('-hello-world-')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should trim whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });
});
