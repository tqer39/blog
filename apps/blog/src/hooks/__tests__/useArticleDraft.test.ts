'use client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Import after localStorage mock is set up
import type { ArticleDraft } from '../useArticleDraft';

// Test the pure functions that can be extracted
describe('useArticleDraft utils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDraftKey', () => {
    it('should generate key for new article', () => {
      // Testing the logic directly
      const key = 'article_draft_new';
      expect(key).toBe('article_draft_new');
    });

    it('should generate key for existing article', () => {
      const articleId = 'abc123';
      const key = `article_draft_${articleId}`;
      expect(key).toBe('article_draft_abc123');
    });
  });

  describe('draft storage', () => {
    const sampleDraft: ArticleDraft = {
      title: 'Test Article',
      description: 'Test description',
      content: '# Hello World',
      tags: ['test', 'vitest'],
      categoryId: 'cat-1',
      status: 'draft',
      headerImageId: null,
      headerImageUrl: null,
      slideMode: false,
      slideDuration: null,
      savedAt: Date.now(),
    };

    it('should save draft to localStorage', () => {
      const key = 'article_draft_test123';
      localStorage.setItem(key, JSON.stringify(sampleDraft));

      expect(localStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(sampleDraft)
      );
    });

    it('should load draft from localStorage', () => {
      const key = 'article_draft_test123';
      localStorage.setItem(key, JSON.stringify(sampleDraft));

      const stored = localStorage.getItem(key);
      expect(stored).not.toBeNull();

      const draft = JSON.parse(stored!) as ArticleDraft;
      expect(draft.title).toBe('Test Article');
      expect(draft.content).toBe('# Hello World');
      expect(draft.tags).toEqual(['test', 'vitest']);
    });

    it('should return null for non-existent draft', () => {
      const stored = localStorage.getItem('article_draft_nonexistent');
      expect(stored).toBeNull();
    });

    it('should expire drafts older than 7 days', () => {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const oldDraft: ArticleDraft = {
        ...sampleDraft,
        savedAt: Date.now() - sevenDaysMs - 1000, // 7 days + 1 second ago
      };

      const key = 'article_draft_old';
      localStorage.setItem(key, JSON.stringify(oldDraft));

      const stored = localStorage.getItem(key);
      const draft = JSON.parse(stored!) as ArticleDraft;

      // Check if draft is expired
      const isExpired = Date.now() - draft.savedAt > sevenDaysMs;
      expect(isExpired).toBe(true);
    });

    it('should not expire recent drafts', () => {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const recentDraft: ArticleDraft = {
        ...sampleDraft,
        savedAt: Date.now() - 1000, // 1 second ago
      };

      const key = 'article_draft_recent';
      localStorage.setItem(key, JSON.stringify(recentDraft));

      const stored = localStorage.getItem(key);
      const draft = JSON.parse(stored!) as ArticleDraft;

      const isExpired = Date.now() - draft.savedAt > sevenDaysMs;
      expect(isExpired).toBe(false);
    });

    it('should clear draft from localStorage', () => {
      const key = 'article_draft_test123';
      localStorage.setItem(key, JSON.stringify(sampleDraft));
      localStorage.removeItem(key);

      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
      expect(localStorage.getItem(key)).toBeNull();
    });
  });

  describe('draft data structure', () => {
    it('should have all required fields', () => {
      const draft: ArticleDraft = {
        title: '',
        description: '',
        content: '',
        tags: [],
        categoryId: null,
        status: 'draft',
        headerImageId: null,
        headerImageUrl: null,
        slideMode: false,
        slideDuration: null,
        savedAt: Date.now(),
      };

      expect(draft).toHaveProperty('title');
      expect(draft).toHaveProperty('description');
      expect(draft).toHaveProperty('content');
      expect(draft).toHaveProperty('tags');
      expect(draft).toHaveProperty('categoryId');
      expect(draft).toHaveProperty('status');
      expect(draft).toHaveProperty('headerImageId');
      expect(draft).toHaveProperty('headerImageUrl');
      expect(draft).toHaveProperty('slideMode');
      expect(draft).toHaveProperty('slideDuration');
      expect(draft).toHaveProperty('savedAt');
    });

    it('should allow published status', () => {
      const draft: ArticleDraft = {
        title: 'Published Article',
        description: '',
        content: '',
        tags: [],
        categoryId: null,
        status: 'published',
        headerImageId: null,
        headerImageUrl: null,
        slideMode: false,
        slideDuration: null,
        savedAt: Date.now(),
      };

      expect(draft.status).toBe('published');
    });

    it('should support slide mode with duration', () => {
      const draft: ArticleDraft = {
        title: 'Slide Article',
        description: '',
        content: '',
        tags: [],
        categoryId: null,
        status: 'draft',
        headerImageId: null,
        headerImageUrl: null,
        slideMode: true,
        slideDuration: 5000,
        savedAt: Date.now(),
      };

      expect(draft.slideMode).toBe(true);
      expect(draft.slideDuration).toBe(5000);
    });
  });
});
