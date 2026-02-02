import type { Article, ReviewArticleResponse } from '@blog/cms-types';

/**
 * ArticleEditor の状態管理用 Reducer。
 *
 * 24個の useState を論理的にグループ化し、
 * 明確なアクションタイプで状態遷移を管理する。
 */

// ==============================
// State Types
// ==============================

/** 記事データ状態 */
export interface ArticleDataState {
  title: string;
  description: string;
  content: string;
  tags: string[];
  categoryId: string | null;
  status: 'draft' | 'published';
  headerImageId: string | null;
  headerImageUrl: string | null;
  slideMode: boolean;
  slideDuration: number | null;
}

/** ローディング状態 */
export interface LoadingState {
  isUploadingHeader: boolean;
  isSaving: boolean;
  isGeneratingMetadata: boolean;
  isGeneratingImage: boolean;
  isReviewing: boolean;
  isGeneratingOutline: boolean;
}

/** UI表示状態 */
export interface UIState {
  showImagePrompt: boolean;
  isReviewOpen: boolean;
  isPreviewOpen: boolean;
  error: string | null;
  saveSuccess: boolean;
}

/** 画像生成設定状態 */
export interface ImageGenState {
  imagePrompt: string;
  useArticleContent: boolean;
  promptMode: 'append' | 'override';
}

/** レビュー結果状態 */
export interface ReviewState {
  reviewResult: ReviewArticleResponse | null;
  reviewError: string | null;
}

/** ArticleEditor の完全な状態 */
export interface ArticleEditorState {
  article: ArticleDataState;
  loading: LoadingState;
  ui: UIState;
  imageGen: ImageGenState;
  review: ReviewState;
}

// ==============================
// Action Types
// ==============================

type ArticleDataAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'SET_CATEGORY_ID'; payload: string | null }
  | { type: 'TOGGLE_STATUS' }
  | {
      type: 'SET_HEADER_IMAGE';
      payload: { id: string | null; url: string | null };
    }
  | { type: 'SET_SLIDE_MODE'; payload: boolean }
  | { type: 'SET_SLIDE_DURATION'; payload: number | null }
  | {
      type: 'SET_METADATA';
      payload: { description: string; tags: string[] };
    };

