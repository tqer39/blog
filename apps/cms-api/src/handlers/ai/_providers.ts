/**
 * Provider abstraction layer for multi-provider AI text generation
 */
import type { TextProvider } from '@blog/cms-types';
import { ANTHROPIC_API_URL, GEMINI_TEXT_MODELS } from './_shared';

export interface TextCompletionRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface TextCompletionResponse {
  text: string;
}

/**
 * Call OpenAI chat completion API
 */
async function callOpenAI(
  apiKey: string,
  req: TextCompletionRequest
): Promise<TextCompletionResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: [
        { role: 'system', content: req.systemPrompt },
        { role: 'user', content: req.userPrompt },
      ],
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 4096,
      ...(req.jsonMode && { response_format: { type: 'json_object' } }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json<{
    choices: Array<{ message: { content: string } }>;
  }>();

  return { text: data.choices[0].message.content };
}

/**
 * Call Anthropic messages API
 */
async function callAnthropic(
  apiKey: string,
  req: TextCompletionRequest
): Promise<TextCompletionResponse> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: req.maxTokens ?? 4096,
      system: req.systemPrompt,
      messages: [{ role: 'user', content: req.userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  const data = await response.json<{
    content: Array<{ type: string; text: string }>;
  }>();

  const textContent = data.content.find((c) => c.type === 'text');
  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  return { text: textContent.text };
}

/**
 * Call Gemini API for text generation
 */
async function callGemini(
  apiKey: string,
  req: TextCompletionRequest
): Promise<TextCompletionResponse> {
  // Map model ID to actual API model name
  const apiModel =
    GEMINI_TEXT_MODELS[req.model as keyof typeof GEMINI_TEXT_MODELS] ||
    req.model;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${req.systemPrompt}\n\n${req.userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: req.temperature ?? 0.7,
          maxOutputTokens: req.maxTokens ?? 4096,
          ...(req.jsonMode && { responseMimeType: 'application/json' }),
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json<{
    candidates: Array<{
      content: {
        parts: Array<{ text?: string }>;
      };
    }>;
  }>();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  const textPart = data.candidates[0].content.parts.find((p) => p.text);
  if (!textPart?.text) {
    throw new Error('No text content in Gemini response');
  }

  return { text: textPart.text };
}

/**
 * Unified function to call any text provider
 */
export async function callTextProvider(
  provider: TextProvider,
  apiKey: string,
  request: TextCompletionRequest
): Promise<TextCompletionResponse> {
  switch (provider) {
    case 'openai':
      return callOpenAI(apiKey, request);
    case 'anthropic':
      return callAnthropic(apiKey, request);
    case 'gemini':
      return callGemini(apiKey, request);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
