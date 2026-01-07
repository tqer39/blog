import type { Locator, Page } from '@playwright/test';

/**
 * Page Object for the Articles List Page
 */
export class ArticlesListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly articleCards: Locator;
  readonly tagSelector: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly pagination: Locator;
  readonly noArticlesMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('h1');
    this.articleCards = page.locator('article');
    this.tagSelector = page.locator('[data-tag-selector]');
    this.searchInput = page.getByPlaceholder('Search');
    this.clearSearchButton = page.getByRole('link', { name: 'クリア' });
    this.pagination = page.locator('[data-pagination]');
    this.noArticlesMessage = page.getByText(
      /No articles|検索結果が見つかりませんでした/
    );
  }

  async goto(page = 1) {
    if (page === 1) {
      await this.page.goto('/articles');
    } else {
      await this.page.goto(`/articles/${page}`);
    }
  }

  async gotoWithTag(tag: string) {
    await this.page.goto(`/articles?tags=${encodeURIComponent(tag)}`);
  }

  async gotoWithSearch(query: string) {
    await this.page.goto(`/articles?q=${encodeURIComponent(query)}`);
  }

  async getArticleCount(): Promise<number> {
    return this.articleCards.count();
  }

  async clickArticle(index: number) {
    await this.articleCards.nth(index).getByRole('link').first().click();
  }

  async selectTag(tagName: string) {
    await this.tagSelector.getByText(tagName).click();
  }

  async clearSearch() {
    await this.clearSearchButton.click();
  }

  async goToPage(pageNumber: number) {
    await this.pagination.getByText(String(pageNumber)).click();
  }
}
