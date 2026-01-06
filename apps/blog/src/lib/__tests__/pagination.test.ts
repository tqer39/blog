import { describe, expect, it } from 'vitest';
import { ARTICLES_PER_PAGE, getPagination } from '../pagination';

describe('pagination', () => {
  describe('ARTICLES_PER_PAGE', () => {
    it('should be 10', () => {
      expect(ARTICLES_PER_PAGE).toBe(10);
    });
  });

  describe('getPagination', () => {
    describe('when max pages <= 7', () => {
      it('should return all pages for max=1', () => {
        expect(getPagination(1, 1)).toEqual([1]);
      });

      it('should return all pages for max=5', () => {
        expect(getPagination(1, 5)).toEqual([1, 2, 3, 4, 5]);
      });

      it('should return all pages for max=7', () => {
        expect(getPagination(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });
    });

    describe('when max pages > 7 and current <= 4', () => {
      it('should show first 5 pages with ellipsis and last page', () => {
        expect(getPagination(1, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
      });

      it('should show first 5 pages when current=4', () => {
        expect(getPagination(4, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
      });

      it('should show first 5 pages when current=2', () => {
        expect(getPagination(2, 15)).toEqual([1, 2, 3, 4, 5, '...', 15]);
      });
    });

    describe('when max pages > 7 and current >= max - 3', () => {
      it('should show first page, ellipsis, and last 5 pages', () => {
        expect(getPagination(10, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
      });

      it('should show last 5 pages when current=max-3', () => {
        expect(getPagination(7, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
      });

      it('should show last 5 pages when current=max-1', () => {
        expect(getPagination(14, 15)).toEqual([1, '...', 11, 12, 13, 14, 15]);
      });
    });

    describe('when current is in the middle', () => {
      it('should show first, ellipsis, current-1 to current+1, ellipsis, last', () => {
        expect(getPagination(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
      });

      it('should show middle pages correctly', () => {
        expect(getPagination(6, 10)).toEqual([1, '...', 5, 6, 7, '...', 10]);
      });

      it('should handle large page counts', () => {
        expect(getPagination(50, 100)).toEqual([
          1,
          '...',
          49,
          50,
          51,
          '...',
          100,
        ]);
      });
    });
  });
});
