import { ulid } from 'ulidx';

/**
 * Generate a random ID (16 hex characters)
 */
export function generateId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a ULID for article URLs
 * ULID is time-sortable and URL-safe (26 characters, Crockford's Base32)
 */
export function generateHash(): string {
  return ulid().toLowerCase();
}

/**
 * Generate a UUID v4 for image paths
 * Provides 128 bits of randomness for unpredictable public URLs
 */
export function generateImageId(): string {
  return crypto.randomUUID();
}
