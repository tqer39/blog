# CLAUDE.md

[🇺🇸 English](../CLAUDE.md)

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際の
ガイダンスを提供します。

## プロジェクト概要

Turborepo + pnpm workspaces で管理された個人ブログサービスのモノレポです。

## 開発コマンド

### セットアップ

| コマンド         | 説明                                              |
| ---------------- | ------------------------------------------------- |
| `make bootstrap` | Homebrew と Brewfile パッケージのインストール     |
| `just setup`     | mise、direnv、pre-commit フックのセットアップ     |
| `just deps`      | pnpm 依存関係のインストール                       |
| `just bootstrap` | フルセットアップ (deps + reset + migrate + seed)  |

### 開発

| コマンド                | 説明                                |
| ----------------------- | ----------------------------------- |
| `just dev-all`          | 全サービス起動（API + Blog）        |
| `just dev-api`          | CMS API サーバー起動（ポート 8787） |
| `just dev-blog`         | Blog アプリ起動（ポート 3100）      |
| `just kill-port <port>` | 指定ポートのプロセスを終了          |

### データベース

| コマンド          | 説明                               |
| ----------------- | ---------------------------------- |
| `just db-reset`   | ローカル D1 データベースをリセット |
| `just db-migrate` | 全 D1 マイグレーションを実行       |
| `just db-seed`    | サンプルデータを投入               |

### コード品質

| コマンド      | 説明                       |
| ------------- | -------------------------- |
| `just lint`   | Biome リンター実行         |
| `just format` | Biome フォーマッター実行   |
| `just check`  | Biome チェック実行         |
| `prek run -a` | 全 pre-commit フック実行   |

### テスト

| コマンド      | 説明                          |
| ------------- | ----------------------------- |
| `just test`   | ユニットテスト実行            |
| `just e2e`    | Playwright E2E テスト実行     |
| `just e2e-ui` | E2E テスト（UI モード）実行   |

### ビルド

| コマンド     | 説明                 |
| ------------ | -------------------- |
| `pnpm build` | 全パッケージをビルド |

### Terraform

| コマンド                            | 説明                        |
| ----------------------------------- | --------------------------- |
| `just tf -chdir=dev/bootstrap plan` | bootstrap の Terraform plan |
| `just tf -chdir=dev/main plan`      | main の Terraform plan      |

## ディレクトリ構造

```text
/
├── apps/
│   ├── blog/                  # Next.js ブログアプリ (@blog/web)
│   │   ├── src/app/           # App Router ページ
│   │   ├── src/components/    # React コンポーネント
│   │   └── e2e/               # Playwright テスト
│   └── cms-api/               # Hono CMS API (@blog/cms-api)
│       ├── src/handlers/      # API ハンドラー
│       └── migrations/        # D1 マイグレーション
├── packages/
│   ├── cms-types/             # 共有 TypeScript 型
│   ├── ui/                    # 共有 UI コンポーネント
│   ├── config/                # 共有設定
│   └── utils/                 # 共有ユーティリティ
├── infra/terraform/           # Terraform IaC
│   ├── modules/               # Terraform モジュール
│   └── envs/dev/              # 環境設定
├── docs/                      # ドキュメント
├── turbo.json                 # Turborepo 設定
├── pnpm-workspace.yaml        # pnpm ワークスペース設定
└── justfile                   # タスクランナーコマンド
```

## パッケージ名

| ディレクトリ         | パッケージ名      | 説明                    |
| -------------------- | ----------------- | ----------------------- |
| `apps/blog`          | `@blog/web`       | Next.js ブログアプリ    |
| `apps/cms-api`       | `@blog/cms-api`   | Hono CMS API            |
| `packages/cms-types` | `@blog/cms-types` | 共有 TypeScript 型      |
| `packages/ui`        | `@blog/ui`        | 共有 UI コンポーネント  |
| `packages/config`    | `@blog/config`    | 共有設定                |
| `packages/utils`     | `@blog/utils`     | 共有ユーティリティ      |

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

## デプロイ

- **ホスティング**: Vercel
- **ドメイン**: blog.tqer39.dev（CloudFlare DNS CNAME で Vercel へ）
- **CI/CD**: GitHub Actions

## 必要な GitHub Secrets

### インフラ Secrets

| Secret                  | 説明                     |
| ----------------------- | ------------------------ |
| `NEON_API_KEY`          | Neon Postgres API キー   |
| `VERCEL_API_TOKEN`      | Vercel デプロイトークン  |
| `CLOUDFLARE_API_TOKEN`  | CloudFlare API トークン  |
| `CLOUDFLARE_ACCOUNT_ID` | CloudFlare アカウント ID |
| `CLOUDFLARE_ZONE_ID`    | CloudFlare DNS ゾーン ID |

### 認証 Secrets

| Secret                       | 説明                                   |
| ---------------------------- | -------------------------------------- |
| `BETTER_AUTH_SECRET_DEV`     | Auth ライブラリシークレット            |
| `TWITTER_CLIENT_ID_DEV`      | Twitter OAuth クライアント ID          |
| `TWITTER_CLIENT_SECRET_DEV`  | Twitter OAuth クライアントシークレット |
| `ADMIN_TWITTER_USERNAME_DEV` | 管理者 Twitter ユーザー名              |

### サードパーティ Secrets

| Secret               | 説明                             |
| -------------------- | -------------------------------- |
| `RESEND_API_KEY_DEV` | Resend メールサービス API キー   |
| `STRIPE_SECRET_KEY`  | Stripe 決済シークレットキー      |
| `SLACK_WEBHOOK_DEV`  | Slack 通知 Webhook               |
| `CODECOV_TOKEN`      | Codecov カバレッジトークン       |
| `GEMINI_API_KEY`     | Google Gemini API キー           |
| `OPENAI_API_KEY`     | OpenAI API キー（PR 説明生成用） |

### GitHub App Secrets

| Secret                | 説明                        |
| --------------------- | --------------------------- |
| `GHA_APP_ID`          | GitHub App ID               |
| `GHA_APP_PRIVATE_KEY` | GitHub App プライベートキー |

## ツール管理

- **Homebrew**: システムパッケージ（Brewfile 参照）
- **mise**: Node.js、pnpm、Terraform（.mise.toml 参照）
- **just**: タスクランナー（justfile 参照）
- **prek**: Pre-commit フック
