import type {
  AnthropicModel,
  ArticleCategory,
  ContinuationLength,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateMetadataRequest,
  GenerateMetadataResponse,
  GenerateOutlineRequest,
  GenerateOutlineResponse,
  OpenAIModel,
  ReviewArticleRequest,
  ReviewArticleResponse,
  ReviewItem,
  SuggestContinuationRequest,
  SuggestContinuationResponse,
  TransformAction,
  TransformTextRequest,
  TransformTextResponse,
} from '@blog/cms-types';
import { generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import { internalError, validationError } from '../lib/errors';
import { getPublicUrl } from '../lib/r2-presigned';

export const aiHandler = new Hono<{ Bindings: Env }>();

// Valid model lists for validation
const VALID_OPENAI_MODELS: OpenAIModel[] = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
];

const VALID_ANTHROPIC_MODELS: AnthropicModel[] = [
  'claude-sonnet-4-20250514',
  'claude-3-5-sonnet-20241022',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
];

// Default models
const DEFAULT_OPENAI_MODEL: OpenAIModel = 'gpt-4o-mini';
const DEFAULT_ANTHROPIC_MODEL: AnthropicModel = 'claude-sonnet-4-20250514';

// Nano Banana (Gemini Image) models
const NANO_BANANA_MODELS = {
  'gemini-2.5-flash-image': 'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview': 'gemini-3-pro-image-preview',
} as const;

const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';

