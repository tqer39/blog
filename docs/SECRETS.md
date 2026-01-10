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

| Secret         | Local     | Dev (staging)      | Prod (production)   |
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

| Secret              | How to Obtain                    |
| ------------------- | -------------------------------- |
| `SLACK_WEBHOOK_DEV` | Slack API > Incoming Webhooks    |
| `SLACK_WEBHOOK_PROD`| Slack API > Incoming Webhooks    |
| `CODECOV_TOKEN`     | Codecov > Repository Settings    |

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
Field is `password` unless noted. Target: G=GitHub, W=Wrangler (staging/production).

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

### Manual Setup: GitHub Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Enter name and value

### Manual Setup: Cloudflare Workers

```bash
cd apps/cms-api

# Set secrets for staging (dev) environment
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
CMS_API_URL=http://localhost:3200/v1
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
