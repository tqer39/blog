/**
 * Shared constants, configurations, and utilities for AI handlers
 */
import type {
  AnthropicModel,
  ArticleCategory,
  ContinuationLength,
  OpenAIModel,
  TransformAction,
} from '@blog/cms-types';

// Valid model lists for validation
export const VALID_OPENAI_MODELS: OpenAIModel[] = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4.1-mini-2025-04-14',
  'gpt-4.1-2025-04-14',
];

export const VALID_ANTHROPIC_MODELS: AnthropicModel[] = [
  'claude-sonnet-4-20250514',
  'claude-sonnet-4-5-20250929',
  'claude-opus-4-5-20251101',
  'claude-haiku-4-5-20251001',
];

// Default models
export const DEFAULT_OPENAI_MODEL: OpenAIModel = 'gpt-4o-mini';
export const DEFAULT_ANTHROPIC_MODEL: AnthropicModel =
  'claude-sonnet-4-5-20250929';

// Gemini Image models
export const GEMINI_IMAGE_MODELS = {
  'gemini-2.5-flash-image': 'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview': 'gemini-3-pro-image-preview',
} as const;

// OpenAI DALL-E models
export const OPENAI_IMAGE_MODELS = {
  'dall-e-3': 'dall-e-3',
  'dall-e-2': 'dall-e-2',
} as const;

// Combined image models
export const ALL_IMAGE_MODELS = {
  ...GEMINI_IMAGE_MODELS,
  ...OPENAI_IMAGE_MODELS,
} as const;

export const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';

// Helper to detect provider from model name
export function getImageProvider(model: string): 'gemini' | 'openai' | null {
  if (model in GEMINI_IMAGE_MODELS) return 'gemini';
  if (model in OPENAI_IMAGE_MODELS) return 'openai';
  return null;
}

// Anthropic API configuration
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Header image generation configuration
export const HEADER_IMAGE_CONFIG = {
  width: 1200,
  height: 630,
  format: 'png',
  systemPrompt: `Generate a blog header image with the following specifications:
- Aspect ratio: 1200x630 pixels (OG image standard for social media)
- Style: modern, clean, professional blog header illustration
- Colors: harmonious color palette, not too saturated
- Composition: balanced, leave space for potential text overlay
- No text or letters in the image itself
- Abstract or conceptual illustration preferred
- High quality, visually appealing for social media preview`,
};

// Japanese system prompts for Claude
export const REVIEW_SYSTEM_PROMPT = `あなたは日本語の技術ブログ記事をレビューする専門家です。
以下の観点からフィードバックを提供してください：

1. clarity（明確さ）: 記事の論理的な流れ、説明のわかりやすさ
2. structure（構成）: 段落構成、見出しの使い方、情報の整理
3. accuracy（正確性）: 技術的な内容の正確さ、コード例の妥当性
4. grammar（文法）: 誤字脱字、文法ミス、表記揺れ
5. style（スタイル）: 文体の一貫性、冗長な表現

このブログは「未来の自分への記録」として書かれています。
一般読者向けの過度な説明は不要ですが、数ヶ月後の自分が読み返して理解できる程度の明確さは必要です。

必ず以下のJSON形式のみで回答してください（他の文章は含めないでください）：
{
  "summary": "全体的な評価（2-3文）",
  "overallScore": 1から10の数値,
  "items": [
    {
      "category": "clarity" | "structure" | "accuracy" | "grammar" | "style",
      "severity": "info" | "warning" | "error",
      "location": "問題箇所の引用または位置（省略可）",
      "issue": "問題点の説明",
      "suggestion": "改善案"
    }
  ]
}`;

// Length-specific character ranges for continuation suggestions
export const CONTINUATION_LENGTH_CONFIG: Record<
  ContinuationLength,
  { min: number; max: number; label: string }
> = {
  short: { min: 30, max: 100, label: '30-100文字程度' },
  medium: { min: 100, max: 300, label: '100-300文字程度' },
  long: { min: 300, max: 600, label: '300-600文字程度' },
};

