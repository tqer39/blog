'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * データフェッチ用フックのオプション。
 */
export interface UseFetchDataOptions<T, R> {
  /** レスポンスからデータを抽出・変換する関数 */
  transform: (response: R) => T;
  /** データ読み込み前の初期値 */
  initialValue: T;
  /** 依存配列 - 変更時に再フェッチ */
  deps?: React.DependencyList;
  /** falseの場合はフェッチをスキップ */
  enabled?: boolean;
}

/**
 * データフェッチ用フックの戻り値。
 */
export interface UseFetchDataResult<T> {
  /** フェッチ・変換後のデータ */
  data: T;
  /** 読み込み中フラグ */
  isLoading: boolean;
  /** エラー (フェッチ失敗時) */
  error: Error | null;
  /** 手動で再フェッチを実行する関数 */
  refetch: () => Promise<void>;
}

/**
 * 汎用データフェッチフック。
 *
 * ローディング、エラー、データ状態を一元管理し、
 * TagSelector/CategorySelector等で共通利用可能。
 *
 * @example
 * // タグ名の配列を取得
 * const { data: tags, isLoading } = useFetchData(
 *   () => getTags(),
 *   { transform: (res) => res.tags.map(t => t.name), initialValue: [] }
 * );
 *
 * @example
 * // カテゴリオブジェクトの配列を取得
 * const { data: categories, isLoading } = useFetchData(
 *   () => getCategories(),
 *   { transform: (res) => res.categories, initialValue: [] }
 * );
 */
export function useFetchData<T, R>(
  fetcher: () => Promise<R>,
  options: UseFetchDataOptions<T, R>
): UseFetchDataResult<T> {
  const { transform, initialValue, deps = [], enabled = true } = options;

  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      const transformedData = transform(response);
      setData(transformedData);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error(String(err));
      setError(fetchError);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, transform, enabled]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchData is intentionally excluded to prevent infinite loops when fetcher isn't wrapped in useCallback
  useEffect(() => {
    fetchData();
  }, [enabled, ...deps]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
