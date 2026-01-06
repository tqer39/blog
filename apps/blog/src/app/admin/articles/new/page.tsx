'use client';

import type { ArticleInput } from '@blog/cms-types';
import { useRouter } from 'next/navigation';
import { createArticle } from '@/lib/api/client';
import { ArticleEditor } from '../../components/ArticleEditor';

export default function NewArticlePage() {
  const router = useRouter();

  const handleSave = async (input: ArticleInput) => {
    await createArticle(input);
    router.push('/admin/articles');
  };

  const handleCancel = () => {
    router.push('/admin/articles');
  };

  return <ArticleEditor onSave={handleSave} onCancel={handleCancel} />;
}
