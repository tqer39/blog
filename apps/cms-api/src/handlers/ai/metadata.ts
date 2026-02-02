/**
 * Generate article metadata (description + tags) using OpenAI
 */
import type {
  GenerateMetadataRequest,
  GenerateMetadataResponse,
} from '@blog/cms-types';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { getOpenAIApiKey } from '../../lib/api-keys';
import { internalError, validationError } from '../../lib/errors';
import { DEFAULT_OPENAI_MODEL, VALID_OPENAI_MODELS } from './_shared';

export const metadataHandler = new Hono<{ Bindings: Env }>();

metadataHandler.post('/', async (c) => {
  const apiKey = await getOpenAIApiKey(c.env);
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
