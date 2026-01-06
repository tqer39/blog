import { generateId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../index';

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
}

interface GenerateImageResponse {
  id: string;
  url: string;
}

// Generate article metadata (description + tags) using OpenAI
aiHandler.post('/generate-metadata', async (c) => {
  const apiKey = c.env.OPENAI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'OpenAI API key not configured' }, 500);
  }

  const body = await c.req.json<GenerateMetadataRequest>();
  const { title, content, existingTags } = body;

  if (!title || !content) {
    return c.json({ error: 'Title and content are required' }, 400);
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
      return c.json({ error: 'Failed to generate metadata' }, 500);
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
    return c.json({ error: 'Failed to generate metadata' }, 500);
  }
});

// Generate header image using Gemini (Imagen)
aiHandler.post('/generate-image', async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Gemini API key not configured' }, 500);
  }

  const body = await c.req.json<GenerateImageRequest>();
  const { prompt, title } = body;

  if (!prompt) {
    return c.json({ error: 'Prompt is required' }, 400);
  }

  // Create a descriptive prompt for header image
  const imagePrompt = title
    ? `Create a modern, professional blog header image for an article titled "${title}". ${prompt}. Style: clean, minimal, tech-focused illustration with subtle gradients.`
    : `${prompt}. Style: clean, minimal, modern illustration suitable for a blog header.`;

  try {
    // Use Gemini's Imagen API for image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
            personGeneration: 'dont_allow',
            safetyFilterLevel: 'block_low_and_above',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return c.json({ error: 'Failed to generate image' }, 500);
    }

    const data = await response.json<{
      predictions: Array<{ bytesBase64Encoded: string; mimeType: string }>;
    }>();

    if (!data.predictions || data.predictions.length === 0) {
      return c.json({ error: 'No image generated' }, 500);
    }

    const prediction = data.predictions[0];
    const imageData = prediction.bytesBase64Encoded;
    const mimeType = prediction.mimeType || 'image/png';

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
    return c.json({ error: 'Failed to generate image' }, 500);
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
