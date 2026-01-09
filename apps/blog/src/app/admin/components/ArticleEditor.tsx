'use client';

import type {
  AnthropicModel,
  Article,
  ArticleInput,
  OpenAIModel,
  ReviewArticleResponse,
} from '@blog/cms-types';
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Textarea,
} from '@blog/ui';
import {
  Check,
  Eye,
  ImageIcon,
  ListTree,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAIModelSettings } from '@/hooks/useAIModelSettings';
import {
  generateImage,
  generateMetadata,
  generateOutline,
  getTags,
  reviewArticle,
  uploadImage,
} from '@/lib/api/client';
import { AISettingsPopover } from './AISettingsPopover';
import { ArticlePreview } from './ArticlePreview';
import { MarkdownEditor } from './MarkdownEditor';
import { ReviewPanel } from './ReviewPanel';
import { SplitButton } from './SplitButton';
import { TagSelector } from './TagSelector';

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
  const {
    settings: aiSettings,
    updateSettings: updateAISettings,
    resetSettings: resetAISettings,
  } = useAIModelSettings();
  const [useArticleContent, setUseArticleContent] = useState(true);
  const [promptMode, setPromptMode] = useState<'append' | 'override'>('append');
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewResult, setReviewResult] =
    useState<ReviewArticleResponse | null>(initialData?.reviewResult ?? null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const headerImageInputRef = useRef<HTMLInputElement>(null);

  // Reset save success indicator after 2 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadImage(file, initialData?.id);
    return result.url;
  };

  const handleHeaderImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHeader(true);
    setError(null);

    try {
      const result = await uploadImage(file, initialData?.id);
      setHeaderImageId(result.id);
      setHeaderImageUrl(result.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to upload header image'
      );
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
        model: aiSettings.metadata,
      });

      setDescription(result.description);
      setTags(result.tags);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate metadata'
      );
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleGenerateImage = async () => {
    // Build prompt based on settings
    let finalPrompt = '';

    if (useArticleContent) {
      // Build prompt from article content (title + description)
      const articlePrompt = `${title.trim()}${description.trim() ? `: ${description.trim()}` : ''}`;

      if (!articlePrompt && !imagePrompt.trim()) {
        setError('タイトルまたはカスタムプロンプトを入力してください');
        return;
      }

      if (promptMode === 'override' && imagePrompt.trim()) {
        finalPrompt = imagePrompt.trim();
      } else if (imagePrompt.trim()) {
        finalPrompt = `${articlePrompt}. ${imagePrompt.trim()}`;
      } else {
        finalPrompt = articlePrompt;
      }
    } else {
      if (!imagePrompt.trim()) {
        setError('カスタムプロンプトを入力してください');
        return;
      }
      finalPrompt = imagePrompt.trim();
    }

    setIsGeneratingImage(true);
    setError(null);

    try {
      const result = await generateImage({
        prompt: finalPrompt,
        title: title.trim() || undefined,
        model: aiSettings.image,
      });

      setHeaderImageId(result.id);
      setHeaderImageUrl(result.url);
      setImagePrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleReviewArticle = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required to review');
      return;
    }

    setIsReviewing(true);
    setReviewError(null);
    setIsReviewOpen(true);

    try {
      const result = await reviewArticle({
        title: title.trim(),
        content,
        model: aiSettings.review,
        articleHash: initialData?.hash,
      });
      setReviewResult(result);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : 'Failed to review article'
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!title.trim()) {
      setError('Title is required to generate outline');
      return;
    }

    setIsGeneratingOutline(true);
    setError(null);

    try {
      const result = await generateOutline({
        title: title.trim(),
        model: aiSettings.outline,
      });
      // Append outline to existing content or set as new content
      if (content.trim()) {
        setContent(`${content}\n\n${result.outline}`);
      } else {
        setContent(result.outline);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate outline'
      );
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
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
        description: description.trim() || undefined,
        content,
        tags,
        status,
        headerImageId,
      });
      setSaveSuccess(true);
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
            <button
              type="button"
              className={`inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-700 ring-1 ring-inset ring-emerald-500/40 hover:bg-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-700 ring-1 ring-inset ring-amber-500/40 hover:bg-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30'
              }`}
              onClick={() =>
                setStatus(status === 'draft' ? 'published' : 'draft')
              }
            >
              {status === 'published' ? 'Published' : 'Draft'}
            </button>
          </div>

          {/* AI Settings */}
          <AISettingsPopover
            settings={aiSettings}
            onSettingsChange={updateAISettings}
            onReset={resetAISettings}
          />

          {/* AI Review button */}
          <div className="flex items-center gap-2">
            <SplitButton
              onClick={handleReviewArticle}
              disabled={isReviewing || !title.trim() || !content.trim()}
              modelType="anthropic"
              modelValue={aiSettings.review}
              onModelChange={(v) =>
                updateAISettings({ review: v as AnthropicModel })
              }
            >
              <MessageSquare className="h-4 w-4" />
              {isReviewing ? 'Reviewing...' : 'AI Review'}
            </SplitButton>
            {reviewResult && !isReviewing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsReviewOpen(true)}
                className="gap-1.5 text-muted-foreground"
              >
                前回の結果
              </Button>
            )}
          </div>

          {/* Preview button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="gap-1.5"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={
              saveSuccess
                ? 'bg-green-600 hover:bg-green-600 transition-colors shadow-md'
                : 'shadow-md hover:shadow-lg transition-shadow'
            }
          >
            {isSaving ? (
              'Saving...'
            ) : saveSuccess ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                Saved
              </span>
            ) : (
              'Save'
            )}
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

        {/* Description & Tags with AI Generate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Description & Tags</Label>
            <SplitButton
              onClick={handleGenerateMetadata}
              disabled={
                isGeneratingMetadata || !title.trim() || !content.trim()
              }
              modelType="openai"
              modelValue={aiSettings.metadata}
              onModelChange={(v) =>
                updateAISettings({ metadata: v as OpenAIModel })
              }
            >
              <Sparkles className="h-4 w-4" />
              {isGeneratingMetadata ? 'Generating...' : 'AI Generate'}
            </SplitButton>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm text-muted-foreground"
            >
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
        <div className="space-y-3">
          <Label>Header Image</Label>

          {/* Preview Area (always visible) */}
          <div className="relative">
            {headerImageUrl ? (
              <div className="relative inline-block">
                <Image
                  src={headerImageUrl}
                  alt="Header preview"
                  width={400}
                  height={200}
                  className="max-h-48 rounded-lg border object-cover"
                  unoptimized
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
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10">
                <div className="text-center text-muted-foreground/50">
                  <ImageIcon className="mx-auto h-8 w-8" />
                  <span className="mt-1 block text-xs">No image</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => headerImageInputRef.current?.click()}
              disabled={isUploadingHeader}
            >
              <ImageIcon className="mr-1.5 h-4 w-4" />
              {isUploadingHeader ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowImagePrompt(!showImagePrompt)}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              AI Generate
            </Button>
          </div>

          {/* AI Generate Options (collapsible) */}
          {showImagePrompt && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              {/* Use article content checkbox */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useArticleContent}
                  onChange={(e) => setUseArticleContent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                記事の内容をプロンプトとして使用
              </label>

              {/* Custom prompt input */}
              <div className="space-y-2">
                <Label htmlFor="imagePrompt" className="text-sm">
                  カスタムプロンプト{' '}
                  {useArticleContent ? '(オプション)' : '(必須)'}
                </Label>
                <Textarea
                  id="imagePrompt"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder={
                    useArticleContent
                      ? '追加の指示があれば入力...'
                      : '生成したい画像を説明してください...'
                  }
                  rows={2}
                />
              </div>

              {/* Prompt mode (only shown when article content is used and custom prompt exists) */}
              {useArticleContent && imagePrompt.trim() && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">モード:</span>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="promptMode"
                      value="append"
                      checked={promptMode === 'append'}
                      onChange={() => setPromptMode('append')}
                      className="h-4 w-4"
                    />
                    追加
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="promptMode"
                      value="override"
                      checked={promptMode === 'override'}
                      onChange={() => setPromptMode('override')}
                      className="h-4 w-4"
                    />
                    上書き
                  </label>
                </div>
              )}

              {/* Generate button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateImage}
                  disabled={
                    isGeneratingImage ||
                    (!useArticleContent && !imagePrompt.trim()) ||
                    (useArticleContent && !title.trim() && !imagePrompt.trim())
                  }
                  className="gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGeneratingImage ? 'Generating...' : 'Generate'}
                </Button>
              </div>
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
          <div className="flex items-center justify-between">
            <Label>Content</Label>
            <SplitButton
              onClick={() => handleGenerateOutline()}
              disabled={isGeneratingOutline || !title.trim()}
              modelType="anthropic"
              modelValue={aiSettings.outline}
              onModelChange={(v) =>
                updateAISettings({ outline: v as AnthropicModel })
              }
            >
              <ListTree className="h-4 w-4" />
              {isGeneratingOutline ? 'Generating...' : 'AI Outline'}
            </SplitButton>
          </div>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onImageUpload={handleImageUpload}
            title={title}
            aiSettings={aiSettings}
          />
        </div>
      </div>

      {/* Review Panel */}
      <ReviewPanel
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        review={reviewResult}
        isLoading={isReviewing}
        error={reviewError}
      />
      <ArticlePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={title}
        content={content}
        tags={tags}
        headerImageUrl={headerImageUrl}
        publishedAt={initialData?.publishedAt}
      />
    </div>
  );
}
