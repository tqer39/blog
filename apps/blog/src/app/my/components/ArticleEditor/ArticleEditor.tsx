'use client';

import type {
  AnthropicModel,
  Article,
  ArticleInput,
  ImageModel,
  OpenAIModel,
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
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useAIModelSettings } from '@/hooks/useAIModelSettings';
import { useAIToolsStatus } from '@/hooks/useAIToolsStatus';
import { useArticleDraft } from '@/hooks/useArticleDraft';
import { useI18n } from '@/i18n';
import {
  generateImage,
  generateMetadata,
  generateOutline,
  getTags,
  reviewArticle,
  uploadImage,
} from '@/lib/api/client';
import { AISettingsPopover } from '../AISettingsPopover';
import { ArticlePreview } from '../ArticlePreview';
import { CategorySelector } from '../CategorySelector';
import { MarkdownEditor } from '../MarkdownEditor';
import { ReviewPanel } from '../ReviewPanel';
import { SplitButton } from '../SplitButton';
import { TagSelector } from '../TagSelector';
import { articleEditorReducer, createInitialState } from './reducer';

/**
 * 記事作成・編集エディタのProps。
 *
 * AI支援機能（メタデータ生成、画像生成、レビュー）、
 * 画像アップロード、マークダウン編集を統合した包括的なエディタ。
 */
interface ArticleEditorProps {
  /** 編集モード用の既存記事データ。未指定時は新規作成モード */
  initialData?: Article;
  /** 保存時のコールバック。エラー時はthrowで表示 */
  onSave: (input: ArticleInput) => Promise<void>;
  /** キャンセルボタンのコールバック。指定時のみボタン表示 */
  onCancel?: () => void;
}

