# Repository Guidelines

## プロジェクト構成とモジュール

- `apps/blog/` は Next.js のブログ本体、`apps/cms-api/` は Hono ベースの CMS API です。
- `packages/` に共有の型・UI・設定・ユーティリティ（例: `packages/utils/`）があります。
- インフラは `infra/`、ドキュメントは `docs/`、自動化は `scripts/` に集約しています。
- テストやカバレッジ出力は `**/__tests__/`、`apps/blog/e2e/`、`coverage/` を参照してください。

## ビルド・テスト・開発コマンド

- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm check` / `pnpm format` は
  Turborepo 経由で全体を実行します。
- `just dev-api` と `just dev-blog` は個別起動。`just dev-all` は同時起動。
  API: `http://localhost:8787`、Blog: `http://localhost:3100`。
- `just bootstrap` は依存導入 + DB リセット/マイグレーション/シードまで
  一括実行します。
- `pnpm test` は Vitest、`pnpm e2e` は E2E（Playwright）を起動します。

## コーディングスタイルと命名

- フォーマットは Biome（2 スペース、シングルクォート、セミコロン、行幅 80）。
  `pnpm format` を優先してください。
- TypeScript を標準とし、共有コードは `packages/*` に置きます。
- テストは `__tests__` 配下、E2E は `apps/blog/e2e/*.spec.ts` の命名に従います。

## テスト指針

- ユニット/統合テストは Vitest、E2E は Playwright を使用します。
- 追加機能は該当モジュールの `__tests__` にテストを追加してください。
- カバレッジ確認は `just test-coverage` を利用します。

## コミット・PR ガイド

- コミットは `feat:` / `fix:` を含む短い要約が多いので、可能な範囲で
  Conventional Commits を踏襲してください（日本語でも可）。
- PR には目的、変更範囲、影響範囲を簡潔に記載し、UI 変更がある場合は
  スクリーンショットを添付してください。
- 依存や設定に触れる場合は、手順や影響（例: `.env` 追加項目）を明記します。

## 設定とセキュリティ

- 主要な環境変数は `.env.example` に記載されています。ローカルは
  `.env.local` を使用してください。
- シークレット同期は `just sync-secrets` 系コマンドを利用します（実行前に
  内容を確認）。