type LoadingAction =
  | { type: 'SET_UPLOADING_HEADER'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_GENERATING_METADATA'; payload: boolean }
  | { type: 'SET_GENERATING_IMAGE'; payload: boolean }
  | { type: 'SET_REVIEWING'; payload: boolean }
  | { type: 'SET_GENERATING_OUTLINE'; payload: boolean };

type UIAction =
  | { type: 'TOGGLE_IMAGE_PROMPT' }
  | { type: 'SET_REVIEW_OPEN'; payload: boolean }
  | { type: 'SET_PREVIEW_OPEN'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVE_SUCCESS'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

type ImageGenAction =
  | { type: 'SET_IMAGE_PROMPT'; payload: string }
  | { type: 'SET_USE_ARTICLE_CONTENT'; payload: boolean }
  | { type: 'SET_PROMPT_MODE'; payload: 'append' | 'override' }
  | { type: 'RESET_IMAGE_GEN' };

type ReviewAction =
  | { type: 'SET_REVIEW_RESULT'; payload: ReviewArticleResponse | null }
  | { type: 'SET_REVIEW_ERROR'; payload: string | null }
  | { type: 'START_REVIEW' }
  | { type: 'COMPLETE_REVIEW'; payload: ReviewArticleResponse }
  | { type: 'FAIL_REVIEW'; payload: string };

export type ArticleEditorAction =
  | ArticleDataAction
  | LoadingAction
  | UIAction
  | ImageGenAction
  | ReviewAction;

// ==============================
// Initial State Factory
// ==============================

export function createInitialState(initialData?: Article): ArticleEditorState {
  return {
    article: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      content: initialData?.content ?? '',
      tags: initialData?.tags ?? [],
      categoryId: initialData?.categoryId ?? null,
      status: initialData?.status ?? 'draft',
      headerImageId: initialData?.headerImageId ?? null,
      headerImageUrl: initialData?.headerImageUrl ?? null,
      slideMode: initialData?.slideMode ?? false,
      slideDuration: initialData?.slideDuration ?? null,
    },
    loading: {
      isUploadingHeader: false,
      isSaving: false,
      isGeneratingMetadata: false,
      isGeneratingImage: false,
      isReviewing: false,
      isGeneratingOutline: false,
    },
    ui: {
      showImagePrompt: false,
      isReviewOpen: false,
      isPreviewOpen: false,
      error: null,
      saveSuccess: false,
    },
    imageGen: {
      imagePrompt: '',
      useArticleContent: true,
      promptMode: 'append',
    },
    review: {
      reviewResult: initialData?.reviewResult ?? null,
      reviewError: null,
    },
  };
}

// ==============================
// Reducer
// ==============================

export function articleEditorReducer(
  state: ArticleEditorState,
  action: ArticleEditorAction
): ArticleEditorState {
  switch (action.type) {
    // Article Data Actions
    case 'SET_TITLE':
      return { ...state, article: { ...state.article, title: action.payload } };
    case 'SET_DESCRIPTION':
      return {
        ...state,
        article: { ...state.article, description: action.payload },
      };
    case 'SET_CONTENT':
      return {
        ...state,
        article: { ...state.article, content: action.payload },
      };
    case 'SET_TAGS':
      return { ...state, article: { ...state.article, tags: action.payload } };
    case 'SET_CATEGORY_ID':
      return {
        ...state,
        article: { ...state.article, categoryId: action.payload },
      };
    case 'TOGGLE_STATUS':
      return {
        ...state,
        article: {
          ...state.article,
          status: state.article.status === 'draft' ? 'published' : 'draft',
        },
      };
    case 'SET_HEADER_IMAGE':
      return {
        ...state,
        article: {
          ...state.article,
          headerImageId: action.payload.id,
          headerImageUrl: action.payload.url,
        },
      };
    case 'SET_SLIDE_MODE':
      return {
        ...state,
        article: { ...state.article, slideMode: action.payload },
      };
    case 'SET_SLIDE_DURATION':
      return {
        ...state,
        article: { ...state.article, slideDuration: action.payload },
      };
    case 'SET_METADATA':
      return {
        ...state,
        article: {
          ...state.article,
          description: action.payload.description,
          tags: action.payload.tags,
        },
      };

    // Loading Actions
    case 'SET_UPLOADING_HEADER':
      return {
        ...state,
        loading: { ...state.loading, isUploadingHeader: action.payload },
      };
    case 'SET_SAVING':
      return {
        ...state,
        loading: { ...state.loading, isSaving: action.payload },
      };
    case 'SET_GENERATING_METADATA':
      return {
        ...state,
        loading: { ...state.loading, isGeneratingMetadata: action.payload },
      };
    case 'SET_GENERATING_IMAGE':
      return {
        ...state,
        loading: { ...state.loading, isGeneratingImage: action.payload },
      };
    case 'SET_REVIEWING':
      return {
        ...state,
        loading: { ...state.loading, isReviewing: action.payload },
      };
    case 'SET_GENERATING_OUTLINE':
      return {
        ...state,
        loading: { ...state.loading, isGeneratingOutline: action.payload },
      };

    // UI Actions
    case 'TOGGLE_IMAGE_PROMPT':
      return {
        ...state,
        ui: { ...state.ui, showImagePrompt: !state.ui.showImagePrompt },
      };
    case 'SET_REVIEW_OPEN':
      return {
        ...state,
        ui: { ...state.ui, isReviewOpen: action.payload },
      };
    case 'SET_PREVIEW_OPEN':
      return {
        ...state,
        ui: { ...state.ui, isPreviewOpen: action.payload },
      };
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, ui: { ...state.ui, error: null } };
    case 'SET_SAVE_SUCCESS':
      return { ...state, ui: { ...state.ui, saveSuccess: action.payload } };

    // Image Gen Actions
    case 'SET_IMAGE_PROMPT':
      return {
        ...state,
        imageGen: { ...state.imageGen, imagePrompt: action.payload },
      };
    case 'SET_USE_ARTICLE_CONTENT':
      return {
        ...state,
        imageGen: { ...state.imageGen, useArticleContent: action.payload },
      };
    case 'SET_PROMPT_MODE':
      return {
        ...state,
        imageGen: { ...state.imageGen, promptMode: action.payload },
      };
    case 'RESET_IMAGE_GEN':
      return {
        ...state,
        imageGen: { ...state.imageGen, imagePrompt: '' },
      };

    // Review Actions
    case 'SET_REVIEW_RESULT':
      return {
        ...state,
        review: { ...state.review, reviewResult: action.payload },
      };
    case 'SET_REVIEW_ERROR':
      return {
        ...state,
        review: { ...state.review, reviewError: action.payload },
      };
    case 'START_REVIEW':
      return {
        ...state,
        loading: { ...state.loading, isReviewing: true },
        review: { ...state.review, reviewError: null },
        ui: { ...state.ui, isReviewOpen: true },
      };
    case 'COMPLETE_REVIEW':
      return {
        ...state,
        loading: { ...state.loading, isReviewing: false },
        review: { ...state.review, reviewResult: action.payload },
      };
    case 'FAIL_REVIEW':
      return {
        ...state,
        loading: { ...state.loading, isReviewing: false },
        review: { ...state.review, reviewError: action.payload },
      };

    default:
      return state;
  }
}
