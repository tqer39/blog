'use client';

import { useState, useRef } from 'react';
import type { Article, ArticleInput } from '@blog/cms-types';
import { uploadImage } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor } from './MarkdownEditor';
import { SlugInput } from './SlugInput';
import { TagSelector } from './TagSelector';
import { ImageIcon, X } from 'lucide-react';

interface ArticleEditorProps {
  initialData?: Article;
  onSave: (input: ArticleInput) => Promise<void>;
  onCancel?: () => void;
}

export function ArticleEditor({
  initialData,
  onSave,
  onCancel,
}: ArticleEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [description, setDescription] = useState(
    initialData?.description ?? ''
  );
  const [content, setContent] = useState(initialData?.content ?? '');
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialData?.status ?? 'draft'
  );
  const [headerImageId, setHeaderImageId] = useState<string | null>(
    initialData?.headerImageId ?? null
  );
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(
    initialData?.headerImageUrl ?? null
  );
  const [isUploadingHeader, setIsUploadingHeader] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadImage(file, initialData?.id);
    return result.url;
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeader(true);
    setError(null);

    try {
      const result = await uploadImage(file, initialData?.id);
      setHeaderImageId(result.id);
      setHeaderImageUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload header image');
    } finally {
      setIsUploadingHeader(false);
      if (headerImageInputRef.current) {
        headerImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveHeaderImage = () => {
    setHeaderImageId(null);
    setHeaderImageUrl(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        content,
        tags,
        status,
        headerImageId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {initialData ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="flex items-center gap-4">
          {/* Status toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge
              variant={status === 'published' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() =>
                setStatus(status === 'draft' ? 'published' : 'draft')
              }
            >
              {status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="text-xl font-semibold"
          />
        </div>

        {/* Slug */}
        <SlugInput value={slug} onChange={setSlug} generateFrom={title} />

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (SEO)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description for SEO (100-160 characters)"
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            {description.length} / 160 characters
          </p>
        </div>

        {/* Tags */}
        <TagSelector value={tags} onChange={setTags} />

        {/* Header Image */}
        <div className="space-y-2">
          <Label>Header Image</Label>
          {headerImageUrl ? (
            <div className="relative inline-block">
              <img
                src={headerImageUrl}
                alt="Header preview"
                className="max-h-48 rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveHeaderImage}
                aria-label="Remove header image"
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => headerImageInputRef.current?.click()}
              className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
            >
              {isUploadingHeader ? (
                <span className="text-sm text-muted-foreground">Uploading...</span>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  <span className="mt-2 text-sm text-muted-foreground">
                    Click to upload header image
                  </span>
                </>
              )}
            </div>
          )}
          <input
            ref={headerImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleHeaderImageUpload}
            aria-label="Upload header image"
            className="hidden"
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Label>Content</Label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}
