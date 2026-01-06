'use client';

import type { Article } from '@blog/cms-types';
import dayjs from 'dayjs';
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Eye,
  EyeOff,
  ImageIcon,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type ArticleSortKey = 'title' | 'status' | 'date';
type SortDirection = 'asc' | 'desc';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  deleteArticle,
  getArticles,
  publishArticle,
  unpublishArticle,
} from '@/lib/api/client';

export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<ArticleSortKey>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

  async function handleTogglePublish(article: Article) {
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
  }

  async function handleDelete(article: Article) {
    if (!confirm(`Delete "${article.title}"?`)) return;

    try {
      await deleteArticle(article.hash);
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete article');
    }
  }

  function handleSort(key: ArticleSortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

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

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button asChild>
          <Link href="/admin/articles/new">New Article</Link>
        </Button>
      </div>

      {/* Filter tabs */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as typeof filter)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles by title, hash, or tag..."
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          Loading...
        </div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No articles found
        </div>
      ) : sortedArticles.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No articles match your search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-16 py-4 pl-4 text-left text-sm font-semibold text-foreground">
                  <span className="sr-only">Image</span>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort('title')}
                    className="inline-flex items-center gap-1 hover:text-primary"
                    aria-label="Sort by title"
                    title="Sort by title"
                  >
                    Title
                    {sortKey === 'title' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="inline-flex items-center gap-1 hover:text-primary"
                    aria-label="Sort by status"
                    title="Sort by status"
                  >
                    Status
                    {sortKey === 'status' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  <button
                    type="button"
                    onClick={() => handleSort('date')}
                    className="inline-flex items-center gap-1 hover:text-primary"
                    aria-label="Sort by date"
                    title="Sort by date"
                  >
                    Date
                    {sortKey === 'date' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  Tags
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                  Actions
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
                  <td className="w-16 py-2 pl-4">
                    {article.headerImageUrl ? (
                      <Image
                        src={article.headerImageUrl}
                        alt=""
                        width={48}
                        height={32}
                        className="rounded object-cover"
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
                      href={`/admin/articles/${article.hash}/edit`}
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
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {article.status === 'published' ? 'Published' : 'Draft'}
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
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleTogglePublish(article)}
                      >
                        {article.status === 'published' ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            <span className="hidden sm:inline">Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Publish</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link href={`/admin/articles/${article.hash}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(article)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
