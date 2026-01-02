"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Article } from "@blog/cms-types";
import {
  deleteArticle,
  getArticles,
  publishArticle,
  unpublishArticle,
} from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <Link
                      href={`/admin/articles/${article.slug}/edit`}
                      className="font-medium text-primary hover:underline"
                    >
                      {article.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {article.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === "published" ? "default" : "secondary"
                      }
                    >
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : new Date(article.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(article)}
                      >
                        {article.status === "published" ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/articles/${article.slug}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(article)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
