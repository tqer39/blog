/**
 * Review article using Claude
 */
import type {
  ReviewArticleRequest,
  ReviewArticleResponse,
  ReviewItem,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { internalError, validationError } from '../../lib/errors';
import {
  ANTHROPIC_API_URL,
  DEFAULT_ANTHROPIC_MODEL,
  REVIEW_SYSTEM_PROMPT,
  VALID_ANTHROPIC_MODELS,
} from './_shared';

export const reviewHandler = new Hono<{ Bindings: Env }>();

reviewHandler.post('/', async (c) => {
  const apiKey = c.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    internalError('Anthropic API key not configured');
  }

  const body = await c.req.json<ReviewArticleRequest>();
  const { title, content, model = DEFAULT_ANTHROPIC_MODEL, articleHash } = body;

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

    // Save review result to database if articleHash is provided
    if (articleHash) {
      const now = new Date().toISOString();
      await c.env.DB.prepare(
        'UPDATE articles SET review_result = ?, review_updated_at = ? WHERE hash = ?'
      )
        .bind(JSON.stringify(sanitizedResult), now, articleHash)
        .run();
    }

    return c.json(sanitizedResult);
  } catch (error) {
    console.error('Error reviewing article:', error);
    internalError('Failed to review article');
  }
});
