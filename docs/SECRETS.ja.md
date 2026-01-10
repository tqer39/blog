# シークレット設定ガイド

[🇺🇸 English](./SECRETS.md)

このドキュメントでは、シークレットの取得方法と設定場所を説明します。

## 概要

| 設定場所             | 用途               |
| -------------------- | ------------------ |
| GitHub Secrets       | CI/CD ワークフロー |
| Cloudflare Workers   | CMS API ランタイム |
| Vercel               | ブログアプリ       |
| ローカル (.dev.vars) | ローカル開発       |

## 環境別シークレット

| シークレット   | Local     | Dev            | Prod             |
| -------------- | --------- | -------------- | ---------------- |
| D1 Database ID | local     | _DEV           | _PROD            |
| R2 Bucket      | local     | blog-images-*  | blog-images-*    |
| Basic Auth     | -         | BASIC_AUTH_*   | -                |
| API Key        | .dev.vars | wrangler       | wrangler         |

## 必要なシークレット

### インフラ関連 (GitHub Secrets)

| シークレット            | 取得方法                                |
| ----------------------- | --------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare Dashboard > API Tokens       |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard > Account ID       |
| `CLOUDFLARE_ZONE_ID`    | Cloudflare Dashboard > Zone > Zone ID   |
| `R2_ACCESS_KEY_ID`      | Cloudflare R2 > Manage R2 API Tokens    |
| `R2_SECRET_ACCESS_KEY`  | R2 API Token（作成時に表示）            |
| `R2_BUCKET_NAME`        | Cloudflare R2 > バケット名              |
| `VERCEL_API_TOKEN`      | Vercel Settings > Tokens                |

### AI サービス関連

| シークレット        | 取得方法         | 設定場所                |
| ------------------- | ---------------- | ----------------------- |
| `OPENAI_API_KEY`    | OpenAI Platform  | Cloudflare+GitHub       |
| `GEMINI_API_KEY`    | Google AI Studio | Cloudflare Workers      |
| `ANTHROPIC_API_KEY` | Anthropic Console| Cloudflare Workers      |

### その他サードパーティ (GitHub Secrets)

| シークレット         | 取得方法                      |
| -------------------- | ----------------------------- |
| `SLACK_WEBHOOK_DEV`  | Slack API > Incoming Webhooks |
| `SLACK_WEBHOOK_PROD` | Slack API > Incoming Webhooks |
| `CODECOV_TOKEN`      | Codecov > リポジトリ設定      |

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

### 1Password からの自動同期（推奨）

#### 初回セットアップ（1回のみ）

`OP_SERVICE_ACCOUNT_TOKEN` は 1Password にアクセスするための鍵なので、
**手動で1回だけ**設定が必要です（他のシークレットは自動同期可能）。

