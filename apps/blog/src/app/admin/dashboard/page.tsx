'use client';

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@blog/ui';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [all, published] = await Promise.all([
          getArticles({ perPage: 1 }),
          getArticles({ status: 'published', perPage: 1 }),
        ]);

        setStats({
          total: all.total,
          published: published.total,
          drafts: all.total - published.total,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.published}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.drafts}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button asChild className="shadow-md hover:shadow-lg transition-shadow">
          <Link href="/admin/articles/new">New Article</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/articles">View All Articles</Link>
        </Button>
      </div>
    </div>
  );
}
