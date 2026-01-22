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
| R2 Bucket      | local     | blog-assets-dev    | blog-assets-prod    |
| Basic Auth     | -         | BASIC_AUTH_*       | -                   |
| API Key        | .dev.vars | wrangler secret    | wrangler secret     |

## 1Password Structure

Secrets are stored in two vaults:

| Vault            | Item         | Purpose                              |
| ---------------- | ------------ | ------------------------------------ |
| `shared-secrets` | `cloudflare` | Cloudflare-related (custom fields)   |
| `shared-secrets` | `vercel`     | Vercel-related (dev/prod shared)     |
| `blog-secrets`   | Each item    | AI, Auth, Third-party, GitHub App    |

### Field Naming Convention

**shared-secrets/cloudflare:**

- `account-id` → No prefix (shared resources)
- `blog-api-token` → `blog-` prefix (blog-specific)
- Others → `blog-` prefix + `-dev`/`-prod` suffix

**shared-secrets/vercel:**

- `blog-api-token` → dev/prod shared

**blog-secrets:**

- `{item-name}` format (managed per item)

## 1Password Field Configuration

### Cloudflare (op://shared-secrets/cloudflare)

| Field Name                  | Maps To               | Target        |
| --------------------------- | --------------------- | ------------- |
| `blog-api-token`            | CLOUDFLARE_API_TOKEN  | GitHub        |
| `account-id`                | CLOUDFLARE_ACCOUNT_ID | GitHub        |
| `blog-zone-id`              | CLOUDFLARE_ZONE_ID    | GitHub        |
| `blog-d1-database-id-dev`   | D1_DATABASE_ID_DEV    | GitHub        |
| `blog-d1-database-id-prod`  | D1_DATABASE_ID_PROD   | GitHub        |
| `blog-r2-token`             | R2_TOKEN              | Wrangler      |
| `blog-r2-access-key-id`     | R2_ACCESS_KEY_ID      | Wrangler      |
| `blog-r2-secret-access-key` | R2_SECRET_ACCESS_KEY  | Wrangler      |

### Vercel (op://shared-secrets/vercel)

| Field Name       | Maps To          | Target |
| ---------------- | ---------------- | ------ |
| `blog-api-token` | VERCEL_API_TOKEN | GitHub |

#### Vercel Environment Variables (Terraform-managed)

Vercel project environment variables are managed via Terraform, not 1Password sync.
See `infra/terraform/envs/{env}/frontend/main.tf` for configuration.

| Variable             | Source                    | Environments              |
| -------------------- | ------------------------- | ------------------------- |
| CMS_API_URL          | Hardcoded in Terraform    | production, preview, dev  |
| NEXT_PUBLIC_SITE_URL | Hardcoded in Terraform    | production, preview, dev  |
| CMS_API_KEY          | GitHub: CMS_API_KEY_{ENV} | production, preview       |
| ADMIN_PASSWORD_HASH  | GitHub: ADMIN_PASSWORD_HASH_{ENV} | production, preview |
| AUTH_SECRET          | GitHub: AUTH_SECRET_{ENV} | production, preview       |
| BASIC_AUTH_ENABLED   | Hardcoded (dev only)      | production, preview       |
| BASIC_AUTH_USER      | GitHub (dev only)         | production, preview       |
| BASIC_AUTH_PASS      | GitHub (dev only)         | production, preview       |

Note: Basic Auth variables are only used in dev environment.

### OpenAI (op://shared-secrets/openai)

| Field Name        | Maps To        | Target                       |
| ----------------- | -------------- | ---------------------------- |
| `blog-secret-key` | OPENAI_API_KEY | GitHub + Wrangler dev & prod |

### Google AI Studio (op://shared-secrets/google-ai-studio)

| Field Name     | Maps To        | Target              |
| -------------- | -------------- | ------------------- |
| `blog-api-key` | GEMINI_API_KEY | Wrangler dev & prod |

### Anthropic (op://shared-secrets/anthropic)

| Field Name     | Maps To           | Target                       |
| -------------- | ----------------- | ---------------------------- |
| `blog-api-key` | ANTHROPIC_API_KEY | GitHub + Wrangler dev & prod |

