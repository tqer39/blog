import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COOKIE_NAME,
  createSession,
  getClearSessionCookieConfig,
  getSessionCookieConfig,
  hashPassword,
  verifyPassword,
  verifySession,
} from '../auth';

// Mock environment variable
const mockAuthSecret = 'test-secret-key-for-testing-purposes-12345';

describe('auth', () => {
  beforeEach(() => {
    vi.stubEnv('AUTH_SECRET', mockAuthSecret);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('hashPassword / verifyPassword', () => {
    it('should hash a password and verify it correctly', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/);

      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password (salt)', async () => {
      const password = 'testPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);

      // Both should still verify correctly
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });

  describe('createSession / verifySession', () => {
    it('should create a valid session token', async () => {
      const token = await createSession();

      expect(token).toBeDefined();
      expect(token).toContain('.');
      expect(token.split('.')).toHaveLength(2);
    });

    it('should verify a valid session token', async () => {
      const token = await createSession();
      const isValid = await verifySession(token);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid token format', async () => {
      const invalidTokens = [
        'invalid-token',
        '',
        'only-one-part',
        'too.many.parts.here',
      ];

      for (const token of invalidTokens) {
        const isValid = await verifySession(token);
        expect(isValid).toBe(false);
      }
    });

    it('should reject a tampered token (modified payload)', async () => {
      const token = await createSession();
      const [, signature] = token.split('.');

      // Create a tampered payload
      const tamperedPayload = Buffer.from(
        JSON.stringify({
          authenticated: true,
          exp: Math.floor(Date.now() / 1000) + 99999999,
        })
      ).toString('base64url');

      const tamperedToken = `${tamperedPayload}.${signature}`;
      const isValid = await verifySession(tamperedToken);

      expect(isValid).toBe(false);
    });

    it('should reject a tampered token (modified signature)', async () => {
      const token = await createSession();
      const [payload] = token.split('.');

      const tamperedToken = `${payload}.invalid-signature`;
      const isValid = await verifySession(tamperedToken);

      expect(isValid).toBe(false);
    });

    it('should reject an expired session', async () => {
      // Create an expired payload manually
      const expiredPayload = {
        authenticated: true,
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      const payloadStr = JSON.stringify(expiredPayload);
      const encoder = new TextEncoder();

      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(mockAuthSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payloadStr)
      );

      const signatureBase64 = Buffer.from(signature).toString('base64url');
      const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
      const expiredToken = `${payloadBase64}.${signatureBase64}`;

      const isValid = await verifySession(expiredToken);
      expect(isValid).toBe(false);
    });

    it('should reject if authenticated is false', async () => {
      const payload = {
        authenticated: false,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const payloadStr = JSON.stringify(payload);
      const encoder = new TextEncoder();

      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(mockAuthSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payloadStr)
      );

      const signatureBase64 = Buffer.from(signature).toString('base64url');
      const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
      const token = `${payloadBase64}.${signatureBase64}`;

      const isValid = await verifySession(token);
      expect(isValid).toBe(false);
    });
  });

  describe('AUTH_SECRET requirement', () => {
    it('should throw error when AUTH_SECRET is not set during session creation', async () => {
      vi.stubEnv('AUTH_SECRET', '');

      await expect(createSession()).rejects.toThrow(
        'AUTH_SECRET environment variable is required'
      );
    });
  });

  describe('getSessionCookieConfig', () => {
    it('should return correct cookie config', () => {
      const token = 'test-token';
      const config = getSessionCookieConfig(token);

      expect(config.name).toBe(COOKIE_NAME);
      expect(config.value).toBe(token);
      expect(config.httpOnly).toBe(true);
      expect(config.sameSite).toBe('strict');
      expect(config.maxAge).toBe(60 * 60 * 24 * 7); // 7 days
      expect(config.path).toBe('/');
    });

    it('should set secure flag based on NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;

      // Test development
      process.env.NODE_ENV = 'development';
      let config = getSessionCookieConfig('token');
      expect(config.secure).toBe(false);

      // Test production
      process.env.NODE_ENV = 'production';
      config = getSessionCookieConfig('token');
      expect(config.secure).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getClearSessionCookieConfig', () => {
    it('should return config to clear the cookie', () => {
      const config = getClearSessionCookieConfig();

      expect(config.name).toBe(COOKIE_NAME);
      expect(config.value).toBe('');
      expect(config.httpOnly).toBe(true);
      expect(config.sameSite).toBe('strict');
      expect(config.maxAge).toBe(0);
      expect(config.path).toBe('/');
    });
  });
});
