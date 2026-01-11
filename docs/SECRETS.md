# Secrets Configuration

[🇯🇵 日本語版](./SECRETS.ja.md)

This document describes how to obtain and configure secrets.

## Overview

| Location           | Purpose             |
| ------------------ | ------------------- |
| GitHub Secrets     | CI/CD workflows     |
| Cloudflare Workers | CMS API runtime     |
| Vercel             | Blog app runtime    |
| Local (.dev.vars)  | Local development   |

## Environment-Specific Secrets

| Secret         | Local     | Dev                | Prod                |
| -------------- | --------- | ------------------ | ------------------- |
| D1 Database ID | local     | D1_DATABASE_ID_DEV | D1_DATABASE_ID_PROD |
| R2 Bucket      | local     | blog-images-dev    | blog-images-prod    |
| Basic Auth     | -         | BASIC_AUTH_*       | -                   |
| API Key        | .dev.vars | wrangler secret    | wrangler secret     |

## Required Secrets

### Infrastructure Secrets (GitHub Secrets)

| Secret                  | How to Obtain                               |
| ----------------------- | ------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare Dashboard > API Tokens           |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard > Account ID           |
| `CLOUDFLARE_ZONE_ID`    | Cloudflare Dashboard > Zone > Zone ID       |
| `R2_ACCESS_KEY_ID`      | Cloudflare R2 > Manage R2 API Tokens        |
| `R2_SECRET_ACCESS_KEY`  | R2 API Token (shown on creation)            |
| `R2_BUCKET_NAME`        | Cloudflare R2 > Bucket name                 |
| `VERCEL_API_TOKEN`      | Vercel Settings > Tokens                    |

### AI Service Secrets

| Secret              | How to Obtain    | Where to Set              |
| ------------------- | ---------------- | ------------------------- |
| `OPENAI_API_KEY`    | OpenAI Platform  | Cloudflare Workers+GitHub |
| `GEMINI_API_KEY`    | Google AI Studio | Cloudflare Workers        |
| `ANTHROPIC_API_KEY` | Anthropic Console| Cloudflare Workers        |

### Other Third-party Secrets (GitHub Secrets)

| Secret                 | How to Obtain                 |
| ---------------------- | ----------------------------- |
| `SLACK_WEBHOOK_DEV`    | Slack API > Incoming Webhooks |
| `SLACK_WEBHOOK_PROD`   | Slack API > Incoming Webhooks |
| `DISCORD_WEBHOOK_DEV`  | Discord Server > Webhooks     |
| `DISCORD_WEBHOOK_PROD` | Discord Server > Webhooks     |
| `CODECOV_TOKEN`        | Codecov > Repository Settings |

### GitHub App Secrets (GitHub Secrets)

| Secret                | How to Obtain                            |
| --------------------- | ---------------------------------------- |
| `GHA_APP_ID`          | GitHub > Developer settings > Apps       |
| `GHA_APP_PRIVATE_KEY` | GitHub App > Generate a private key      |

### Application Secrets

| Secret                | How to Generate           | Where to Set        |
| --------------------- | ------------------------- | ------------------- |
| `AUTH_SECRET`         | `openssl rand -base64 32` | Cloudflare + Vercel |
| `ADMIN_PASSWORD_HASH` | bcrypt hash (see below)   | Cloudflare + Vercel |

Generate password hash:

```bash
node -e "require('bcryptjs').hash('password', 12).then(console.log)"
```

### How to Get Discord Webhook URL

1. Open Discord server settings (click server name → "Server Settings")
2. Go to "Integrations" → "Webhooks"
3. Click "New Webhook"
   - Set name (e.g., `blog-notifications`)
   - Select target channel
4. Click "Copy Webhook URL"

URL format: `https://discord.com/api/webhooks/xxxx/yyyy`

### How to Get Vercel API Token

