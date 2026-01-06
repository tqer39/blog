import { expect, test } from '@playwright/test';
import { ArticlesListPage, HomePage } from '@blog/test-utils/e2e';

test.describe('Home Page', () => {
  test('should display the blog title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.title).toContainText('Latest Articles');
  });

  test('should have navigation links', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.articlesLink).toBeVisible();
    await expect(homePage.logoLink).toBeVisible();
  });

  test('should have theme switcher', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.themeToggle).toBeVisible();
  });

  test('should display article cards', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.articleCards.first()).toBeVisible();
  });
});

test.describe('Article Page', () => {
  test('should navigate to article from home', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.clickFirstArticle();
    await expect(page).toHaveURL(/\/article\/.+/);
  });
});

test.describe('Articles List Page', () => {
  test('should display all articles', async ({ page }) => {
    const articlesListPage = new ArticlesListPage(page);
    await articlesListPage.goto();
    await expect(articlesListPage.title).toContainText('All Articles');
  });
});