1. 1Password Web UI で Service Account を作成
   - [my.1password.com](https://my.1password.com) → Integrations → Service Accounts
   - `blog-secrets` vault への Read 権限を付与
   - トークン（`ops_...`）をコピー

2. GitHub Secret に登録

   ```bash
   gh secret set OP_SERVICE_ACCOUNT_TOKEN
   # トークンを貼り付け
   ```

これ以降は `sync-secrets.yml` で他のシークレットを自動同期できます。

#### 方法 A: GitHub Actions

```bash
# ワークフロー実行
gh workflow run sync-secrets.yml -f target=both

# または個別に同期
gh workflow run sync-secrets.yml -f target=github
gh workflow run sync-secrets.yml -f target=wrangler
```

#### 方法 B: ローカルスクリプト

1Password CLI を使ってローカルで実行:

```bash
# 前提条件: 1password-cli は Brewfile でインストール済み
op signin                   # 1Password にサインイン

# 全シークレットを同期
just sync-secrets

# または個別に同期
just sync-secrets-github    # GitHub Secrets のみ
just sync-secrets-wrangler  # Cloudflare Workers のみ
just sync-secrets-dry-run   # 変更せずプレビュー
```

#### 便利な 1Password CLI コマンド

```bash
# 1Password にサインイン
op signin

# Vault 一覧
op vault list

# Vault 内のアイテム一覧
op item list --vault blog-secrets

# アイテム詳細（フィールド名を確認）
op item get openai-api-key --vault blog-secrets

# シークレット値を取得
op read "op://blog-secrets/openai-api-key/password"
```

#### 1Password Service Account の作成

CI/CD 自動化用のサービスアカウントを作成:

```bash
# 1Password にサインイン
op signin

# サービスアカウント作成（対話形式）
op service-account create "dev-automation" --vault blog-secrets:read_items

# または 1Password Web から:
# 1. Settings > Developer > Service Accounts
# 2. 新しいサービスアカウントを作成
# 3. "blog-secrets" vault へのアクセス権を付与
# 4. トークンをコピー
```

GitHub にトークンを設定:

```bash
gh secret set OP_SERVICE_ACCOUNT_TOKEN
# プロンプトでサービスアカウントトークンを貼り付け
```

#### 1Password Vault の設定

`blog-secrets` vault を作成し、以下のアイテムを登録。
フィールドは特記なければ `password`。同期先: G=GitHub, W=Wrangler (staging/production)。

| アイテム名 | 環境変数名 | 同期先 |
| ---------- | ---------- | ------ |
| cloudflare-api-token | CLOUDFLARE_API_TOKEN | G |
| cloudflare-account-id | CLOUDFLARE_ACCOUNT_ID | G |
| cloudflare-zone-id | CLOUDFLARE_ZONE_ID | G |
| vercel-api-token | VERCEL_API_TOKEN | G |
| d1-database-id-dev | D1_DATABASE_ID_DEV | G |
| d1-database-id-prod | D1_DATABASE_ID_PROD | G |
| r2-access-key-id | R2_ACCESS_KEY_ID | G+W |
| r2-secret-access-key | R2_SECRET_ACCESS_KEY | G+W |
| r2-bucket-name | R2_BUCKET_NAME | G+W |
| r2-public-url-dev | R2_PUBLIC_URL | W (staging) |
| r2-public-url-prod | R2_PUBLIC_URL | W (production) |
| basic-auth-user | BASIC_AUTH_USER | W (staging) |
| basic-auth-pass | BASIC_AUTH_PASS | W (staging) |
| openai-api-key | OPENAI_API_KEY | G+W |
| gemini-api-key | GEMINI_API_KEY | W |
| anthropic-api-key | ANTHROPIC_API_KEY | G+W |
| auth-secret | AUTH_SECRET | W |
| admin-password-hash | ADMIN_PASSWORD_HASH | W |
| slack-webhook-dev | SLACK_WEBHOOK_DEV | G |
| slack-webhook-prod | SLACK_WEBHOOK_PROD | G |
| codecov-token | CODECOV_TOKEN | G |
| gha-app-id | GHA_APP_ID | G |
| gha-app-private-key (field: private key) | GHA_APP_PRIVATE_KEY | G |

### 手動設定: GitHub Secrets

1. リポジトリの Settings > Secrets and variables > Actions
2. 「New repository secret」をクリック
3. 名前と値を入力

### 手動設定: Cloudflare Workers

```bash
cd apps/cms-api

# staging (dev) 環境のシークレット設定
pnpm wrangler secret put OPENAI_API_KEY --env staging
pnpm wrangler secret put GEMINI_API_KEY --env staging
pnpm wrangler secret put ANTHROPIC_API_KEY --env staging
pnpm wrangler secret put AUTH_SECRET --env staging
pnpm wrangler secret put ADMIN_PASSWORD_HASH --env staging
pnpm wrangler secret put R2_ACCESS_KEY_ID --env staging
pnpm wrangler secret put R2_SECRET_ACCESS_KEY --env staging
pnpm wrangler secret put R2_BUCKET_NAME --env staging
pnpm wrangler secret put R2_PUBLIC_URL --env staging
pnpm wrangler secret put BASIC_AUTH_USER --env staging
pnpm wrangler secret put BASIC_AUTH_PASS --env staging

# production 環境のシークレット設定
pnpm wrangler secret put OPENAI_API_KEY
pnpm wrangler secret put GEMINI_API_KEY
pnpm wrangler secret put ANTHROPIC_API_KEY
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put ADMIN_PASSWORD_HASH
pnpm wrangler secret put R2_ACCESS_KEY_ID
pnpm wrangler secret put R2_SECRET_ACCESS_KEY
pnpm wrangler secret put R2_BUCKET_NAME
pnpm wrangler secret put R2_PUBLIC_URL
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
CMS_API_URL=http://localhost:3200/v1
CMS_API_KEY=dev-api-key
```

`apps/cms-api/.dev.vars` を作成:

```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
AUTH_SECRET=your-local-secret
ADMIN_PASSWORD_HASH=$2b$12$...
```
