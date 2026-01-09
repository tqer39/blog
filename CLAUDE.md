# CLAUDE.md

[🇯🇵 日本語版](docs/CLAUDE.ja.md)

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Blog Philosophy

### Purpose

- Personal log for future self-reference (not for general audience)
- Public, but value to others is a byproduct
- No viral targeting, no general reader optimization

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

- Content-level SEO (keyword stuffing, clickbait titles)
- Overly detailed explanations for general readers
- Design assuming SNS virality
- Monitoring reaction counts or access numbers

### Technical SEO (Acceptable)

- Structured data (JSON-LD) for proper search engine understanding
- Proper metadata for articles and pages
- Canonical URLs and sitemap maintenance
- robots.txt configuration

## Project Overview

Personal blog service monorepo managed with Turborepo + pnpm workspaces.

## Environment Configuration

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       3-Environment Structure                        │
├───────────────┬───────────────────┬─────────────────────────────────┤
│    Local      │       Dev         │             Prod                │
├───────────────┼───────────────────┼─────────────────────────────────┤
│ localhost     │ blog-dev.tqer39   │ blog.tqer39.dev                 │
│ :3100/:8787   │ .dev              │                                 │
├───────────────┼───────────────────┼─────────────────────────────────┤
│ D1: local     │ blog-cms-dev      │ blog-cms-prod                   │
│ R2: local     │ blog-images-dev   │ blog-images-prod                │
├───────────────┼───────────────────┼─────────────────────────────────┤
│ No Auth       │ Basic Auth        │ No Auth (public)                │
│               │ + API Key         │ + API Key                       │
└───────────────┴───────────────────┴─────────────────────────────────┘
```

### Release Flow

```text
[Development]
  main merge
       ↓
  deploy-cms-api-dev.yml (auto)
  db-migrate-dev.yml (auto)
       ↓
  blog-dev.tqer39.dev

[Production]
  release.yml (manual)
       ↓
  GitHub Release + tag (v1.2.3)
       ↓
  deploy-cms-api-prod.yml (tag trigger)
  db-migrate-prod.yml (tag trigger)
       ↓
  blog.tqer39.dev
```

### Authentication

| Method     | Target          | Environment | Purpose                 |
| ---------- | --------------- | ----------- | ----------------------- |
| Basic Auth | CMS API (all)   | Dev only    | External access control |
| API Key    | CMS API `/v1/*` | All         | API authentication      |
| Password   | Admin UI        | All         | Admin login             |

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

> **Note**: `bootstrap` must be deployed from local for initial setup
> before CI/CD can be used.

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
│   └── envs/
│       ├── dev/               # Dev environment
│       │   ├── cms-api/
│       │   └── frontend/
│       └── prod/              # Prod environment
│           ├── bootstrap/
│           ├── cms-api/
│           └── frontend/
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

### CI/CD Coverage

| Resource         | Terraform | CI/CD Workflow          | Environment |
| ---------------- | --------- | ----------------------- | ----------- |
| D1 Database      | cms-api   | terraform-*.yml         | Per env     |
| R2 Bucket        | cms-api   | terraform-*.yml         | Per env     |
| Worker (cms-api) | -         | deploy-cms-api-*.yml    | Per env     |
| D1 Migration     | -         | db-migrate-*.yml        | Per env     |
| DNS Record       | frontend  | terraform-*.yml         | Per env     |
| Vercel Project   | frontend  | terraform-*.yml         | Per env     |
| Blog App         | -         | Vercel auto-deploy      | Per env     |
| IAM Role         | bootstrap | Local only              | Initial     |

### Workflows

| Workflow                      | Trigger            | Description        |
| ----------------------------- | ------------------ | ------------------ |
| `test-and-build.yml`          | Push/PR to main    | Lint, test, E2E    |
| `terraform-dev.yml`           | envs/dev/** chg    | Dev Terraform      |
| `terraform-prod.yml`          | envs/prod/** chg   | Prod Terraform     |
| `deploy-cms-api-dev.yml`      | main push          | Dev Worker deploy  |
| `deploy-cms-api-prod.yml`     | tag v*.*.*         | Prod Worker deploy |
| `db-migrate-dev.yml`          | main push          | Dev D1 migrations  |
| `db-migrate-prod.yml`         | tag v*.*.*         | Prod D1 migrations |
| `release.yml`                 | manual             | Create release     |
| `generate-pr-description.yml` | PR creation        | OpenAI PR desc     |
| `sync-secrets.yml`            | workflow_dispatch  | 1Password sync     |

## GitHub Secrets Required

### Infrastructure Secrets

| Secret                   | Description                          |
| ------------------------ | ------------------------------------ |
| `VERCEL_API_TOKEN`       | Vercel deployment token              |
| `CLOUDFLARE_API_TOKEN`   | CloudFlare API token                 |
| `CLOUDFLARE_ACCOUNT_ID`  | CloudFlare account ID                |
| `CLOUDFLARE_ZONE_ID`     | CloudFlare DNS zone ID               |
| `D1_DATABASE_ID_DEV`     | D1 database ID (dev environment)     |
| `D1_DATABASE_ID_PROD`    | D1 database ID (prod environment)    |
| `R2_ACCESS_KEY_ID`       | R2 API access key for presigned URLs |
| `R2_SECRET_ACCESS_KEY`   | R2 API secret key for presigned URLs |
| `R2_BUCKET_NAME`         | R2 bucket name for presigned URLs    |

### Dev Environment Secrets

| Secret            | Description                         |
| ----------------- | ----------------------------------- |
| `BASIC_AUTH_USER` | Basic Auth username (dev only)      |
| `BASIC_AUTH_PASS` | Basic Auth password (dev only)      |

### Third-party Service Secrets

| Secret                     | Description                      |
| -------------------------- | -------------------------------- |
| `ANTHROPIC_API_KEY`        | Anthropic API key for AI         |
| `CODECOV_TOKEN`            | Codecov coverage token           |
| `GEMINI_API_KEY`           | Google Gemini API key            |
| `OPENAI_API_KEY`           | OpenAI API key for PR desc       |
| `OP_SERVICE_ACCOUNT_TOKEN` | 1Password Service Account token  |
| `SLACK_WEBHOOK_DEV`        | Slack webhook (dev)              |
| `SLACK_WEBHOOK_PROD`       | Slack webhook (prod)             |

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
- **Claude Code**: AI-assisted development (see CLAUDE.md)
