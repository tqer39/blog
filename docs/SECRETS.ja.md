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

| シークレット           | 取得方法                       |
| ---------------------- | ------------------------------ |
| `SLACK_WEBHOOK_DEV`    | Slack API > Incoming Webhooks  |
| `SLACK_WEBHOOK_PROD`   | Slack API > Incoming Webhooks  |
| `DISCORD_WEBHOOK_DEV`  | Discord サーバー > Webhook     |
| `DISCORD_WEBHOOK_PROD` | Discord サーバー > Webhook     |
| `CODECOV_TOKEN`        | Codecov > リポジトリ設定       |

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

### Discord Webhook URL の取得方法

1. Discord サーバー設定を開く（サーバー名クリック →「サーバー設定」）
2. 「連携サービス」→「Webhook」
3. 「新しいウェブフック」をクリック
   - 名前を設定（例: `blog-notifications`）
   - 投稿先チャンネルを選択
4. 「ウェブフックURLをコピー」をクリック

URL 形式: `https://discord.com/api/webhooks/xxxx/yyyy`

### Vercel API Token の取得方法

1. [Vercel Dashboard](https://vercel.com) にログイン
2. 右上のプロフィールアイコン →「Settings」
3. 左メニューの「Tokens」をクリック
4. 「Create」ボタンをクリック
5. トークン名を入力（例: `blog-deploy`）
6. スコープと有効期限を選択
7. 「Create Token」をクリックし、表示された値をコピー（一度しか表示されない）

参考: [Vercel Tokens Documentation](https://vercel.com/docs/sign-in-with-vercel/tokens)

### OpenAI API Key の取得方法

1. [OpenAI Platform](https://platform.openai.com) にサインアップまたはログイン
2. 右上のプロフィールアイコン →「View API keys」
   - または直接: <https://platform.openai.com/api-keys>
3. 「Create new secret key」をクリック
4. キーに名前を付けて「Create secret key」をクリック
5. キーをすぐにコピー（一度しか表示されない）

備考: 新規アカウントには $5 の無料クレジット付与。継続利用には課金設定が必要。

参考: [OpenAI API Keys](https://platform.openai.com/api-keys)

### Anthropic API Key の取得方法

1. [Anthropic Console](https://console.anthropic.com) にサインアップまたはログイン
   - Google または メールのマジックリンク認証を使用
2. 「Settings」で課金設定（キー作成前に必須）
3. 左サイドバーの「API Keys」に移動
4. 「Create Key」をクリック
5. キーに名前を付けてすぐにコピー（一度しか表示されない）

備考: API 利用にはクレジット購入が必要（最低 $5）。

参考: [Anthropic Console](https://console.anthropic.com)

### Gemini API Key の取得方法

1. [Google AI Studio](https://ai.google.dev/aistudio) にサインアップまたはログイン
2. 利用規約に同意（初回のみ）
3. メニューから「API Keys」に移動
4. 「Create API Key」をクリック
5. 既存のプロジェクトを選択するか、新規作成
6. 生成されたキーをコピー

備考: Gemini API は無料で開始可能。各キーは Google Cloud プロジェクトに紐付け。

参考: [Gemini API Key Documentation](https://ai.google.dev/gemini-api/docs/api-key)

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
フィールドは特記なければ `password`。同期先: G=GitHub, Wd=Wrangler dev, Wp=Wrangler production。

**インフラ (GitHub のみ):**

| アイテム名             | 環境変数名             | 同期先 |
| ---------------------- | ---------------------- | ------ |
| cloudflare-api-token   | CLOUDFLARE_API_TOKEN   | G      |
| cloudflare-account-id  | CLOUDFLARE_ACCOUNT_ID  | G      |
| cloudflare-zone-id     | CLOUDFLARE_ZONE_ID     | G      |
| vercel-api-token       | VERCEL_API_TOKEN       | G      |
| d1-database-id-dev     | D1_DATABASE_ID_DEV     | G      |
| d1-database-id-prod    | D1_DATABASE_ID_PROD    | G      |

**R2 ストレージ (環境別):**

| アイテム名                | 環境変数名           | 同期先 |
| ------------------------- | -------------------- | ------ |
| r2-access-key-id-dev      | R2_ACCESS_KEY_ID     | Wd     |
| r2-access-key-id-prod     | R2_ACCESS_KEY_ID     | Wp     |
| r2-secret-access-key-dev  | R2_SECRET_ACCESS_KEY | Wd     |
| r2-secret-access-key-prod | R2_SECRET_ACCESS_KEY | Wp     |
| r2-public-url-dev         | R2_PUBLIC_URL        | Wd     |
| r2-public-url-prod        | R2_PUBLIC_URL        | Wp     |

**AI サービス (環境別):**

| アイテム名             | 環境変数名        | 同期先 |
| ---------------------- | ----------------- | ------ |
| openai-api-key-dev     | OPENAI_API_KEY    | Wd     |
| openai-api-key-prod    | OPENAI_API_KEY    | G+Wp   |
| gemini-api-key-dev     | GEMINI_API_KEY    | Wd     |
| gemini-api-key-prod    | GEMINI_API_KEY    | Wp     |
| anthropic-api-key-dev  | ANTHROPIC_API_KEY | Wd     |
| anthropic-api-key-prod | ANTHROPIC_API_KEY | G+Wp   |

**アプリケーション (環境別):**

| アイテム名               | 環境変数名          | 同期先 |
| ------------------------ | ------------------- | ------ |
| auth-secret-dev          | AUTH_SECRET         | Wd     |
| auth-secret-prod         | AUTH_SECRET         | Wp     |
| admin-password-hash-dev  | ADMIN_PASSWORD_HASH | Wd     |
| admin-password-hash-prod | ADMIN_PASSWORD_HASH | Wp     |
| basic-auth-user          | BASIC_AUTH_USER     | Wd     |
| basic-auth-pass          | BASIC_AUTH_PASS     | Wd     |

**サードパーティ (GitHub のみ):**

| アイテム名               | 環境変数名           | 同期先 |
| ------------------------ | -------------------- | ------ |
| slack-webhook-dev        | SLACK_WEBHOOK_DEV    | G      |
| slack-webhook-prod       | SLACK_WEBHOOK_PROD   | G      |
| discord-webhook-dev      | DISCORD_WEBHOOK_DEV  | G      |
| discord-webhook-prod     | DISCORD_WEBHOOK_PROD | G      |
| codecov-token            | CODECOV_TOKEN        | G      |
| gha-app-id               | GHA_APP_ID           | G      |
| gha-app-private-key [^1] | GHA_APP_PRIVATE_KEY  | G      |

**CI/CD テスト:**

| アイテム名       | 環境変数名    | 同期先 | 備考                  |
| ---------------- | ------------- | ------ | --------------------- |
| cms-api-key-test | CMS_API_KEY   | CI     | E2E テスト用 API 認証 |

[^1]: フィールド名は `password` ではなく `private key` を使用。

### 手動設定: GitHub Secrets

1. リポジトリの Settings > Secrets and variables > Actions
2. 「New repository secret」をクリック
3. 名前と値を入力

### 手動設定: Cloudflare Workers

```bash
cd apps/cms-api

# dev 環境のシークレット設定
pnpm wrangler secret put OPENAI_API_KEY --env dev
pnpm wrangler secret put GEMINI_API_KEY --env dev
pnpm wrangler secret put ANTHROPIC_API_KEY --env dev
pnpm wrangler secret put AUTH_SECRET --env dev
pnpm wrangler secret put ADMIN_PASSWORD_HASH --env dev
pnpm wrangler secret put R2_ACCESS_KEY_ID --env dev
pnpm wrangler secret put R2_SECRET_ACCESS_KEY --env dev
pnpm wrangler secret put R2_BUCKET_NAME --env dev
pnpm wrangler secret put R2_PUBLIC_URL --env dev
pnpm wrangler secret put BASIC_AUTH_USER --env dev
pnpm wrangler secret put BASIC_AUTH_PASS --env dev

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
CMS_API_URL=http://localhost:3101/v1
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