export function ArticleEditor({
  initialData,
  onSave,
  onCancel,
}: ArticleEditorProps) {
  const { messages } = useI18n();
  const t = messages.editor;
  const initialState = useMemo(
    () => createInitialState(initialData),
    [initialData]
  );
  const [state, dispatch] = useReducer(articleEditorReducer, initialState);
  const {
    settings: aiSettings,
    updateSettings: updateAISettings,
    resetSettings: resetAISettings,
  } = useAIModelSettings();
  const { status: aiToolsStatus } = useAIToolsStatus();
  const { saveDraft, loadDraft, clearDraft } = useArticleDraft(initialData?.id);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<ReturnType<
    typeof loadDraft
  > | null>(null);
  const pristineArticleRef = useRef(initialState.article);

  // Destructure state for easier access
  const { article, loading, ui, imageGen, review } = state;

  // Load draft on mount (only for new articles or if draft is newer than saved data)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      // For new articles, always offer to restore
      // For existing articles, only offer if draft is newer
      const shouldOffer = !initialData || draft.savedAt > Date.now() - 60000;
      if (shouldOffer && draft.content) {
        setPendingDraft(draft);
        setShowDraftDialog(true);
      }
    }
  }, []);

  // Check if article has changed from its initial state
  const hasArticleChanges = useCallback(() => {
    const pristine = pristineArticleRef.current;
    return (
      article.title !== pristine.title ||
      article.description !== pristine.description ||
      article.content !== pristine.content ||
      article.categoryId !== pristine.categoryId ||
      article.status !== pristine.status ||
      article.headerImageId !== pristine.headerImageId ||
      article.slideMode !== pristine.slideMode ||
      article.slideDuration !== pristine.slideDuration ||
      JSON.stringify(article.tags) !== JSON.stringify(pristine.tags)
    );
  }, [article]);

  // Auto-save draft when article changes (debounced in hook)
  useEffect(() => {
    // Only save if the article has actually changed from its initial state
    // This prevents saving on initial mount or StrictMode double-invocation
    if (!hasArticleChanges()) {
      return;
    }

    saveDraft({
      title: article.title,
      description: article.description,
      content: article.content,
      tags: article.tags,
      categoryId: article.categoryId,
      status: article.status,
      headerImageId: article.headerImageId,
      headerImageUrl: article.headerImageUrl,
      slideMode: article.slideMode,
      slideDuration: article.slideDuration,
    });
  }, [article, saveDraft, hasArticleChanges]);

  // Handle draft restoration
  const handleRestoreDraft = useCallback(() => {
    if (pendingDraft) {
      dispatch({ type: 'SET_TITLE', payload: pendingDraft.title });
      dispatch({ type: 'SET_DESCRIPTION', payload: pendingDraft.description });
      dispatch({ type: 'SET_CONTENT', payload: pendingDraft.content });
      dispatch({ type: 'SET_TAGS', payload: pendingDraft.tags });
      dispatch({
        type: 'SET_CATEGORY_ID',
        payload: pendingDraft.categoryId,
      });
      dispatch({ type: 'SET_SLIDE_MODE', payload: pendingDraft.slideMode });
      dispatch({
        type: 'SET_SLIDE_DURATION',
        payload: pendingDraft.slideDuration,
      });
      if (pendingDraft.headerImageId && pendingDraft.headerImageUrl) {
        dispatch({
          type: 'SET_HEADER_IMAGE',
          payload: {
            id: pendingDraft.headerImageId,
            url: pendingDraft.headerImageUrl,
          },
        });
      }
    }
    setShowDraftDialog(false);
    setPendingDraft(null);
  }, [pendingDraft]);

  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    setShowDraftDialog(false);
    setPendingDraft(null);
  }, [clearDraft]);

  // Reset save success indicator after 2 seconds
  useEffect(() => {
    if (ui.saveSuccess) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_SAVE_SUCCESS', payload: false });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [ui.saveSuccess]);

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      const result = await uploadImage(file, initialData?.id);
      return result.url;
    },
    [initialData?.id]
  );

  const handleHeaderImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch({ type: 'SET_UPLOADING_HEADER', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await uploadImage(file, initialData?.id);
      dispatch({
        type: 'SET_HEADER_IMAGE',
        payload: { id: result.id, url: result.url },
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          err instanceof Error ? err.message : 'Failed to upload header image',
      });
    } finally {
      dispatch({ type: 'SET_UPLOADING_HEADER', payload: false });
      if (headerImageInputRef.current) {
        headerImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveHeaderImage = () => {
    dispatch({ type: 'SET_HEADER_IMAGE', payload: { id: null, url: null } });
  };

  const handleGenerateMetadata = async () => {
    if (!article.title.trim() || !article.content.trim()) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Title and content are required to generate metadata',
      });
      return;
    }

    dispatch({ type: 'SET_GENERATING_METADATA', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const tagsResponse = await getTags();
      const existingTags = tagsResponse.tags.map((t) => t.name);

      const result = await generateMetadata({
        title: article.title.trim(),
        content: article.content,
        existingTags,
        model: aiSettings.metadata,
      });

      dispatch({
        type: 'SET_METADATA',
        payload: { description: result.description, tags: result.tags },
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          err instanceof Error ? err.message : 'Failed to generate metadata',
      });
    } finally {
      dispatch({ type: 'SET_GENERATING_METADATA', payload: false });
    }
  };

  const handleGenerateImage = async () => {
    let finalPrompt = '';

    if (imageGen.useArticleContent) {
      const parts: string[] = [];
      if (article.title.trim()) parts.push(article.title.trim());
      if (article.description.trim()) parts.push(article.description.trim());
      if (article.content.trim()) {
        const contentSummary = article.content.trim().slice(0, 500);
        parts.push(contentSummary);
      }
      const articlePrompt = parts.join('. ');

      if (!articlePrompt && !imageGen.imagePrompt.trim()) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            'タイトル、説明文、本文のいずれか、またはカスタムプロンプトを入力してください',
        });
        return;
      }

      if (imageGen.promptMode === 'override' && imageGen.imagePrompt.trim()) {
        finalPrompt = imageGen.imagePrompt.trim();
      } else if (imageGen.imagePrompt.trim()) {
        finalPrompt = `${articlePrompt}. ${imageGen.imagePrompt.trim()}`;
      } else {
        finalPrompt = articlePrompt;
      }
    } else {
      if (!imageGen.imagePrompt.trim()) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'カスタムプロンプトを入力してください',
        });
        return;
      }
      finalPrompt = imageGen.imagePrompt.trim();
    }

    dispatch({ type: 'SET_GENERATING_IMAGE', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await generateImage({
        prompt: finalPrompt,
        title: article.title.trim() || undefined,
        model: aiSettings.image,
      });

      dispatch({
        type: 'SET_HEADER_IMAGE',
        payload: { id: result.id, url: result.url },
      });
      dispatch({ type: 'RESET_IMAGE_GEN' });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          err instanceof Error ? err.message : 'Failed to generate image',
      });
    } finally {
      dispatch({ type: 'SET_GENERATING_IMAGE', payload: false });
    }
  };

  const handleReviewArticle = async () => {
    if (!article.title.trim() || !article.content.trim()) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Title and content are required to review',
      });
      return;
    }

    dispatch({ type: 'START_REVIEW' });

    try {
      const result = await reviewArticle({
        title: article.title.trim(),
        content: article.content,
        model: aiSettings.review,
        articleHash: initialData?.hash,
      });
      dispatch({ type: 'COMPLETE_REVIEW', payload: result });
    } catch (err) {
      dispatch({
        type: 'FAIL_REVIEW',
        payload:
          err instanceof Error ? err.message : 'Failed to review article',
      });
    }
  };

  const handleGenerateOutline = async () => {
    if (!article.title.trim()) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Title is required to generate outline',
      });
      return;
    }

    dispatch({ type: 'SET_GENERATING_OUTLINE', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const result = await generateOutline({
        title: article.title.trim(),
        model: aiSettings.outline,
      });
      if (article.content.trim()) {
        dispatch({
          type: 'SET_CONTENT',
          payload: `${article.content}\n\n${result.outline}`,
        });
      } else {
        dispatch({ type: 'SET_CONTENT', payload: result.outline });
      }
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          err instanceof Error ? err.message : 'Failed to generate outline',
      });
    } finally {
      dispatch({ type: 'SET_GENERATING_OUTLINE', payload: false });
    }
  };

  const handleSave = async () => {
    if (!article.title.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Title is required' });
      return;
    }
    if (!article.content.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Content is required' });
      return;
    }

    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      await onSave({
        title: article.title.trim(),
        description: article.description.trim() || undefined,
        content: article.content,
        tags: article.tags,
        categoryId: article.categoryId,
        status: article.status,
        headerImageId: article.headerImageId,
        slideMode: article.slideMode,
        slideDuration: article.slideDuration,
      });
      clearDraft();
      dispatch({ type: 'SET_SAVE_SUCCESS', payload: true });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to save article',
      });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Draft Recovery Banner */}
      {showDraftDialog && pendingDraft && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-amber-600 dark:text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-label="Draft recovery notice"
                role="img"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {t.draftRecovery.title}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t.draftRecovery.savedAt.replace(
                  '{date}',
                  new Date(pendingDraft.savedAt).toLocaleString()
                )}
                {pendingDraft.title &&
                  ` - "${pendingDraft.title.slice(0, 30)}${pendingDraft.title.length > 30 ? '...' : ''}"`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardDraft}
              className="border-amber-500/50 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            >
              {t.draftRecovery.discard}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleRestoreDraft}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {t.draftRecovery.restore}
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {initialData ? t.editArticle : t.newArticle}
        </h1>
        <div className="flex items-center gap-4">
          {/* Status toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.status}:</span>
            <button
              type="button"
              className={`inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                article.status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-700 ring-1 ring-inset ring-emerald-500/40 hover:bg-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-700 ring-1 ring-inset ring-amber-500/40 hover:bg-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30'
              }`}
              onClick={() => dispatch({ type: 'TOGGLE_STATUS' })}
            >
              {article.status === 'published' ? t.published : t.draft}
            </button>
          </div>

          {/* AI Settings */}
          <AISettingsPopover
            settings={aiSettings}
            onSettingsChange={updateAISettings}
            onReset={resetAISettings}
            aiToolsStatus={aiToolsStatus}
          />

          {/* AI Review button */}
          <div className="flex items-center gap-2">
            <SplitButton
              onClick={handleReviewArticle}
              disabled={
                loading.isReviewing ||
                !article.title.trim() ||
                !article.content.trim() ||
                !aiToolsStatus?.hasAnthropic
              }
              modelType="anthropic"
              modelValue={aiSettings.review}
              onModelChange={(v) =>
                updateAISettings({ review: v as AnthropicModel })
              }
            >
              <MessageSquare className="h-4 w-4" />
              {loading.isReviewing ? t.reviewing : t.aiReview}
            </SplitButton>
            {review.reviewResult && !loading.isReviewing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch({ type: 'SET_REVIEW_OPEN', payload: true })
                }
                className="gap-1.5 text-muted-foreground"
              >
                {t.previousResult}
              </Button>
            )}
          </div>

          {/* Preview button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              dispatch({ type: 'SET_PREVIEW_OPEN', payload: true })
            }
            className="gap-1.5"
          >
            <Eye className="h-4 w-4" />
            {t.preview}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Only clear draft if changes were made during this session
                // This preserves existing drafts when user cancels without making changes
                if (hasArticleChanges()) {
                  clearDraft();
                }
                onCancel();
              }}
            >
              {t.cancel}
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading.isSaving}
            className={
              ui.saveSuccess
                ? 'bg-green-600 hover:bg-green-600 transition-colors shadow-md'
                : 'shadow-md hover:shadow-lg transition-shadow'
            }
          >
            {loading.isSaving ? (
              t.saving
            ) : ui.saveSuccess ? (
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                {t.saved}
              </span>
            ) : (
              t.save
            )}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {ui.error && (
        <Alert variant="destructive">
          <AlertDescription>{ui.error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">{t.title}</Label>
          <Input
            id="title"
            type="text"
            value={article.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch({ type: 'SET_TITLE', payload: e.target.value })
            }
            placeholder={t.titlePlaceholder}
            className="text-xl font-semibold"
          />
        </div>

        {/* Description & Tags with AI Generate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t.descriptionAndTags}</Label>
            <SplitButton
              onClick={handleGenerateMetadata}
              disabled={
                loading.isGeneratingMetadata ||
                !article.title.trim() ||
                !article.content.trim() ||
                !aiToolsStatus?.hasOpenAI
              }
              modelType="openai"
              modelValue={aiSettings.metadata}
              onModelChange={(v) =>
                updateAISettings({ metadata: v as OpenAIModel })
              }
            >
              <Sparkles className="h-4 w-4" />
              {loading.isGeneratingMetadata ? t.generating : t.aiGenerate}
            </SplitButton>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm text-muted-foreground"
            >
              {t.description}
            </Label>
            <Textarea
              id="description"
              value={article.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })
              }
              placeholder={t.descriptionPlaceholder}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {t.characterCount.replace(
                '{count}',
                String(article.description.length)
              )}
            </p>
          </div>
          <TagSelector
            value={article.tags}
            onChange={(tags) => dispatch({ type: 'SET_TAGS', payload: tags })}
          />
          <CategorySelector
            value={article.categoryId}
            onChange={(id) =>
              dispatch({ type: 'SET_CATEGORY_ID', payload: id })
            }
          />

          {/* Slide Mode Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={article.slideMode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  dispatch({
                    type: 'SET_SLIDE_MODE',
                    payload: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <span>{t.enableSlideMode}</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {t.slideModeHelp}
            </span>
          </div>

          {/* Slide Timer Duration - only shown when slideMode is enabled */}
          {article.slideMode && (
            <div className="mt-3 flex items-center gap-3">
              <Label
                htmlFor="slideDuration"
                className="text-sm whitespace-nowrap"
              >
                {t.duration}
              </Label>
              <Input
                id="slideDuration"
                type="number"
                min={30}
                max={3600}
                step={30}
                value={article.slideDuration ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  dispatch({
                    type: 'SET_SLIDE_DURATION',
                    payload: value === '' ? null : Number(value),
                  });
                }}
                placeholder="180"
                className="w-24"
              />
              <span className="text-xs text-muted-foreground">
                {t.durationHelp}
              </span>
            </div>
          )}
        </div>

        {/* Header Image */}
        <div className="space-y-3">
          <Label>{t.headerImage}</Label>

          {/* Preview Area (always visible) */}
          <div className="relative">
            {article.headerImageUrl ? (
              <div className="relative inline-block">
                <Image
                  src={article.headerImageUrl}
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
                  <span className="mt-1 block text-xs">{t.noImage}</span>
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
              disabled={loading.isUploadingHeader}
            >
              <ImageIcon className="mr-1.5 h-4 w-4" />
              {loading.isUploadingHeader ? t.uploading : t.upload}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'TOGGLE_IMAGE_PROMPT' })}
              disabled={!aiToolsStatus?.hasAnyKey}
              className="gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              {t.aiGenerate}
            </Button>
          </div>

          {/* AI Generate Options (collapsible) */}
          {ui.showImagePrompt && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              {/* Use article content checkbox */}
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={imageGen.useArticleContent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch({
                      type: 'SET_USE_ARTICLE_CONTENT',
                      payload: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                {t.imageGeneration.useArticleContent}
              </label>

              {/* Custom prompt input */}
              <div className="space-y-2">
                <Label htmlFor="imagePrompt" className="text-sm">
                  {t.imageGeneration.customPrompt}{' '}
                  {imageGen.useArticleContent
                    ? t.imageGeneration.optional
                    : t.imageGeneration.required}
                </Label>
                <Textarea
                  id="imagePrompt"
                  value={imageGen.imagePrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    dispatch({
                      type: 'SET_IMAGE_PROMPT',
                      payload: e.target.value,
                    })
                  }
                  placeholder={
                    imageGen.useArticleContent
                      ? t.imageGeneration.additionalInstructions
                      : t.imageGeneration.describeImage
                  }
                  rows={2}
                />
              </div>

              {/* Prompt mode (only shown when article content is used and custom prompt exists) */}
              {imageGen.useArticleContent && imageGen.imagePrompt.trim() && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {t.imageGeneration.mode}:
                  </span>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="promptMode"
                      value="append"
                      checked={imageGen.promptMode === 'append'}
                      onChange={() =>
                        dispatch({
                          type: 'SET_PROMPT_MODE',
                          payload: 'append',
                        })
                      }
                      className="h-4 w-4"
                    />
                    {t.imageGeneration.append}
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="promptMode"
                      value="override"
                      checked={imageGen.promptMode === 'override'}
                      onChange={() =>
                        dispatch({
                          type: 'SET_PROMPT_MODE',
                          payload: 'override',
                        })
                      }
                      className="h-4 w-4"
                    />
                    {t.imageGeneration.override}
                  </label>
                </div>
              )}

              {/* Generate button */}
              <div className="flex items-center gap-2">
                <SplitButton
                  onClick={handleGenerateImage}
                  disabled={
                    loading.isGeneratingImage ||
                    (!imageGen.useArticleContent &&
                      !imageGen.imagePrompt.trim()) ||
                    (imageGen.useArticleContent &&
                      !article.title.trim() &&
                      !article.description.trim() &&
                      !article.content.trim() &&
                      !imageGen.imagePrompt.trim()) ||
                    !aiToolsStatus?.hasAnyKey
                  }
                  modelType="image"
                  modelValue={aiSettings.image}
                  onModelChange={(v) =>
                    updateAISettings({ image: v as ImageModel })
                  }
                >
                  <Sparkles className="h-4 w-4" />
                  {loading.isGeneratingImage
                    ? t.generating
                    : t.imageGeneration.generate}
                </SplitButton>
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
            <Label>{t.content}</Label>
            <SplitButton
              onClick={() => handleGenerateOutline()}
              disabled={
                loading.isGeneratingOutline ||
                !article.title.trim() ||
                !aiToolsStatus?.hasAnthropic
              }
              modelType="anthropic"
              modelValue={aiSettings.outline}
              onModelChange={(v) =>
                updateAISettings({ outline: v as AnthropicModel })
              }
            >
              <ListTree className="h-4 w-4" />
              {loading.isGeneratingOutline ? t.generating : t.aiOutline}
            </SplitButton>
          </div>
          <MarkdownEditor
            value={article.content}
            onChange={(value) =>
              dispatch({ type: 'SET_CONTENT', payload: value })
            }
            onImageUpload={handleImageUpload}
            title={article.title}
            aiSettings={aiSettings}
            aiToolsStatus={aiToolsStatus}
          />
        </div>
      </div>

      {/* Review Panel */}
      <ReviewPanel
        isOpen={ui.isReviewOpen}
        onClose={() => dispatch({ type: 'SET_REVIEW_OPEN', payload: false })}
        review={review.reviewResult}
        isLoading={loading.isReviewing}
        error={review.reviewError}
      />
      <ArticlePreview
        isOpen={ui.isPreviewOpen}
        onClose={() => dispatch({ type: 'SET_PREVIEW_OPEN', payload: false })}
        title={article.title}
        content={article.content}
        tags={article.tags}
        headerImageUrl={article.headerImageUrl}
        publishedAt={initialData?.publishedAt}
        slideMode={article.slideMode}
        slideDuration={article.slideDuration}
      />
    </div>
  );
}
