'use client';

import { useCallback, useEffect, useRef } from 'react';

const DRAFT_KEY_PREFIX = 'article_draft_';
const DEBOUNCE_MS = 1000;

export interface ArticleDraft {
  title: string;
  description: string;
  content: string;
  tags: string[];
  categoryId: string | null;
  status: 'draft' | 'published';
  headerImageId: string | null;
  headerImageUrl: string | null;
  slideMode: boolean;
  slideDuration: number | null;
  savedAt: number;
}

function getDraftKey(articleId?: string): string {
  return articleId
    ? `${DRAFT_KEY_PREFIX}${articleId}`
    : `${DRAFT_KEY_PREFIX}new`;
}

export function useArticleDraft(articleId?: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraft = useCallback(
    (draft: Omit<ArticleDraft, 'savedAt'>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          const key = getDraftKey(articleId);
          const draftWithTime: ArticleDraft = {
            ...draft,
            savedAt: Date.now(),
          };
          localStorage.setItem(key, JSON.stringify(draftWithTime));
        } catch (e) {
          console.error('Failed to save draft:', e);
        }
      }, DEBOUNCE_MS);
    },
    [articleId]
  );

  const loadDraft = useCallback((): ArticleDraft | null => {
    try {
      const key = getDraftKey(articleId);
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const draft = JSON.parse(stored) as ArticleDraft;

      // Expire drafts older than 7 days
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - draft.savedAt > sevenDaysMs) {
        localStorage.removeItem(key);
        return null;
      }

      return draft;
    } catch (e) {
      console.error('Failed to load draft:', e);
      return null;
    }
  }, [articleId]);

  const clearDraft = useCallback(() => {
    try {
      const key = getDraftKey(articleId);
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear draft:', e);
    }
  }, [articleId]);

  const hasDraft = useCallback((): boolean => {
    const draft = loadDraft();
    return draft !== null;
  }, [loadDraft]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}