### Application (op://blog-secrets)

#### auth-secret (op://blog-secrets/auth-secret)

| Field  | Maps To         | Target        |
| ------ | --------------- | ------------- |
| `dev`  | AUTH_SECRET     | Wrangler dev  |
| `dev`  | AUTH_SECRET_DEV | GitHub        |
| `prod` | AUTH_SECRET     | Wrangler prod |
| `prod` | AUTH_SECRET_PROD| GitHub        |

#### admin-password-hash (op://blog-secrets/admin-password-hash-{env}/hash)

| Item Name                  | Field  | Maps To                  | Target        |
| -------------------------- | ------ | ------------------------ | ------------- |
| `admin-password-hash-dev`  | `hash` | ADMIN_PASSWORD_HASH      | Wrangler dev  |
| `admin-password-hash-dev`  | `hash` | ADMIN_PASSWORD_HASH_DEV  | GitHub        |
| `admin-password-hash-prod` | `hash` | ADMIN_PASSWORD_HASH      | Wrangler prod |
| `admin-password-hash-prod` | `hash` | ADMIN_PASSWORD_HASH_PROD | GitHub        |

#### basic-auth (op://blog-secrets/basic-auth)

| Field      | Maps To         | Target                       |
| ---------- | --------------- | ---------------------------- |
| `username` | BASIC_AUTH_USER | GitHub + Wrangler dev        |
| `password` | BASIC_AUTH_PASS | GitHub + Wrangler dev        |

Note: Basic Auth is used for both CMS API (Wrangler) and Blog Frontend
(Vercel) in dev environment.

### Discord (op://shared-secrets/discord)

| Field Name       | Maps To           | Target |
| ---------------- | ----------------- | ------ |
| `blog-bot-token` | DISCORD_BOT_TOKEN | GitHub |

Note: `DISCORD_WEBHOOK_DEV` and `DISCORD_WEBHOOK_PROD` are managed by Terraform
(`infra/terraform/envs/shared/discord`), not 1Password. The webhook URLs are
synced to GitHub Secrets automatically when `terraform-shared.yml` runs.

### Codecov (op://shared-secrets/codecov)

| Field Name | Maps To       | Target |
| ---------- | ------------- | ------ |
| `blog`     | CODECOV_TOKEN | GitHub |

### CI/CD Testing

| Item Name          | Maps To     | Target | Notes              |
| ------------------ | ----------- | ------ | ------------------ |
| `cms-api-key-test` | CMS_API_KEY | CI     | E2E tests API auth |

## How to Obtain Secrets

### Cloudflare API Token

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use template or create custom token with required permissions

### Discord Webhook URL

1. Open Discord server settings (click server name → "Server Settings")
2. Go to "Integrations" → "Webhooks"
3. Click "New Webhook"
   - Set name (e.g., `blog-notifications`)
   - Select target channel
4. Click "Copy Webhook URL"

URL format: `https://discord.com/api/webhooks/xxxx/yyyy`

### Discord Bot Token (for Terraform)

Required for managing Discord channels and webhooks via Terraform.

#### 1. Create Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** (top right)
3. Enter name (e.g., `blog-terraform`) → **Create**

#### 2. Create Bot

1. Click **Bot** in the left menu
2. Click **Reset Token** to generate a token
3. Copy the displayed token (**shown only once**)
4. Enable under **Privileged Gateway Intents**:
   - **Server Members Intent**
   - **Message Content Intent** (if needed)

#### 3. Configure Bot Permissions

1. Click **OAuth2** → **URL Generator** in the left menu
2. Select under **SCOPES**:
   - `bot`
   - `applications.commands`
3. Select under **BOT PERMISSIONS**:
   - `Manage Channels`
   - `Manage Webhooks`
   - `View Channels`
4. Copy the generated **URL** at the bottom

#### 4. Invite Bot to Server

1. Open the copied URL in a browser
2. Select the target server (`blog`)
3. Click **Authorize**

#### 5. Save Token

