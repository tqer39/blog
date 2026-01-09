# Repository Guidelines

This file provides guidance to AI coding agents working with this repository.

## Project Overview

Personal blog monorepo with Turborepo + pnpm workspaces.

| App/Package          | Description                 | Port  |
| -------------------- | --------------------------- | ----- |
| `apps/blog`          | Next.js 15 blog frontend    | 3100  |
| `apps/cms-api`       | Hono CMS API on CF Workers  | 8787  |
| `packages/cms-types` | Shared TypeScript types     | -     |
| `packages/ui`        | Shared UI components        | -     |
| `packages/utils`     | Shared utilities            | -     |

## Key Technical Decisions

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Next.js 15 with App Router
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Formatter/Linter**: Biome (not ESLint/Prettier)
- **Testing**: Vitest (unit), Playwright (E2E)

## Directory Structure

```text
apps/
  blog/src/app/           # Next.js App Router pages
  blog/src/components/    # React components
  blog/e2e/               # Playwright E2E tests
  cms-api/src/handlers/   # Hono API handlers
  cms-api/migrations/     # D1 SQL migrations
packages/
  cms-types/              # Shared types
  ui/                     # Shared components
  utils/                  # Shared utilities
infra/terraform/          # Terraform IaC
docs/                     # Documentation
```

## Essential Commands

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `just dev-all`    | Start all services (API + Blog)          |
| `just dev-api`    | Start CMS API only (port 8787)           |
| `just dev-blog`   | Start Blog only (port 3100)              |
| `just bootstrap`  | Full setup: deps, reset, migrate, seed   |
| `just db-migrate` | Run D1 migrations                        |
| `just test`       | Run Vitest unit tests                    |
| `just e2e`        | Run Playwright E2E tests                 |
| `pnpm build`      | Build all packages                       |
| `just lint`       | Run Biome linter                         |
| `just format`     | Run Biome formatter                      |

## Coding Style

- **Formatter**: Biome (2 spaces, single quotes, semicolons, 80 char width)
- **Language**: TypeScript throughout
- **Tests**: `__tests__/` directories, E2E in `apps/blog/e2e/*.spec.ts`

## Commit Guidelines

- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- Japanese commit messages are acceptable
- PRs should include: purpose, scope, and impact

## URL Design

- Article URLs: `/articles/{ULID}` (no slugs)
- ULID: 26 characters, time-sortable, permanent

## Environment Variables

- Local config: `.env.local`
- Reference: `.env.example`
- Secrets sync: `just sync-secrets` commands
