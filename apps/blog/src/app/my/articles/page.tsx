'use client';

import type { Article } from '@blog/cms-types';
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@blog/ui';
import dayjs from 'dayjs';
import { Edit, Eye, EyeOff, ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n';
import {
  deleteArticle,
  getArticles,
  publishArticle,
  unpublishArticle,
} from '@/lib/api/client';
import { ListEmptyState } from '../components/ListEmptyState';
import { SearchInput } from '../components/SearchInput';
import { SortButton } from '../components/SortButton';
import { useSelection } from '../hooks/use-selection';
import { useSorting } from '../hooks/use-sorting';

type ArticleSortKey = 'title' | 'status' | 'date';

export default function ArticleListPage() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    selectedIds: selectedHashes,
    toggle: handleSelectOne,
    toggleAll,
    clear: clearSelection,
    count: selectedCount,
    isAllSelected,
  } = useSelection();
  const { sortKey, sortDirection, handleSort } = useSorting<ArticleSortKey>(
    'date',
    'desc'
  );

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const response = await getArticles({ status, perPage: 100 });
      setArticles(response.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleTogglePublish = useCallback(
    async (article: Article) => {
      try {
        if (article.status === 'published') {
          await unpublishArticle(article.hash);
        } else {
          await publishArticle(article.hash);
        }
        await loadArticles();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update article');
      }
    },
    [loadArticles]
  );

  const handleDelete = useCallback(
    async (article: Article) => {
      if (!confirm(`Delete "${article.title}"?`)) return;

      try {
        await deleteArticle(article.hash);
        await loadArticles();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete article');
      }
    },
    [loadArticles]
  );

  const handleBatchDelete = useCallback(async () => {
    const count = selectedCount;
    if (count === 0) return;
    if (
      !confirm(
        t('articles.bulkActions.confirmDelete').replace(
          '{count}',
          String(count)
        )
      )
    )
      return;

    try {
      await Promise.all(
        Array.from(selectedHashes).map((hash) => deleteArticle(hash))
      );
      clearSelection();
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete articles');
    }
  }, [selectedCount, selectedHashes, clearSelection, loadArticles, t]);

  const handleBatchPublish = useCallback(async () => {
    if (selectedCount === 0) return;

    try {
      await Promise.all(
        Array.from(selectedHashes).map((hash) => publishArticle(hash))
      );
      clearSelection();
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish articles');
    }
  }, [selectedCount, selectedHashes, clearSelection, loadArticles]);

  const handleBatchUnpublish = useCallback(async () => {
    if (selectedCount === 0) return;

    try {
      await Promise.all(
        Array.from(selectedHashes).map((hash) => unpublishArticle(hash))
      );
      clearSelection();
      await loadArticles();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : 'Failed to unpublish articles'
      );
    }
  }, [selectedCount, selectedHashes, clearSelection, loadArticles]);

  const sortedArticles = useMemo(() => {
    const filtered = searchQuery.trim()
      ? articles.filter(
          (article) =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : articles;

    return [...filtered].sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;

      switch (sortKey) {
        case 'title':
          return a.title.localeCompare(b.title) * modifier;
        case 'status':
          return a.status.localeCompare(b.status) * modifier;
        case 'date': {
          const aDate = a.publishedAt || a.createdAt;
          const bDate = b.publishedAt || b.createdAt;
          return aDate.localeCompare(bDate) * modifier;
        }
        default:
          return 0;
      }
    });
  }, [articles, searchQuery, sortKey, sortDirection]);

  const handleSelectAll = useCallback(() => {
    toggleAll(sortedArticles.map((article) => article.hash));
  }, [toggleAll, sortedArticles]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('articles.title')}</h1>
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/my/articles/new">{t('articles.newArticle')}</Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v: string) => setFilter(v as typeof filter)}
        className="mb-6"
      >
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            {t('articles.filters.all')}
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            {t('articles.filters.published')}
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            {t('articles.filters.draft')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('articles.searchPlaceholder')}
        className="mb-6"
      />

      {/* Bulk actions toolbar */}
      {selectedCount > 0 && (
        <div className="mb-4 flex items-center gap-4 rounded-lg border border-border bg-muted/50 p-3">
          <span className="text-sm font-medium text-foreground">
            {t('articles.bulkActions.selected').replace(
              '{count}',
              String(selectedCount)
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchPublish}
              className="gap-1.5"
            >
              <Eye className="h-4 w-4" />
              {t('articles.bulkActions.publish')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchUnpublish}
              className="gap-1.5"
            >
              <EyeOff className="h-4 w-4" />
              {t('articles.bulkActions.unpublish')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {t('articles.bulkActions.delete')}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ListEmptyState
        loading={loading}
        hasItems={articles.length > 0}
        hasFilteredItems={sortedArticles.length > 0}
        emptyMessage={t('articles.noArticles')}
        noMatchMessage={t('articles.noMatchingArticles')}
      />

      {!loading && articles.length > 0 && sortedArticles.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-12 py-4 pl-4 text-left">
                  <Checkbox
                    checked={isAllSelected(sortedArticles.length)}
                    onCheckedChange={handleSelectAll}
                    aria-label={t('articles.bulkActions.selectAll')}
                  />
                </th>
                <th className="w-16 py-4 pl-2 text-left text-sm font-semibold text-foreground">
                  <span className="sr-only">{t('articles.table.image')}</span>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  <SortButton
                    columnKey="title"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    ariaLabel={t('articles.table.sortByTitle')}
                  >
                    {t('articles.table.title')}
                  </SortButton>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  <SortButton
                    columnKey="status"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    ariaLabel={t('articles.table.sortByStatus')}
                  >
                    {t('articles.table.status')}
                  </SortButton>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  <SortButton
                    columnKey="date"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    ariaLabel={t('articles.table.sortByDate')}
                  >
                    {t('articles.table.date')}
                  </SortButton>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  {t('articles.table.tags')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  {t('articles.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedArticles.map((article, index) => (
                <tr
                  key={article.id}
                  className={`transition-colors hover:bg-muted/50 ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  }`}
                >
                  <td className="w-12 py-2 pl-4">
                    <Checkbox
                      checked={selectedHashes.has(article.hash)}
                      onCheckedChange={() => handleSelectOne(article.hash)}
                      aria-label={`Select ${article.title}`}
                    />
                  </td>
                  <td className="w-16 py-2 pl-2">
                    {article.headerImageUrl ? (
                      <Image
                        src={article.headerImageUrl}
                        alt=""
                        width={48}
                        height={32}
                        className="h-8 w-12 rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-8 w-12 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/my/articles/${article.hash}/edit`}
                      className="block"
                    >
                      <span className="text-base font-medium text-foreground hover:text-primary">
                        {article.title}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground/70">
                        {article.hash}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-5">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        article.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-700 ring-1 ring-inset ring-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30'
                          : 'bg-amber-500/20 text-amber-700 ring-1 ring-inset ring-amber-500/40 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30'
                      }`}
                    >
                      {article.status === 'published'
                        ? t('articles.status.published')
                        : t('articles.status.draft')}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-sm text-muted-foreground">
                      {dayjs(article.publishedAt || article.createdAt).format(
                        'YYYY/MM/DD'
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="inline-flex rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleTogglePublish(article)}
                      >
                        {article.status === 'published' ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {t('articles.actions.unpublish')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {t('articles.actions.publish')}
                            </span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link href={`/my/articles/${article.hash}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {t('articles.actions.edit')}
                          </span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(article)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t('articles.actions.delete')}
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

      {/* Bottom new article button */}
      {!loading && articles.length > 0 && (
        <div className="mt-8 flex justify-end">
          <Button
            asChild
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Link href="/my/articles/new">{t('articles.newArticle')}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
