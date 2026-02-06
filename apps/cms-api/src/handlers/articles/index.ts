import { Hono } from 'hono';
import type { Env } from '../../index';
import { createHandler } from './create';
import { deleteHandler } from './delete';
import { getHandler } from './get';
import { listHandler } from './list';
import { publishHandler } from './publish';
import { updateHandler } from './update';

export const articlesHandler = new Hono<{ Bindings: Env }>();

// Mount all handlers
articlesHandler.route('/', listHandler);
articlesHandler.route('/', createHandler);
articlesHandler.route('/', getHandler);
articlesHandler.route('/', updateHandler);
articlesHandler.route('/', deleteHandler);
articlesHandler.route('/', publishHandler);
