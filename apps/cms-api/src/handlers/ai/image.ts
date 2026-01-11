/**
 * Generate header image using Nano Banana (Gemini Image)
 */
import type {
  GenerateImageRequest,
  GenerateImageResponse,
} from '@blog/cms-types';
import { generateId, generateImageId } from '@blog/utils';
import { Hono } from 'hono';
import type { Env } from '../../index';
import { internalError, validationError } from '../../lib/errors';
import { getImageUrl } from '../../lib/image-url';
import {
  DEFAULT_IMAGE_MODEL,
  HEADER_IMAGE_CONFIG,
  NANO_BANANA_MODELS,
} from './_shared';

export const imageHandler = new Hono<{ Bindings: Env }>();

imageHandler.post('/', async (c) => {
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
    const id = generateId();
    const imageId = generateImageId(); // UUIDv4 for unpredictable URL path
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${imageId}.${ext}`;
    const r2Key = `i/${filename}`;

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

    const publicUrl = getImageUrl(c.env, r2Key);

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