export function buildContinuationSystemPrompt(
  length: ContinuationLength
): string {
  const config = CONTINUATION_LENGTH_CONFIG[length];
  return `あなたは日本語の技術ブログ記事の執筆を支援するアシスタントです。
記事の続きを3つ提案してください。

コンテキスト：
- このブログは個人の決定ログとして機能しています
- 対象読者は数ヶ月後の自分自身です
- 結論と「なぜそうしたか」を最短距離で伝えることが重要です
- 技術記事の場合：結論 → 前提 → 却下した選択肢 → 実装
- 過度な装飾や一般読者向けの説明は不要です

必ず以下のJSON形式のみで回答してください（他の文章は含めないでください）：
{
  "suggestions": [
    {
      "text": "続きのテキスト（${config.label}）",
      "confidence": 0.0から1.0
    }
  ]
}`;
}

// Category-specific outline templates
const OUTLINE_TEMPLATES: Record<ArticleCategory, string> = {
  tech: `技術記事のテンプレート：
## 結論
（最も重要な結論を最初に）

## 前提・背景
（なぜこの決定が必要だったか）

## 検討した選択肢
（却下した選択肢とその理由）

## 実装・詳細
（具体的な実装や手順）

## 補足
（将来の自分への注意点など）`,

  life: `経験記事のテンプレート：
## 出来事の概要
（何が起きたか）

## 感じたこと
（その時の感情や印象）

## 構造・背景
（なぜそうなったのか）

## 行動メモ
（次に同じ状況になったらどうするか）`,

  books: `読書記事のテンプレート：
## なぜ読んだか
（読むきっかけ、期待）

## 印象に残った点
（重要な引用や考え方）

## 自分への影響
（考え方や行動の変化）

## メモ
（後で参照したい情報）`,
};

export function buildOutlineSystemPrompt(category?: ArticleCategory): string {
  const template = category ? OUTLINE_TEMPLATES[category] : '';
  const categoryGuide = template
    ? `\n\n参考テンプレート（このカテゴリの一般的な構成）：\n${template}`
    : '';

  return `あなたは日本語のブログ記事のアウトラインを生成するアシスタントです。
タイトルから記事の見出し構成を提案してください。

コンテキスト：
- このブログは「未来の自分への記録」として書かれています
- 対象読者は数ヶ月後の自分自身です
- 結論と「なぜそうしたか」を最短距離で伝えることが重要です
- 過度な装飾や一般読者向けの説明は不要です
${categoryGuide}

出力形式：
- Markdown形式の見出し構成のみを出力
- ## で始まるH2見出しを3〜6個程度
- 必要に応じて ### のH3見出しも使用可
- 見出しの下に1行の簡単な説明を追加（何を書くかのヒント）
- JSON形式ではなく、そのままMarkdownとして使える形式で出力`;
}

// Text transform action configurations
const TRANSFORM_ACTION_PROMPTS: Record<TransformAction, string> = {
  rewrite: `以下のテキストをより簡潔で明確に書き直してください。
意味を変えずに、読みやすさを向上させてください。`,

  expand: `以下のテキストをより詳細に展開してください。
具体例や補足説明を追加して、内容を充実させてください。
元の文体とトーンを維持してください。`,

  summarize: `以下のテキストを要約してください。
重要なポイントを保持しながら、できるだけ簡潔にまとめてください。`,

  translate: `以下のテキストを翻訳してください。
自然な表現を心がけ、原文のニュアンスを保持してください。`,

  formal: `以下のテキストをよりフォーマルな文体に変換してください。
ビジネス文書や公式文書に適した表現にしてください。`,

  casual: `以下のテキストをよりカジュアルな文体に変換してください。
親しみやすく、読みやすい表現にしてください。`,
};

export function buildTransformSystemPrompt(
  action: TransformAction,
  targetLanguage?: 'ja' | 'en'
): string {
  let prompt = TRANSFORM_ACTION_PROMPTS[action];

  if (action === 'translate' && targetLanguage) {
    const langName = targetLanguage === 'ja' ? '日本語' : '英語';
    prompt += `\n翻訳先の言語: ${langName}`;
  }

  return `あなたはテキスト変換を行うアシスタントです。

${prompt}

重要な注意事項：
- 変換後のテキストのみを出力してください
- 説明や前置きは不要です
- Markdown形式を維持してください（リンク、コードブロックなど）`;
}
