# Secrets Configuration

[🇯🇵 日本語版](./SECRETS.ja.md)

This document describes how to obtain and configure secrets.

## Overview

| Location           | Purpose            |
| ------------------ | ------------------ |
| GitHub Secrets     | CI/CD workflows    |
| Cloudflare Workers | CMS API runtime    |
| Vercel             | Blog app runtime   |
| Local (.env.local) | Development        |

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

| Secret             | How to Obtain                    |
| ------------------ | -------------------------------- |
| `SLACK_WEBHOOK`    | Slack API > Incoming Webhooks    |
| `CODECOV_TOKEN`    | Codecov > Repository Settings    |

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

### GitHub Secrets

1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Enter name and value

### Cloudflare Workers

```bash
cd apps/cms-api

# Set secrets interactively
pnpm wrangler secret put OPENAI_API_KEY
pnpm wrangler secret put GEMINI_API_KEY
pnpm wrangler secret put ANTHROPIC_API_KEY
pnpm wrangler secret put AUTH_SECRET
pnpm wrangler secret put ADMIN_PASSWORD_HASH
pnpm wrangler secret put R2_ACCESS_KEY_ID
pnpm wrangler secret put R2_SECRET_ACCESS_KEY
pnpm wrangler secret put R2_BUCKET_NAME
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
CMS_API_URL=http://localhost:8787/v1
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
