'use client';

import { useCallback, useState } from 'react';

/**
 * ソート状態を管理するフック。
 *
 * @param defaultKey 初期ソートキー
 * @param defaultDirection 初期ソート方向 (default: 'desc')
 * @returns { sortKey, sortDirection, handleSort }
 *
 * @example
 * const { sortKey, sortDirection, handleSort } = useSorting<'name' | 'createdAt'>('createdAt');
 *
 * // ヘッダークリック時
 * <th onClick={() => handleSort('name')}>Name</th>
 */
export function useSorting<K extends string>(
  defaultKey: K,
  defaultDirection: 'asc' | 'desc' = 'desc'
) {
  const [sortKey, setSortKey] = useState<K>(defaultKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    defaultDirection
  );

  const handleSort = useCallback(
    (key: K) => {
      if (sortKey === key) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDirection('asc');
      }
    },
    [sortKey]
  );

  return { sortKey, sortDirection, handleSort };
}
