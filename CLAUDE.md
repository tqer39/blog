# CLAUDE.md

[🇯🇵 日本語版](docs/CLAUDE.ja.md)

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Blog Philosophy

### Purpose

- Personal log for future self-reference (not for general audience)
- Public, but value to others is a byproduct
- No SEO optimization, no viral targeting, no general reader optimization

### Target Reader

- Myself, months to years later
- Want to recall: decision rationale, emotions, context at the time
- Need: conclusions and "why I did it" in the shortest path

### Article Categories

| Category | Nature       | Template                                    |
| -------- | ------------ | ------------------------------------------- |
| Tech     | Decision Log | Conclusion → Assumptions → Rejected → Impl  |
| Life/PTA | Experience   | Event → Emotions → Structure → Action Memo  |
| Books    | Thought Log  | Why Read → Impressions → Changes → Note     |

All articles are "for my past self" - complaints are OK, but must end with insights.

### URL Design

- Format: `/articles/{ULID}` (no slugs)
- URL is permanent even if title, category, or content changes
- ULID: 26 characters, time-sortable

### UI Principles

- Design: "Notepad + Index"
- No flashiness, readability is top priority
- Code blocks are collapsible
- 1 scroll = 1 topic

### What We Don't Do

- SEO optimization
- Overly detailed explanations for general readers
- Design assuming SNS virality
- Monitoring reaction counts or access numbers

## Project Overview

Personal blog service monorepo managed with Turborepo + pnpm workspaces.

## Development Commands

### Setup

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `make bootstrap` | Install Homebrew and Brewfile packages           |
| `just setup`     | Setup mise, direnv, and pre-commit hooks         |
| `just deps`      | Install pnpm dependencies                        |
| `just bootstrap` | Full local setup (deps + reset + migrate + seed) |

### Development

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `just dev-all`          | Start all services (API + Blog)  |
| `just dev-api`          | Start CMS API server (port 8787) |
| `just dev-blog`         | Start Blog app (port 3100)       |
| `just kill-port <port>` | Kill process on specified port   |

### Database

| Command           | Description              |
| ----------------- | ------------------------ |
| `just db-reset`   | Reset local D1 database  |
| `just db-migrate` | Run all D1 migrations    |
| `just db-seed`    | Seed sample data         |

### Code Quality

| Command       | Description              |
| ------------- | ------------------------ |
| `just lint`   | Run Biome linter         |
| `just format` | Run Biome formatter      |
| `just check`  | Run Biome check          |
| `prek run -a` | Run all pre-commit hooks |

### Testing

| Command       | Description              |
| ------------- | ------------------------ |
| `just test`   | Run unit tests           |
| `just e2e`    | Run Playwright E2E tests |
| `just e2e-ui` | Run E2E tests with UI    |

### Build

| Command      | Description        |
| ------------ | ------------------ |
| `pnpm build` | Build all packages |

### Terraform

| Command                              | Description                  |
| ------------------------------------ | ---------------------------- |
| `just tf -chdir=prod/bootstrap plan` | Terraform plan for bootstrap |
| `just tf -chdir=prod/main plan`      | Terraform plan for main      |

## Directory Structure

```text
/
├── apps/
│   ├── blog/                  # Next.js blog app (@blog/web)
│   │   ├── src/app/           # App Router pages
│   │   ├── src/components/    # React components
│   │   └── e2e/               # Playwright tests
│   └── cms-api/               # Hono CMS API (@blog/cms-api)
│       ├── src/handlers/      # API handlers
│       └── migrations/        # D1 migrations
├── packages/
│   ├── cms-types/             # Shared TypeScript types
│   ├── ui/                    # Shared UI components
│   ├── config/                # Shared configurations
│   └── utils/                 # Shared utilities
├── infra/terraform/           # Terraform IaC
│   ├── modules/               # Terraform modules
│   └── envs/prod/             # Environment configs
├── docs/                      # Documentation
├── turbo.json                 # Turborepo config
├── pnpm-workspace.yaml        # pnpm workspace config
└── justfile                   # Task runner commands
```

## Package Names

| Directory            | Package Name       | Description             |
| -------------------- | ------------------ | ----------------------- |
| `apps/blog`          | `@blog/web`        | Next.js blog app        |
| `apps/cms-api`       | `@blog/cms-api`    | Hono CMS API            |
| `packages/cms-types` | `@blog/cms-types`  | Shared TypeScript types |
| `packages/ui`        | `@blog/ui`         | Shared UI components    |
| `packages/config`    | `@blog/config`     | Shared configurations   |
| `packages/utils`     | `@blog/utils`      | Shared utilities        |

## Key Technical Decisions

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 15 with App Router
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Styling**: Tailwind CSS with typography plugin
- **Code Highlighting**: Shiki
- **Diagrams**: Mermaid.js
- **Formatter/Linter**: Biome (not ESLint/Prettier)
- **E2E Testing**: Playwright
- **IaC**: Terraform (AWS + CloudFlare + Vercel)

## Deployment

- **Hosting**: Vercel
- **Domain**: blog.tqer39.dev (CloudFlare DNS CNAME to Vercel)
- **CI/CD**: GitHub Actions

## GitHub Secrets Required

### Infrastructure Secrets

| Secret                  | Description             |
| ----------------------- | ----------------------- |
| `NEON_API_KEY`          | Neon Postgres API key   |
| `VERCEL_API_TOKEN`      | Vercel deployment token |
| `CLOUDFLARE_API_TOKEN`  | CloudFlare API token    |
| `CLOUDFLARE_ACCOUNT_ID` | CloudFlare account ID   |
| `CLOUDFLARE_ZONE_ID`    | CloudFlare DNS zone ID  |

### Authentication Secrets

| Secret                       | Description                  |
| ---------------------------- | ---------------------------- |
| `BETTER_AUTH_SECRET_DEV`     | Auth library secret          |
| `TWITTER_CLIENT_ID_DEV`      | Twitter OAuth client ID      |
| `TWITTER_CLIENT_SECRET_DEV`  | Twitter OAuth client secret  |
| `ADMIN_TWITTER_USERNAME_DEV` | Admin Twitter username       |

### Third-party Service Secrets

| Secret               | Description                  |
| -------------------- | ---------------------------- |
| `RESEND_API_KEY_DEV` | Resend email service API key |
| `STRIPE_SECRET_KEY`  | Stripe payment secret key    |
| `SLACK_WEBHOOK_DEV`  | Slack notification webhook   |
| `CODECOV_TOKEN`      | Codecov coverage token       |
| `GEMINI_API_KEY`     | Google Gemini API key        |
| `OPENAI_API_KEY`     | OpenAI API key for PR desc   |

### GitHub App Secrets

| Secret                | Description            |
| --------------------- | ---------------------- |
| `GHA_APP_ID`          | GitHub App ID          |
| `GHA_APP_PRIVATE_KEY` | GitHub App private key |

## Tool Management

- **Homebrew**: System packages (see Brewfile)
- **mise**: Node.js, pnpm, Terraform (see .mise.toml)
- **just**: Task runner (see justfile)
- **prek**: Pre-commit hooks
