'use client';

import { useState, useRef } from 'react';
import type { Article, ArticleInput } from '@blog/cms-types';
import { generateImage, generateMetadata, getTags, uploadImage } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor } from './MarkdownEditor';
import { SlugInput } from './SlugInput';
import { TagSelector } from './TagSelector';
import { ImageIcon, Sparkles, X } from 'lucide-react';

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
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showImagePrompt, setShowImagePrompt] = useState(false);
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

  const handleGenerateMetadata = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required to generate metadata');
      return;
    }

    setIsGeneratingMetadata(true);
    setError(null);

    try {
      // Get existing tags for context
      const tagsResponse = await getTags();
      const existingTags = tagsResponse.tags.map((t) => t.name);

      const result = await generateMetadata({
        title: title.trim(),
        content,
        existingTags,
      });

      setDescription(result.description);
      setTags(result.tags);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate metadata');
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      setError('Please enter a prompt for image generation');
      return;
    }

    setIsGeneratingImage(true);
    setError(null);

    try {
      const result = await generateImage({
        prompt: imagePrompt.trim(),
        title: title.trim() || undefined,
      });

      setHeaderImageId(result.id);
      setHeaderImageUrl(result.url);
      setShowImagePrompt(false);
      setImagePrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
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

        {/* Description & Tags with AI Generate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Description & Tags</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateMetadata}
              disabled={isGeneratingMetadata || !title.trim() || !content.trim()}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingMetadata ? 'Generating...' : 'AI Generate'}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm text-muted-foreground">
              Description (SEO)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for SEO (100-160 characters)"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {description.length} / 160 文字
            </p>
          </div>
          <TagSelector value={tags} onChange={setTags} />
        </div>

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
          ) : showImagePrompt ? (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label htmlFor="imagePrompt" className="text-sm">
                  Image Prompt
                </Label>
                <Textarea
                  id="imagePrompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingImage ? 'Generating...' : 'Generate'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowImagePrompt(false);
                    setImagePrompt('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => headerImageInputRef.current?.click()}
                className="flex h-32 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
              >
                {isUploadingHeader ? (
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    <span className="mt-2 text-sm text-muted-foreground">
                      Upload image
                    </span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowImagePrompt(true)}
                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50"
              >
                <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                <span className="mt-2 text-sm text-muted-foreground">
                  AI Generate
                </span>
              </button>
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
