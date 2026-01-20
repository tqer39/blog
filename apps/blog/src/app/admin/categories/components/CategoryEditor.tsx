'use client';

import type { CategoryInput, CategoryWithCount } from '@blog/cms-types';
import { Alert, AlertDescription, Input, Label } from '@blog/ui';
import { useEffect, useState } from 'react';
import { createCategory, updateCategory } from '@/lib/api/client';
import { EditorModal } from '../../components/EditorModal';
import { ColorPicker } from './ColorPicker';

interface CategoryEditorProps {
  category: CategoryWithCount | null;
  onClose: () => void;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryEditor({ category, onClose }: CategoryEditorProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [color, setColor] = useState(category?.color ?? '#6B7280');
  const [slugTouched, setSlugTouched] = useState(!!category);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!category;

  useEffect(() => {
    if (!isEditing && !slugTouched) {
      setSlug(toSlug(name));
    }
  }, [name, isEditing, slugTouched]);

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const input: CategoryInput = {
        name: name.trim(),
        slug: slug.trim(),
        color,
      };

      if (isEditing) {
        await updateCategory(category.id, input);
      } else {
        await createCategory(input);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <EditorModal
      title={isEditing ? 'Edit Category' : 'Create Category'}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      isEditing={isEditing}
      error={error}
    >
      <div className="space-y-2">
        <Label htmlFor="category-name">Name</Label>
        <Input
          id="category-name"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          placeholder="Category name"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-slug">Slug</Label>
        <Input
          id="category-slug"
          type="text"
          value={slug}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSlugChange(e.target.value)
          }
          placeholder="category-slug"
        />
        <p className="text-xs text-muted-foreground">
          URL-safe identifier. Auto-generated from name if not edited.
        </p>
      </div>

      <ColorPicker value={color} onChange={setColor} />

      {isEditing && category.articleCount > 0 && (
        <Alert>
          <AlertDescription>
            This category is used in {category.articleCount} article(s). Changes
            will be reflected across all associated articles.
          </AlertDescription>
        </Alert>
      )}
    </EditorModal>
  );
}
