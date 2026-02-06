'use client';

import type { PaginationInfo } from '@blog/cms-types';
import { useCallback, useEffect, useState } from 'react';

/**
 * リスト系管理画面の共通データ取得フック。
 *
 * loading/error 状態管理、再読み込み機能を提供。
 *
 * @param fetcher データ取得関数
 * @param itemsKey レスポンスからアイテム配列を取得するキー (default: 'items')
 * @returns { items, loading, error, reload, setItems }
 *
 * @example
 * // 基本使用
 * const { items: tags, loading, error, reload } = useListPage(getTags, 'tags');
 *
 * @example
 * // articles
 * const { items: articles, loading, error, reload } = useListPage(getArticles, 'items');
 */
export function useListPage<T, K extends string = 'items'>(
  fetcher: () => Promise<Record<K, T[]>>,
  itemsKey: K = 'items' as K
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setItems(response[itemsKey]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [fetcher, itemsKey]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload, setItems };
}

/**
 * ページネーション付きリスト系管理画面の共通データ取得フック。
 *
 * @param fetcher ページネーションパラメータを受け取るデータ取得関数
 * @param itemsKey レスポンスからアイテム配列を取得するキー
 * @param defaultPerPage デフォルトの1ページあたり件数
 */
export function usePaginatedListPage<T, K extends string = 'items'>(
  fetcher: (params: {
    page: number;
    perPage: number;
  }) => Promise<Record<K, T[]> & { pagination: PaginationInfo }>,
  itemsKey: K,
  defaultPerPage: number = 50
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher({ page, perPage: defaultPerPage });
      setItems(response[itemsKey]);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [fetcher, itemsKey, page, defaultPerPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    items,
    loading,
    error,
    reload,
    setItems,
    page,
    pagination,
    onPageChange: handlePageChange,
  };
}
