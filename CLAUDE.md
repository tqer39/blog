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

- **Directory structure**: See [README.md](README.md)
- **Development commands**: Run `just --list`
- **GitHub Secrets**: See [docs/SECRETS.md](docs/SECRETS.md)

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

## Package Names

| Directory            | Package Name       |
| -------------------- | ------------------ |
| `apps/blog`          | `@blog/web`        |
| `apps/cms-api`       | `@blog/cms-api`    |
| `packages/cms-types` | `@blog/cms-types`  |
| `packages/ui`        | `@blog/ui`         |
| `packages/config`    | `@blog/config`     |
| `packages/utils`     | `@blog/utils`      |

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
- **Secrets**: 1Password + GitHub Secrets

## Deployment

- **Hosting**: Vercel (blog), Cloudflare Workers (cms-api)
- **Domain**: blog.tqer39.dev (CloudFlare DNS)
- **CI/CD**: GitHub Actions

## Tool Management

- **Homebrew**: System packages (see Brewfile)
- **mise**: Node.js, pnpm, Terraform (see .mise.toml)
- **just**: Task runner (see justfile)
- **prek**: Pre-commit hooks
