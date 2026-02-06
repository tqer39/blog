import { generateId } from '@blog/utils';
import type { Context } from 'hono';
import type { Env } from '../index';
import { notFound, throwIfUniqueConstraint, validationError } from './errors';

/**
 * CRUD ハンドラファクトリの設定。
 *
 * @template TInput - 作成/更新時の入力型
 * @template TRow - DBから取得する行の型
 * @template TOutput - API応答の出力型
 * @template TListRow - 一覧取得時の行の型 (集計を含む場合がある)
 * @template TListOutput - 一覧取得時の出力型
 */
export interface CrudFactoryConfig<
  TInput,
  TRow,
  TOutput,
  TListRow = TRow,
  TListOutput = TOutput,
> {
  /** テーブル名 */
  tableName: string;
  /** リソース名 (エラーメッセージ用、例: "Tag", "Category") */
  resourceName: string;
  /** 一覧レスポンスのキー名 (例: "tags", "categories") */
  listKey: string;
  /** 一覧取得SQLクエリ (JOINや集計を含む) */
  listQuery: string;
  /** 一覧行から出力型へのマッパー */
  mapListRow: (row: TListRow) => TListOutput;
  /** 単一行から出力型へのマッパー */
  mapRow: (row: TRow) => TOutput;
  /** 入力バリデーション。エラー時はフィールドエラーのオブジェクトを返す */
  validateInput: (input: TInput) => Record<string, string> | null;
  /** INSERT文とバインド値を生成 */
  buildInsert: (
    id: string,
    input: TInput
  ) => {
    sql: string;
    bindings: unknown[];
  };
  /** UPDATE文とバインド値を生成 */
  buildUpdate: (
    id: string,
    input: TInput,
    existing: TRow
  ) => {
    sql: string;
    bindings: unknown[];
  };
  /** ユニーク制約違反時のエラーメッセージ */
  uniqueConflictMessage: string;
  /** ページネーション対応のための総件数取得SQLクエリ (省略時は listQuery を COUNT に変換) */
  countQuery?: string;
  /** ページネーションのデフォルト件数 */
  defaultPerPage?: number;
}

/**
 * CRUD ハンドラの型定義。
 */
export interface CrudHandlers {
  list: (c: Context<{ Bindings: Env }>) => Promise<Response>;
  getById: (c: Context<{ Bindings: Env }>) => Promise<Response>;
  create: (c: Context<{ Bindings: Env }>) => Promise<Response>;
  update: (c: Context<{ Bindings: Env }>) => Promise<Response>;
  delete: (c: Context<{ Bindings: Env }>) => Promise<Response>;
}

/**
 * 標準的なCRUDハンドラを生成するファクトリ関数。
 *
 * tags.ts や categories.ts の共通パターンを抽象化し、
 * 設定オブジェクトから5つのハンドラ (list, getById, create, update, delete) を生成する。
 *
 * @example
 * const handlers = createCrudHandlers<TagInput, TagRow, Tag>({
 *   tableName: 'tags',
 *   resourceName: 'Tag',
 *   listKey: 'tags',
 *   listQuery: `SELECT t.*, COUNT(...) FROM tags t ...`,
 *   mapListRow: mapRowToTagWithCount,
 *   mapRow: mapRowToTag,
 *   validateInput: (input) => input.name ? null : { name: 'Required' },
 *   buildInsert: (id, input) => ({
 *     sql: 'INSERT INTO tags (id, name) VALUES (?, ?)',
 *     bindings: [id, input.name],
 *   }),
 *   buildUpdate: (id, input) => ({
 *     sql: 'UPDATE tags SET name = ? WHERE id = ?',
 *     bindings: [input.name, id],
 *   }),
 *   uniqueConflictMessage: 'Tag with this name already exists',
 * });
 *
 * tagsHandler.get('/', handlers.list);
 * tagsHandler.get('/:id', handlers.getById);
 * tagsHandler.post('/', handlers.create);
 * tagsHandler.put('/:id', handlers.update);
 * tagsHandler.delete('/:id', handlers.delete);
 */
