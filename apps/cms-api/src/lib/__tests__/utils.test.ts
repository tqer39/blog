import { generateId } from '@blog/utils';
import { describe, expect, it } from 'vitest';

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
