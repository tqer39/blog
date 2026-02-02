import { type ConsoleMessage, expect, test } from '@playwright/test';

/**
 * All documentation pages to test
 * These paths are relative to the base URL
 */
const DOCS_PAGES = [
  // English pages
  '/',
  '/guide/markdown',
  '/guide/images',
  '/guide/code-blocks',
  '/guide/components',
  '/guide/frontmatter',
  // Japanese pages
  '/ja/',
  '/ja/guide/markdown',
  '/ja/guide/images',
  '/ja/guide/code-blocks',
  '/ja/guide/components',
  '/ja/guide/frontmatter',
];

/**
 * Console message patterns to ignore
 * These are known benign messages that don't indicate real issues
 */
const IGNORED_PATTERNS = [
  // Vite/VitePress development messages
  /^\[vite\]/,
  // Browser extension related (shouldn't appear in incognito, but just in case)
  /extension/i,
  // Service worker messages
  /service.?worker/i,
  // favicon missing (common in dev)
  /favicon\.ico/,
];

/**
 * Check if a console message should be ignored
 */
function shouldIgnoreMessage(message: ConsoleMessage): boolean {
  const text = message.text();
  return IGNORED_PATTERNS.some((pattern) => pattern.test(text));
}

test.describe('Documentation Console Error Check', () => {
  for (const pagePath of DOCS_PAGES) {
    test(`should have no console errors on ${pagePath}`, async ({ page }) => {
      const errors: string[] = [];

      // Listen for console errors
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !shouldIgnoreMessage(msg)) {
          errors.push(`[${msg.type()}] ${msg.text()}`);
        }
      });

      // Listen for page errors (uncaught exceptions)
      page.on('pageerror', (error) => {
        errors.push(`[pageerror] ${error.message}`);
      });

      // Navigate to the page
      await page.goto(pagePath);

      // Wait for the page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Allow time for any async errors to appear
      await page.waitForTimeout(500);

      // Assert no errors
      expect(
        errors,
        `Console errors found on ${pagePath}:\n${errors.join('\n')}`
      ).toHaveLength(0);
    });
  }
});

test.describe('Documentation Navigation', () => {
  test('should navigate between pages without errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error' && !shouldIgnoreMessage(msg)) {
        errors.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      errors.push(`[pageerror] ${error.message}`);
    });

    // Start at home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click through to a guide page
    const guideLink = page.locator('a[href*="/guide/"]').first();
    if (await guideLink.isVisible()) {
      await guideLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate to Japanese version if available
    const jaLink = page.locator('a[href*="/ja/"]').first();
    if (await jaLink.isVisible()) {
      await jaLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Assert no errors during navigation
    expect(
      errors,
      `Console errors during navigation:\n${errors.join('\n')}`
    ).toHaveLength(0);
  });
});
