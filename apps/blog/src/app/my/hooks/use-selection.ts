import { useCallback, useState } from 'react';

interface UseSelectionReturn {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: (totalCount: number) => boolean;
  select: (id: string) => void;
  toggle: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  clear: () => void;
  remove: (id: string) => void;
  count: number;
}

export function useSelection(): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (totalCount: number) => totalCount > 0 && selectedIds.size === totalCount,
    [selectedIds]
  );

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => new Set([...prev, id]));
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      if (prev.size === ids.length) {
        return new Set();
      }
      return new Set(ids);
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const remove = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    select,
    toggle,
    toggleAll,
    clear,
    remove,
    count: selectedIds.size,
  };
}
