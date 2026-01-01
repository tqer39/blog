"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Article } from "@blog/cms-types";
import { deleteArticle, getArticles, publishArticle, unpublishArticle } from "@/lib/api/client";

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
        await unpublishArticle(article.slug);
      } else {
        await publishArticle(article.slug);
      }
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update article");
    }
  }

  async function handleDelete(article: Article) {
    if (!confirm(`Delete "${article.title}"?`)) return;

    try {
      await deleteArticle(article.slug);
      await loadArticles();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete article");
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          New Article
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 font-medium capitalize ${
              filter === f
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-stone-500">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-stone-500">No articles found</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <table className="w-full">
            <thead className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-stone-500">Title</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-stone-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-stone-500">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-stone-500">Tags</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-stone-50 dark:hover:bg-stone-700/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/articles/${article.slug}/edit`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {article.title}
                    </Link>
                    <div className="text-sm text-stone-500">{article.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-stone-100 px-2 py-0.5 text-xs dark:bg-stone-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(article)}
                        className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
                      >
                        {article.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/admin/articles/${article.slug}/edit`}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(article)}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
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
