import type {
  ReviewArticleRequest,
  ReviewArticleResponse,
  ReviewItem,
  SuggestContinuationRequest,
  SuggestContinuationResponse,
} from '@blog/cms-types';
import { generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';
import { internalError, validationError } from '../lib/errors';

export const aiHandler = new Hono<{ Bindings: Env }>();

interface GenerateMetadataRequest {
  title: string;
  content: string;
  existingTags?: string[];
}

interface GenerateMetadataResponse {
  description: string;
  tags: string[];
}

interface GenerateImageRequest {
  prompt: string;
  title?: string;
  model?: 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview';
}

interface GenerateImageResponse {
  id: string;
  url: string;
}

// Nano Banana (Gemini Image) models
const NANO_BANANA_MODELS = {
  'gemini-2.5-flash-image': 'gemini-2.5-flash-image',
  'gemini-3-pro-image-preview': 'gemini-3-pro-image-preview',
} as const;

const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';

// Anthropic API configuration
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

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

const CONTINUATION_SYSTEM_PROMPT = `あなたは日本語の技術ブログ記事の執筆を支援するアシスタントです。
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
      "text": "続きのテキスト（100-300文字程度）",
      "confidence": 0.0から1.0
    }
  ]
}`;

// Generate article metadata (description + tags) using OpenAI
aiHandler.post('/generate-metadata', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    internalError('OpenAI API key not configured');
  }

  const body = await c.req.json<GenerateMetadataRequest>();
  const { title, content, existingTags } = body;

  if (!title || !content) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content ? {} : { content: 'Required' }),
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
        model: 'gpt-4o-mini',
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

  // Create a descriptive prompt for header image
  const imagePrompt = title
    ? `Create a modern, professional blog header image for an article titled "${title}". ${prompt}. Style: clean, minimal, tech-focused illustration with subtle gradients.`
    : `${prompt}. Style: clean, minimal, modern illustration suitable for a blog header.`;

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

    const publicUrl = getPublicUrl(c.env, r2Key);

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

function getPublicUrl(env: Env, r2Key: string): string {
  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL}/${r2Key}`;
  }
  if (env.ENVIRONMENT === 'development') {
    return `http://localhost:8787/v1/images/file/${r2Key}`;
  }
  return `https://cdn.tqer39.dev/${r2Key}`;
}

// Review article using Claude
aiHandler.post('/review-article', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<ReviewArticleRequest>();
  const { title, content } = body;

  if (!title || !content) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content ? {} : { content: 'Required' }),
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
        model: ANTHROPIC_MODEL,
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
  const { title, content, cursorPosition } = body;

  if (!title || content === undefined || cursorPosition === undefined) {
    validationError('Invalid input', {
      ...(title ? {} : { title: 'Required' }),
      ...(content === undefined ? { content: 'Required' } : {}),
      ...(cursorPosition === undefined ? { cursorPosition: 'Required' } : {}),
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
        model: ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: CONTINUATION_SYSTEM_PROMPT,
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
