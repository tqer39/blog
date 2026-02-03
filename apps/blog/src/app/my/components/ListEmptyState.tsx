'use client';

import { useI18n } from '@/i18n';

interface ListEmptyStateProps {
  loading: boolean;
  hasItems: boolean;
  hasFilteredItems: boolean;
  emptyMessage: string;
  noMatchMessage: string;
}

export function ListEmptyState({
  loading,
  hasItems,
  hasFilteredItems,
  emptyMessage,
  noMatchMessage,
}: ListEmptyStateProps) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {t('common.loading')}
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  if (!hasFilteredItems) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {noMatchMessage}
      </div>
    );
  }

  return null;
}
