import type { Context, Next } from 'hono';
import type { Env } from '../index';

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.slice(7);

  if (token !== c.env.API_KEY) {
    return c.json({ error: 'Unauthorized: Invalid API key' }, 401);
  }

  await next();
}
