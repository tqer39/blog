'use client';

import type { Article, ArticleInput } from '@blog/cms-types';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getArticle, updateArticle } from '@/lib/api/client';
import { ArticleEditor } from '../../../components/ArticleEditor';

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        const data = await getArticle(hash);
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [hash]);

  const handleSave = async (input: ArticleInput) => {
    await updateArticle(hash, input);
    router.push('/admin/articles');
  };

  const handleCancel = () => {
    router.push('/admin/articles');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        {error || 'Article not found'}
      </div>
    );
  }

  return (
    <ArticleEditor
      initialData={article}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
