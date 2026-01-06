import type { Locator, Page } from '@playwright/test';

/**
 * Page Object for the Article Page
 */
export class ArticlePage {
  readonly page: Page;
  readonly title: Locator;
  readonly content: Locator;
  readonly date: Locator;
  readonly readingTime: Locator;
  readonly tags: Locator;
  readonly headerImage: Locator;
  readonly prevArticleLink: Locator;
  readonly nextArticleLink: Locator;
  readonly tableOfContents: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('article h1');
    this.content = page.locator('article .prose');
    this.date = page.locator('article time');
    this.readingTime = page.locator('article').getByText(/約\d+分で読めます/);
    this.tags = page.locator('article').locator('[href^="/articles?tags="]');
    this.headerImage = page.locator('article img').first();
    this.prevArticleLink = page.getByRole('link', { name: /前の記事|Prev/ });
    this.nextArticleLink = page.getByRole('link', { name: /次の記事|Next/ });
    this.tableOfContents = page.locator('[data-toc]');
  }

  async goto(hash: string) {
    await this.page.goto(`/article/${hash}`);
  }

  async getTagNames(): Promise<string[]> {
    const tags = await this.tags.all();
    return Promise.all(tags.map((tag) => tag.textContent() as Promise<string>));
  }

  async navigateToPrevArticle() {
    await this.prevArticleLink.click();
  }

  async navigateToNextArticle() {
    await this.nextArticleLink.click();
  }
}