export function createCrudHandlers<
  TInput,
  TRow,
  TOutput,
  TListRow = TRow,
  TListOutput = TOutput,
>(
  config: CrudFactoryConfig<TInput, TRow, TOutput, TListRow, TListOutput>
): CrudHandlers {
  const {
    tableName,
    resourceName,
    listKey,
    listQuery,
    mapListRow,
    mapRow,
    validateInput,
    buildInsert,
    buildUpdate,
    uniqueConflictMessage,
    countQuery,
    defaultPerPage = 50,
  } = config;

  return {
    async list(c) {
      const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
      const perPage = Math.max(
        1,
        Math.min(
          200,
          parseInt(c.req.query('perPage') || String(defaultPerPage), 10)
        )
      );
      const offset = (page - 1) * perPage;

      // 総件数取得
      const finalCountQuery =
        countQuery || `SELECT COUNT(*) as total FROM ${tableName}`;
      const countResult = await c.env.DB.prepare(finalCountQuery).first<{
        total: number;
      }>();
      const total = countResult?.total || 0;
      const totalPages = Math.ceil(total / perPage);

      // データ取得（LIMIT/OFFSET追加）
      const paginatedQuery = `${listQuery} LIMIT ? OFFSET ?`;
      const { results } = await c.env.DB.prepare(paginatedQuery)
        .bind(perPage, offset)
        .all();
      const items = (results || []).map((row) => mapListRow(row as TListRow));

      return c.json({
        [listKey]: items,
        pagination: { page, perPage, total, totalPages },
      });
    },

    async getById(c) {
      const id = c.req.param('id');
      const row = await c.env.DB.prepare(
        `SELECT * FROM ${tableName} WHERE id = ?`
      )
        .bind(id)
        .first();

      if (!row) {
        notFound(`${resourceName} not found`);
      }

      return c.json(mapRow(row as TRow));
    },

    async create(c) {
      const input = await c.req.json<TInput>();
      const errors = validateInput(input);

      if (errors) {
        validationError('Invalid input', errors);
      }

      const id = generateId();
      const { sql, bindings } = buildInsert(id, input);

      try {
        await c.env.DB.prepare(sql)
          .bind(...bindings)
          .run();

        const row = await c.env.DB.prepare(
          `SELECT * FROM ${tableName} WHERE id = ?`
        )
          .bind(id)
          .first();

        return c.json(mapRow(row as TRow), 201);
      } catch (error) {
        throwIfUniqueConstraint(error, uniqueConflictMessage);
      }
    },

    async update(c) {
      const id = c.req.param('id');
      const input = await c.req.json<TInput>();
      const errors = validateInput(input);

      if (errors) {
        validationError('Invalid input', errors);
      }

      const existing = await c.env.DB.prepare(
        `SELECT * FROM ${tableName} WHERE id = ?`
      )
        .bind(id)
        .first();

      if (!existing) {
        notFound(`${resourceName} not found`);
      }

      const { sql, bindings } = buildUpdate(id, input, existing as TRow);

      try {
        await c.env.DB.prepare(sql)
          .bind(...bindings)
          .run();

        const row = await c.env.DB.prepare(
          `SELECT * FROM ${tableName} WHERE id = ?`
        )
          .bind(id)
          .first();

        return c.json(mapRow(row as TRow));
      } catch (error) {
        throwIfUniqueConstraint(error, uniqueConflictMessage);
      }
    },

    async delete(c) {
      const id = c.req.param('id');

      const result = await c.env.DB.prepare(
        `DELETE FROM ${tableName} WHERE id = ?`
      )
        .bind(id)
        .run();

      if (result.meta.changes === 0) {
        notFound(`${resourceName} not found`);
      }

      return c.json({ success: true });
    },
  };
}