// Header image generation configuration
const HEADER_IMAGE_CONFIG = {
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

// Anthropic API configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Japanese system prompts for Claude
const REVIEW_SYSTEM_PROMPT = `あなたは日本語の技術ブログ記事をレビューする専門家です。
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
const CONTINUATION_LENGTH_CONFIG: Record<
  ContinuationLength,
  { min: number; max: number; label: string }
> = {
  short: { min: 30, max: 100, label: '30-100文字程度' },
  medium: { min: 100, max: 300, label: '100-300文字程度' },
  long: { min: 300, max: 600, label: '300-600文字程度' },
};

const buildContinuationSystemPrompt = (length: ContinuationLength): string => {
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
};

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

const buildOutlineSystemPrompt = (category?: ArticleCategory): string => {
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
};

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

const buildTransformSystemPrompt = (
  action: TransformAction,
  targetLanguage?: 'ja' | 'en'
): string => {
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
};

// Generate article metadata (description + tags) using OpenAI
aiHandler.post('/generate-metadata', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    internalError('OpenAI API key not configured');
  }

  const body = await c.req.json<GenerateMetadataRequest>();
  const { title, content, existingTags, model = DEFAULT_OPENAI_MODEL } = body;

  if (!title || !content) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content ? {} : { content: 'Required' }),
    });
  }

  // Validate model
  if (!VALID_OPENAI_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_OPENAI_MODELS.join(', ')}`,
    });
  }

  // Truncate content if too long (keep first 3000 chars)
  const truncatedContent = content.slice(0, 3000);

  const systemPrompt = `You are a helpful assistant that generates SEO-friendly metadata for blog articles.
Given an article title and content, generate:
1. A concise description (100-160 characters) that summarizes the article for SEO
2. 3-5 relevant tags for the article

Respond in JSON format:
{
  "description": "SEO-friendly description here",
  "tags": ["tag1", "tag2", "tag3"]
}

Guidelines:
- Description should be in the same language as the article
- Tags should be lowercase, hyphenated for multi-word tags
- Tags should be specific and relevant to the content
- Prefer commonly used tags over obscure ones`;

  const userPrompt = `Title: ${title}

Content:
${truncatedContent}

${existingTags?.length ? `Existing tags in the system: ${existingTags.join(', ')}. Prefer using these if relevant.` : ''}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      internalError('Failed to generate metadata');
    }

    const data = await response.json<{
      choices: Array<{ message: { content: string } }>;
    }>();
    const result = JSON.parse(
      data.choices[0].message.content
    ) as GenerateMetadataResponse;

    return c.json(result);
  } catch (error) {
    console.error('Error generating metadata:', error);
    internalError('Failed to generate metadata');
  }
});

// Generate header image using Nano Banana (Gemini Image)
aiHandler.post('/generate-image', async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    internalError('Gemini API key not configured');
  }

  const body = await c.req.json<GenerateImageRequest>();
  const { prompt, title, model = DEFAULT_IMAGE_MODEL } = body;

  if (!prompt) {
    validationError('Invalid input', { prompt: 'Required' });
  }

  // Validate model
  if (!NANO_BANANA_MODELS[model]) {
    validationError('Invalid model', {
      model: `Must be one of: ${Object.keys(NANO_BANANA_MODELS).join(', ')}`,
    });
  }

  // Build 3-layer prompt: system instructions + article content + user prompt
  const promptParts = [
    // Layer 1: System instructions for header image specifications
    HEADER_IMAGE_CONFIG.systemPrompt,
    '',
    // Layer 2: Article content (title)
    title ? `Article title: "${title}"` : null,
    // Layer 3: User's custom prompt
    prompt ? `Additional context: ${prompt}` : null,
  ].filter(Boolean);

  const imagePrompt = promptParts.join('\n');

  try {
    // Use Nano Banana (Gemini Image) API for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: imagePrompt }],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      internalError('Failed to generate image');
    }

    const data = await response.json<{
      candidates: Array<{
        content: {
          parts: Array<{
            inlineData?: { mimeType: string; data: string };
            text?: string;
          }>;
        };
      }>;
    }>();

    if (!data.candidates || data.candidates.length === 0) {
      internalError('No image generated');
    }

    const parts = data.candidates[0].content.parts;
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart?.inlineData) {
      internalError('No image data in response');
    }

    const imageData = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));

    // Upload to R2
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const id = generateId();
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${id}.${ext}`;
    const r2Key = `images/${year}/${month}/${filename}`;

    await c.env.R2_BUCKET.put(r2Key, binaryData, {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    // Save metadata to D1
    await c.env.DB.prepare(
      `INSERT INTO images (id, filename, original_filename, r2_key, mime_type, size_bytes, alt_text)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        filename,
        `ai-generated-${filename}`,
        r2Key,
        mimeType,
        binaryData.length,
        prompt
      )
      .run();

    const publicUrl = await getPublicUrl(c.env, r2Key);

    const result: GenerateImageResponse = {
      id,
      url: publicUrl,
    };

    return c.json(result, 201);
  } catch (error) {
    console.error('Error generating image:', error);
    internalError('Failed to generate image');
  }
});

// Review article using Claude
aiHandler.post('/review-article', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<ReviewArticleRequest>();
  const { title, content, model = DEFAULT_ANTHROPIC_MODEL } = body;

  if (!title || !content) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content ? {} : { content: 'Required' }),
    });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  // Truncate content if too long (keep first 30000 chars)
  const truncatedContent = content.slice(0, 30000);

  const userPrompt = `以下の記事をレビューしてください。

タイトル: ${title}

本文:
${truncatedContent}`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: REVIEW_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError('Failed to review article');
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', textContent.text);
      internalError('Failed to parse review response');
    }

    const result = JSON.parse(jsonMatch[0]) as ReviewArticleResponse;

    // Validate and sanitize the response
    const sanitizedResult: ReviewArticleResponse = {
      summary: result.summary || 'レビュー完了',
      overallScore: Math.min(10, Math.max(1, result.overallScore || 5)),
      items: (result.items || []).map((item: ReviewItem) => ({
        category: item.category || 'style',
        severity: item.severity || 'info',
        location: item.location,
        issue: item.issue || '',
        suggestion: item.suggestion || '',
      })),
    };

    return c.json(sanitizedResult);
  } catch (error) {
    console.error('Error reviewing article:', error);
    internalError('Failed to review article');
  }
});

// Suggest continuation using Claude
aiHandler.post('/suggest-continuation', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<SuggestContinuationRequest>();
  const {
    title,
    content,
    cursorPosition,
    length = 'medium',
    model = DEFAULT_ANTHROPIC_MODEL,
  } = body;

  if (!title || content === undefined || cursorPosition === undefined) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content === undefined ? { content: 'Required' } : {}),
      ...(cursorPosition === undefined ? { cursorPosition: 'Required' } : {}),
    });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  // Extract context around cursor position
  const contextBefore = content.slice(
    Math.max(0, cursorPosition - 2000),
    cursorPosition
  );
  const contextAfter = content.slice(cursorPosition, cursorPosition + 500);

  const userPrompt = `以下の記事の続きを提案してください。

タイトル: ${title}

カーソル位置より前の文章:
${contextBefore}

[ここに続きを挿入]

カーソル位置より後の文章:
${contextAfter || '（なし）'}`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: buildContinuationSystemPrompt(length),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError('Failed to suggest continuation');
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', textContent.text);
      internalError('Failed to parse continuation response');
    }

    const result = JSON.parse(jsonMatch[0]) as SuggestContinuationResponse;

    // Validate and sanitize the response
    const sanitizedResult: SuggestContinuationResponse = {
      suggestions: (result.suggestions || []).slice(0, 3).map((s) => ({
        text: s.text || '',
        confidence: Math.min(1, Math.max(0, s.confidence || 0.5)),
      })),
    };

    return c.json(sanitizedResult);
  } catch (error) {
    console.error('Error suggesting continuation:', error);
    internalError('Failed to suggest continuation');
  }
});

// Generate article outline using Claude
aiHandler.post('/generate-outline', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<GenerateOutlineRequest>();
  const { title, category, model = DEFAULT_ANTHROPIC_MODEL } = body;

  if (!title?.trim()) {
    validationError('Invalid input', { title: 'Required' });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  const userPrompt = `以下のタイトルの記事のアウトラインを生成してください。

タイトル: ${title.trim()}`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: buildOutlineSystemPrompt(category),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError('Failed to generate outline');
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    const result: GenerateOutlineResponse = {
      outline: textContent.text.trim(),
    };

    return c.json(result);
  } catch (error) {
    console.error('Error generating outline:', error);
    internalError('Failed to generate outline');
  }
});

// Transform text using Claude
aiHandler.post('/transform-text', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<TransformTextRequest>();
  const { text, action, targetLanguage, model = DEFAULT_ANTHROPIC_MODEL } =
    body;

  if (!text?.trim()) {
    validationError('Invalid input', { text: 'Required' });
  }

  if (!action) {
    validationError('Invalid input', { action: 'Required' });
  }

  // Validate action
  const validActions: TransformAction[] = [
    'rewrite',
    'expand',
    'summarize',
    'translate',
    'formal',
    'casual',
  ];
  if (!validActions.includes(action)) {
    validationError('Invalid action', {
      action: `Must be one of: ${validActions.join(', ')}`,
    });
  }

  // Validate model
  if (!VALID_ANTHROPIC_MODELS.includes(model)) {
    validationError('Invalid model', {
      model: `Must be one of: ${VALID_ANTHROPIC_MODELS.join(', ')}`,
    });
  }

  // Truncate text if too long (keep first 10000 chars)
  const truncatedText = text.slice(0, 10000);

  const userPrompt = truncatedText;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: buildTransformSystemPrompt(action, targetLanguage),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      internalError('Failed to transform text');
    }

    const data = await response.json<{
      content: Array<{ type: string; text: string }>;
    }>();

    const textContent = data.content.find((c) => c.type === 'text');
    if (!textContent) {
      internalError('No text response from Claude');
    }

    const result: TransformTextResponse = {
      result: textContent.text.trim(),
    };

    return c.json(result);
  } catch (error) {
    console.error('Error transforming text:', error);
    internalError('Failed to transform text');
  }
});
