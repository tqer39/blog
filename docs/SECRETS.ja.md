# シークレット設定ガイド

[English](SECRETS.md)

このドキュメントでは、シークレットの取得方法と設定場所を説明します。

## 概要

| 設定場所           | 用途               |
| ------------------ | ------------------ |
| GitHub Secrets     | CI/CD ワークフロー |
| Cloudflare Workers | CMS API ランタイム |
| Vercel             | ブログアプリ       |
| ローカル           | 開発環境           |

## 必要なシークレット

### インフラ関連 (GitHub Secrets)

| シークレット            | 取得方法                                |
| ----------------------- | --------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare Dashboard > API Tokens       |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard > Account ID       |
| `CLOUDFLARE_ZONE_ID`    | Cloudflare Dashboard > Zone > Zone ID   |
| `VERCEL_API_TOKEN`      | Vercel Settings > Tokens                |

### AI サービス関連

| シークレット     | 取得方法         | 設定場所                 |
| ---------------- | ---------------- | ------------------------ |
| `OPENAI_API_KEY` | OpenAI Platform  | Cloudflare + GitHub      |
| `GEMINI_API_KEY` | Google AI Studio | Cloudflare Workers       |

### その他サードパーティ (GitHub Secrets)

| シークレット        | 取得方法                      |
| ------------------- | ----------------------------- |
| `SLACK_WEBHOOK_DEV` | Slack API > Incoming Webhooks |
| `CODECOV_TOKEN`     | Codecov > リポジトリ設定      |

### GitHub App 関連 (GitHub Secrets)

| シークレット          | 取得方法                         |
| --------------------- | -------------------------------- |
| `GHA_APP_ID`          | GitHub > Developer settings      |
| `GHA_APP_PRIVATE_KEY` | GitHub App > Private key 生成    |

### アプリケーション関連

| シークレット          | 生成方法                    | 設定場所              |
| --------------------- | --------------------------- | --------------------- |
| `AUTH_SECRET`         | `openssl rand -base64 32`   | Cloudflare + Vercel   |
| `ADMIN_PASSWORD_HASH` | bcrypt ハッシュ（下記参照） | Cloudflare + Vercel   |

パスワードハッシュの生成:

```bash
node -e "require('bcryptjs').hash('password', 12).then(console.log)"
```

## シークレットの設定方法

### GitHub Secrets

1. リポジトリの Settings > Secrets and variables > Actions
2. 「New repository secret」をクリック
3. 名前と値を入力

### Cloudflare Workers

```bash
cd apps/cms-api

# 対話形式でシークレットを設定
pnpm wrangler secret put OPENAI_API_KEY
pnpm wrangler secret put GEMINI_API_KEY
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put ADMIN_PASSWORD_HASH
```

または Cloudflare Dashboard から:

1. Workers & Pages > ワーカー名 > Settings > Variables
2. 「Add」をクリックし「Secret」を選択

### Vercel

1. Project Settings > Environment Variables
2. Production/Preview/Development 用に変数を追加

### ローカル開発

`apps/blog/.env.local` を作成:

```bash
AUTH_SECRET=your-local-secret
ADMIN_PASSWORD_HASH=$2b$12$...
CMS_API_URL=http://localhost:8787/v1
CMS_API_KEY=dev-api-key
```

`apps/cms-api/.dev.vars` を作成:

```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
AUTH_SECRET=your-local-secret
ADMIN_PASSWORD_HASH=$2b$12$...
```