1. Log in to [Vercel Dashboard](https://vercel.com)
2. Click your profile icon (top right) → **Settings**
3. Navigate to **Tokens** in the left sidebar
4. Click **Create**
5. Enter a token name (e.g., `blog-deploy`)
6. Select scope and expiration date
7. Click **Create Token** and copy the value (shown only once)

Reference: [Vercel Tokens Documentation](https://vercel.com/docs/sign-in-with-vercel/tokens)

### How to Get OpenAI API Key

1. Sign up or log in at [OpenAI Platform](https://platform.openai.com)
2. Click your profile icon (top right) → **View API keys**
   - Or go directly to: <https://platform.openai.com/api-keys>
3. Click **Create new secret key**
4. Name your key and click **Create secret key**
5. Copy the key immediately (shown only once)

Note: New accounts receive $5 in free credits. Set up billing for continued use.

Reference: [OpenAI API Keys](https://platform.openai.com/api-keys)

### How to Get Anthropic API Key

1. Sign up or log in at [Anthropic Console](https://console.anthropic.com)
   - Use Google or email magic link authentication
2. Set up billing under **Settings** (required before creating keys)
3. Navigate to **API Keys** in the left sidebar
4. Click **Create Key**
5. Name your key and copy it immediately (shown only once)

Note: Purchase credits ($5 minimum) to start using the API.

Reference: [Anthropic Console](https://console.anthropic.com)

### How to Get Gemini API Key

1. Sign up or log in at [Google AI Studio](https://ai.google.dev/aistudio)
2. Accept Terms of Service (first-time only)
3. Navigate to **API Keys** in the menu
4. Click **Create API Key**
5. Select an existing project or create a new one
6. Copy the generated key

Note: Gemini API is free to start. Each key is linked to a Google Cloud project.

Reference: [Gemini API Key Documentation](https://ai.google.dev/gemini-api/docs/api-key)

## Setting Secrets

### Automated Sync from 1Password (Recommended)

#### Initial Setup (One-time)

`OP_SERVICE_ACCOUNT_TOKEN` is the key to access 1Password.
It must be set **manually once** (other secrets can be synced automatically).

1. Create a Service Account in 1Password Web UI
   - [my.1password.com](https://my.1password.com) → Integrations → Service Accounts
   - Grant Read permission to `blog-secrets` vault
   - Copy the token (`ops_...`)

2. Register in GitHub Secret

   ```bash
   gh secret set OP_SERVICE_ACCOUNT_TOKEN
   # Paste the token
   ```

After this, you can automatically sync other secrets with `sync-secrets.yml`.

#### Option A: GitHub Actions

```bash
# Run workflow
gh workflow run sync-secrets.yml -f target=both

# Or sync targets individually
gh workflow run sync-secrets.yml -f target=github
gh workflow run sync-secrets.yml -f target=wrangler
```

#### Option B: Local Script

Run locally with 1Password CLI:

```bash
# Prerequisites: 1password-cli is installed via Brewfile
op signin                   # Sign in to 1Password

# Sync all secrets
just sync-secrets

# Or sync targets individually
just sync-secrets-github    # GitHub Secrets only
just sync-secrets-wrangler  # Cloudflare Workers only
just sync-secrets-dry-run   # Preview without making changes
```

#### Useful 1Password CLI Commands

```bash
# Sign in to 1Password
op signin

# List vaults
op vault list

# List items in a vault
op item list --vault blog-secrets

# Get item details (to check field names)
op item get openai-api-key --vault blog-secrets

# Read a secret value
op read "op://blog-secrets/openai-api-key/password"
```

#### 1Password Service Account Setup

Create a service account for CI/CD automation:

```bash
# Sign in to 1Password
op signin

# Create service account (interactive)
op service-account create "dev-automation" --vault blog-secrets:read_items

# Or via 1Password web:
# 1. Settings > Developer > Service Accounts
# 2. Create new service account
# 3. Grant access to "blog-secrets" vault
# 4. Copy the token
```

Set the token in GitHub:

```bash
gh secret set OP_SERVICE_ACCOUNT_TOKEN
# Paste the service account token when prompted
```

#### 1Password Vault Setup

Create a vault named `blog-secrets` with the following items.
Field is `password` unless noted. Target: G=GitHub, W=Wrangler (dev/production).

| Item Name | Maps To | Target |
| --------- | ------- | ------ |
| cloudflare-api-token | CLOUDFLARE_API_TOKEN | G |
| cloudflare-account-id | CLOUDFLARE_ACCOUNT_ID | G |
| cloudflare-zone-id | CLOUDFLARE_ZONE_ID | G |
| vercel-api-token | VERCEL_API_TOKEN | G |
| d1-database-id-dev | D1_DATABASE_ID_DEV | G |
| d1-database-id-prod | D1_DATABASE_ID_PROD | G |
| r2-access-key-id | R2_ACCESS_KEY_ID | G+W |
| r2-secret-access-key | R2_SECRET_ACCESS_KEY | G+W |
| r2-bucket-name | R2_BUCKET_NAME | G+W |
| r2-public-url-dev | R2_PUBLIC_URL | W (dev) |
| r2-public-url-prod | R2_PUBLIC_URL | W (production) |
| basic-auth-user | BASIC_AUTH_USER | W (dev) |
| basic-auth-pass | BASIC_AUTH_PASS | W (dev) |
| openai-api-key | OPENAI_API_KEY | G+W |
| gemini-api-key | GEMINI_API_KEY | W |
| anthropic-api-key | ANTHROPIC_API_KEY | G+W |
| auth-secret | AUTH_SECRET | W |
| admin-password-hash | ADMIN_PASSWORD_HASH | W |
| slack-webhook-dev | SLACK_WEBHOOK_DEV | G |
| slack-webhook-prod | SLACK_WEBHOOK_PROD | G |
| discord-webhook-dev | DISCORD_WEBHOOK_DEV | G |
| discord-webhook-prod | DISCORD_WEBHOOK_PROD | G |
| codecov-token | CODECOV_TOKEN | G |
| gha-app-id | GHA_APP_ID | G |
| gha-app-private-key (field: private key) | GHA_APP_PRIVATE_KEY | G |

### Manual Setup: GitHub Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Enter name and value

### Manual Setup: Cloudflare Workers

```bash
cd apps/cms-api

# Set secrets for dev environment
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

# Set secrets for production environment
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

Or via Cloudflare Dashboard:

1. Workers & Pages > your-worker > Settings > Variables and Secrets
2. Click "Add" and select "Secret"

### Vercel

1. Project Settings > Environment Variables
2. Add variables for Production/Preview/Development

### Local Development

Create `apps/blog/.env.local`:

```bash
AUTH_SECRET=your-local-secret
ADMIN_PASSWORD_HASH=$2b$12$...
CMS_API_URL=http://localhost:3101/v1
CMS_API_KEY=dev-api-key
```

Create `apps/cms-api/.dev.vars`:

```bash
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
AUTH_SECRET=your-local-secret
ADMIN_PASSWORD_HASH=$2b$12$...
```
