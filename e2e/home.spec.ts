import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the blog title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Latest Articles');
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Articles' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: "tqer39's blog" })
    ).toBeVisible();
  });

  test('should have theme switcher', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: 'Toggle theme' })
    ).toBeVisible();
  });

  test('should display article cards', async ({ page }) => {
    await page.goto('/');
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();
  });
});

test.describe('Article Page', () => {
  test('should navigate to article from home', async ({ page }) => {
    await page.goto('/');
    const firstArticle = page.locator('article').first();
    await firstArticle.click();
    await expect(page).toHaveURL(/\/article\/.+/);
  });
});

test.describe('Articles List Page', () => {
  test('should display all articles', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.locator('h1')).toContainText('All Articles');
  });
});
