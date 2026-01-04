"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Article } from "@blog/cms-types";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import {
  deleteArticle,
  getArticles,
  publishArticle,
  unpublishArticle,
} from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const status = filter === "all" ? undefined : filter;
      const response = await getArticles({ status, perPage: 100 });
      setArticles(response.articles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  async function handleTogglePublish(article: Article) {
    try {
      if (article.status === "published") {
        await unpublishArticle(article.hash);
      } else {
        await publishArticle(article.hash);
      }
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update article");
    }
  }

  async function handleDelete(article: Article) {
    if (!confirm(`Delete "${article.title}"?`)) return;

    try {
      await deleteArticle(article.hash);
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete article");
    }
  }

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
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                  Title
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">
                  Date
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
              {articles.map((article, index) => (
                <tr
                  key={article.id}
                  className={`transition-colors hover:bg-muted/50 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
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
                        article.status === "published"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {article.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-sm text-muted-foreground">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : new Date(article.createdAt).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
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
                        {article.status === "published" ? (
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
