import type { Locator, Page } from '@playwright/test';

/**
 * Page Object for the Home Page
 */
export class HomePage {
  readonly page: Page;
  readonly title: Locator;
  readonly articlesLink: Locator;
  readonly logoLink: Locator;
  readonly themeToggle: Locator;
  readonly articleCards: Locator;
  readonly viewAllLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.articlesLink = page.getByRole('link', { name: 'Articles', exact: true });
    this.logoLink = page.getByRole('link', { name: 'tB' });
    this.themeToggle = page.getByRole('button', { name: 'Toggle theme' });
    this.articleCards = page.locator('article');
    this.viewAllLink = page.getByRole('link', { name: 'View all articles' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async getFirstArticleLink(): Promise<Locator> {
    return this.articleCards.first().getByRole('link').first();
  }

  async clickFirstArticle() {
    const link = await this.getFirstArticleLink();
    await link.click();
  }

  async toggleTheme() {
    await this.themeToggle.click();
  }

  async getArticleCount(): Promise<number> {
    return this.articleCards.count();
  }
}
