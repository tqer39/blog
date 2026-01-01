"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getArticles } from "@/lib/api/client";

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
          getArticles({ status: "published", perPage: 1 }),
        ]);

        setStats({
          total: all.total,
          published: published.total,
          drafts: all.total - published.total,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard title="Total Articles" value={stats.total} />
        <StatCard title="Published" value={stats.published} color="green" />
        <StatCard title="Drafts" value={stats.drafts} color="yellow" />
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/articles/new"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          New Article
        </Link>
        <Link
          href="/admin/articles"
          className="rounded-lg border border-stone-300 px-6 py-3 font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-800"
        >
          View All Articles
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color = "blue",
}: {
  title: string;
  value: number;
  color?: "blue" | "green" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
