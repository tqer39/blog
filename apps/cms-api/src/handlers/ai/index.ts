/**
 * AI handlers - main router
 *
 * Endpoints:
 * - POST /generate-metadata - Generate article metadata using OpenAI
 * - POST /generate-image - Generate header image using Gemini
 * - POST /review-article - Review article using Claude
 * - POST /suggest-continuation - Suggest continuation using Claude
 * - POST /generate-outline - Generate article outline using Claude
 * - POST /transform-text - Transform text using Claude
 */
import { Hono } from 'hono';
import type { Env } from '../../index';
import { continuationHandler } from './continuation';
import { imageHandler } from './image';
import { metadataHandler } from './metadata';
import { outlineHandler } from './outline';
import { reviewHandler } from './review';
import { transformHandler } from './transform';

export const aiHandler = new Hono<{ Bindings: Env }>();

// Mount handlers
aiHandler.route('/generate-metadata', metadataHandler);
aiHandler.route('/generate-image', imageHandler);
aiHandler.route('/review-article', reviewHandler);
aiHandler.route('/suggest-continuation', continuationHandler);
aiHandler.route('/generate-outline', outlineHandler);
aiHandler.route('/transform-text', transformHandler);
