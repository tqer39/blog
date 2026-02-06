'use client';

import type { TagWithCount } from '@blog/cms-types';
import { Alert, AlertDescription, Button } from '@blog/ui';
import dayjs from 'dayjs';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import { deleteTag, getTags } from '@/lib/api/client';
import { AdminPagination } from '../components/AdminPagination';
import { ListEmptyState } from '../components/ListEmptyState';
import { SearchInput } from '../components/SearchInput';
import { SortButton } from '../components/SortButton';
import { usePaginatedListPage } from '../hooks/use-list-page';
import { useSorting } from '../hooks/use-sorting';
import { TagEditor } from './components/TagEditor';

type TagSortKey = 'name' | 'articleCount' | 'createdAt';

export default function TagListPage() {
  const { t } = useI18n();
  const {
    items: tags,
    loading,
    error,
    reload: loadTags,
    page,
    pagination,
    onPageChange,
  } = usePaginatedListPage(getTags, 'tags', 50);
  const { sortKey, sortDirection, handleSort } = useSorting<TagSortKey>(
    'createdAt',
    'desc'
  );

  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  async function handleDelete(tag: TagWithCount) {
    const message =
      tag.articleCount > 0
        ? `"${tag.name}" is used in ${tag.articleCount} article(s). Are you sure you want to delete it?`
        : `Delete "${tag.name}"?`;

    if (!confirm(message)) return;

    try {
      await deleteTag(tag.id);
      await loadTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete tag');
    }
  }

  function handleEditorClose() {
    setEditingTag(null);
    setIsCreating(false);
    loadTags();
  }

  const sortedTags = useMemo(() => {
    const filtered = searchQuery.trim()
      ? tags.filter((tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : tags;

    return [...filtered].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
  }, [tags, searchQuery, sortKey, sortDirection]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('tags.title')}</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('tags.newTag')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(isCreating || editingTag) && (
        <TagEditor tag={editingTag} onClose={handleEditorClose} />
      )}

      {/* Search input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('tags.searchPlaceholder')}
        className="mb-6"
      />

      <ListEmptyState
        loading={loading}
        hasItems={tags.length > 0}
        hasFilteredItems={sortedTags.length > 0}
        emptyMessage={t('tags.noTags')}
        noMatchMessage={t('tags.noMatchingTags')}
      />

      {!loading && tags.length > 0 && sortedTags.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  <SortButton
                    columnKey="name"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    ariaLabel={t('tags.table.sortByName')}
                  >
                    {t('tags.table.name')}
                  </SortButton>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  <SortButton
                    columnKey="articleCount"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    ariaLabel={t('tags.table.sortByArticleCount')}
                  >
                    {t('tags.table.articles')}
                  </SortButton>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  <SortButton
                    columnKey="createdAt"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    ariaLabel={t('tags.table.sortByCreatedAt')}
                  >
                    {t('tags.table.created')}
                  </SortButton>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t('tags.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedTags.map((tag, index) => (
                <tr
                  key={tag.id}
                  className={`transition-colors hover:bg-muted/50 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">
                      {tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex min-w-[2rem] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        tag.articleCount > 0
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {tag.articleCount}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-muted-foreground">
                      {dayjs(tag.createdAt).format('YYYY/MM/DD')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-start gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingTag(tag)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t('tags.actions.edit')}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(tag)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t('tags.actions.delete')}
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <AdminPagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
