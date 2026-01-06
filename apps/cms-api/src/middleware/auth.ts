import type { Context, Next } from 'hono';
import type { Env } from '../index';
import { unauthorized } from '../lib/errors';

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    unauthorized('Missing or invalid token');
  }

  const token = authHeader.slice(7);

  if (token !== c.env.API_KEY) {
    unauthorized('Invalid API key');
  }

  await next();
}