```bash
# Save to GitHub Secrets
gh secret set DISCORD_BOT_TOKEN
# Paste the token
```

Reference: [Discord Developer Portal](https://discord.com/developers/applications)

### Vercel API Token

1. Log in to [Vercel Dashboard](https://vercel.com)
2. Click your profile icon (top right) → **Settings**
3. Navigate to **Tokens** in the left sidebar
4. Click **Create**
5. Enter a token name (e.g., `blog-deploy`)
6. Select scope and expiration date
7. Click **Create Token** and copy the value (shown only once)

Reference: [Vercel Tokens Documentation](https://vercel.com/docs/sign-in-with-vercel/tokens)

### OpenAI API Key

1. Sign up or log in at [OpenAI Platform](https://platform.openai.com)
2. Click your profile icon (top right) → **View API keys**
   - Or go directly to: <https://platform.openai.com/api-keys>
3. Click **Create new secret key**
4. Name your key and click **Create secret key**
5. Copy the key immediately (shown only once)

Note: New accounts receive $5 in free credits. Set up billing for continued use.

Reference: [OpenAI API Keys](https://platform.openai.com/api-keys)

### Anthropic API Key

1. Sign up or log in at [Anthropic Console](https://console.anthropic.com)
   - Use Google or email magic link authentication
2. Set up billing under **Settings** (required before creating keys)
3. Navigate to **API Keys** in the left sidebar
4. Click **Create Key**
5. Name your key and copy it immediately (shown only once)

Note: Purchase credits ($5 minimum) to start using the API.

Reference: [Anthropic Console](https://console.anthropic.com)

### Gemini API Key

1. Sign up or log in at [Google AI Studio](https://ai.google.dev/aistudio)
2. Accept Terms of Service (first-time only)
3. Navigate to **API Keys** in the menu
4. Click **Create API Key**
5. Select an existing project or create a new one
6. Copy the generated key

Note: Gemini API is free to start. Each key is linked to a Google Cloud project.

Reference: [Gemini API Key Documentation](https://ai.google.dev/gemini-api/docs/api-key)

### Codecov Token

1. Log in to [Codecov](https://codecov.io) with your GitHub account
2. Select the target repository (`tqer39/blog`)
3. Go to **Settings** tab
4. Copy the **Repository Upload Token** from the General section

Token format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID)

Reference: [Codecov Quick Start](https://docs.codecov.com/docs/quick-start)

### Application Secrets

Generate AUTH_SECRET:

```bash
openssl rand -base64 32
```

Generate ADMIN_PASSWORD_HASH (for admin UI login):

```bash
# Replace 'your-password' with your actual password
cd apps/blog && node -e "require('bcryptjs').hash('your-password', 12).then(console.log)"
```

## Setting Secrets

### Automated Sync from 1Password (Recommended)

#### Initial Setup (One-time)

`OP_SERVICE_ACCOUNT_TOKEN` is the key to access 1Password.
It must be set **manually once** (other secrets can be synced automatically).

1. Create a Service Account in 1Password Web UI
   - [my.1password.com](https://my.1password.com) → Integrations → Service Accounts
   - Grant Read permission to `shared-secrets` and `blog-secrets` vaults
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
op item get anthropic-api-key-dev --vault blog-secrets

# Read a secret value
op read "op://shared-secrets/openai/blog-secret-key"

# Read from shared-secrets/cloudflare
op read "op://shared-secrets/cloudflare/blog-api-token"
```

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
pnpm wrangler secret put BASIC_AUTH_USER --env dev
pnpm wrangler secret put BASIC_AUTH_PASS --env dev

# Set secrets for prod environment
pnpm wrangler secret put OPENAI_API_KEY --env prod
pnpm wrangler secret put GEMINI_API_KEY --env prod
pnpm wrangler secret put ANTHROPIC_API_KEY --env prod
pnpm wrangler secret put AUTH_SECRET --env prod
pnpm wrangler secret put ADMIN_PASSWORD_HASH --env prod
pnpm wrangler secret put R2_ACCESS_KEY_ID --env prod
pnpm wrangler secret put R2_SECRET_ACCESS_KEY --env prod
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
