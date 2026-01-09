# CLAUDE.md

[🇺🇸 English](../CLAUDE.md)

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際の
ガイダンスを提供します。

## ブログの設計思想

### 目的

- あとで読み返す自分のためのログ（一般読者向けではない）
- 公開はしているが、他人への価値は副産物
- バズ狙い・一般読者への最適化は一切しない

### 想定読者

- 数ヶ月〜数年後の自分
- 思い出したいこと：当時の判断理由・感情・文脈
- 必要なもの：結論と「なぜそうしたか」を最短で知る

### 記事カテゴリ

| カテゴリ | 性質     | テンプレート                        |
| -------- | -------- | ----------------------------------- |
| Tech     | 判断ログ | 結論 → 前提 → 却下 → 実装           |
| Life/PTA | 経験ログ | 出来事 → 感情 → 構造 → 行動メモ     |
| Books    | 思考ログ | 読んだ理由 → 印象 → 変化 → メモ     |

すべての記事は「過去の自分へ」。愚痴は OK だが、気づきで締める。

### URL 設計

- 形式：`/articles/{ULID}`（slug は使わない）
- タイトル・カテゴリ・内容を変えても URL は永久固定
- ULID：26 文字、時刻順ソート可能

### UI 方針

- デザイン：「メモ帳 + インデックス」
- 派手さ不要、可読性最優先
- コードブロックは折りたたみ可能
- 1 スクロール = 1 トピック

### やらないこと

- コンテンツレベルの SEO（キーワード詰め込み、釣りタイトル）
- 一般読者向けの丁寧すぎる説明
- SNS 拡散前提の設計
- 反応数・アクセス数の監視

### 技術 SEO（許容）

- 構造化データ（JSON-LD）による検索エンジンへの正確な情報提供
- 記事・ページの適切なメタデータ
- 正規 URL とサイトマップの維持管理
- robots.txt の設定

## プロジェクト概要

Turborepo + pnpm workspaces で管理された個人ブログサービスのモノレポです。

- **ディレクトリ構造**: [README.ja.md](README.ja.md) 参照
- **開発コマンド**: `just --list` を実行
- **GitHub Secrets**: [SECRETS.ja.md](SECRETS.ja.md) 参照

## 環境構成

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         3 環境構成                                   │
├───────────────┬───────────────────┬─────────────────────────────────┤
│    Local      │       Dev         │             Prod                │
├───────────────┼───────────────────┼─────────────────────────────────┤
│ localhost     │ blog-dev.tqer39   │ blog.tqer39.dev                 │
│ :3100/:8787   │ .dev              │                                 │
├───────────────┼───────────────────┼─────────────────────────────────┤
│ D1: local     │ blog-cms-dev      │ blog-cms-prod                   │
│ R2: local     │ blog-images-dev   │ blog-images-prod                │
├───────────────┼───────────────────┼─────────────────────────────────┤
│ 認証なし      │ Basic 認証        │ 認証なし（公開）                │
│               │ + API Key         │ + API Key                       │
└───────────────┴───────────────────┴─────────────────────────────────┘
```

### リリースフロー

```text
[開発]
  main マージ
       ↓
  deploy-cms-api-dev.yml (自動)
  db-migrate-dev.yml (自動)
       ↓
  blog-dev.tqer39.dev

[本番]
  release.yml (手動)
       ↓
  GitHub Release + タグ (v1.2.3)
       ↓
  deploy-cms-api-prod.yml (タグトリガー)
  db-migrate-prod.yml (タグトリガー)
       ↓
  blog.tqer39.dev
```

### 認証方式

| 方式       | 対象            | 環境        | 用途               |
| ---------- | --------------- | ----------- | ------------------ |
| Basic 認証 | CMS API 全体    | Dev のみ    | 外部アクセス制限   |
| API Key    | CMS API `/v1/*` | 全環境      | API 認証           |
| Password   | Admin UI        | 全環境      | 管理者ログイン     |

## パッケージ名

| ディレクトリ         | パッケージ名       |
| -------------------- | ------------------ |
| `apps/blog`          | `@blog/web`        |
| `apps/cms-api`       | `@blog/cms-api`    |
| `packages/cms-types` | `@blog/cms-types`  |
| `packages/ui`        | `@blog/ui`         |
| `packages/config`    | `@blog/config`     |
| `packages/utils`     | `@blog/utils`      |

## 主要な技術選定

- **モノレポ**: Turborepo + pnpm workspaces
- **フロントエンド**: Next.js 15（App Router）
- **バックエンド**: Hono on Cloudflare Workers
- **データベース**: Cloudflare D1（SQLite）
- **ストレージ**: Cloudflare R2
- **スタイリング**: Tailwind CSS（typography プラグイン）
- **コードハイライト**: Shiki
- **ダイアグラム**: Mermaid.js
- **フォーマッター/リンター**: Biome（ESLint/Prettier ではない）
- **E2E テスト**: Playwright
- **IaC**: Terraform（AWS + CloudFlare + Vercel）
- **シークレット管理**: 1Password + GitHub Secrets

## デプロイ

- **ホスティング**: Vercel (blog)、Cloudflare Workers (cms-api)
- **ドメイン**: blog.tqer39.dev（CloudFlare DNS）
- **CI/CD**: GitHub Actions

## ツール管理

- **Homebrew**: システムパッケージ（Brewfile 参照）
- **mise**: Node.js、pnpm、Terraform（.mise.toml 参照）
- **just**: タスクランナー（justfile 参照）
- **prek**: Pre-commit フック
