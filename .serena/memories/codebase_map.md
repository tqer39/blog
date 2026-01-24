# Codebase Map

## Monorepo Structure

```text
blog/
├── apps/
│   ├── blog/          # Next.js 15 frontend (localhost:3100)
│   ├── cms-api/       # Hono API on Cloudflare Workers (localhost:3101)
│   └── docs/          # VitePress documentation
├── packages/
│   ├── cms-types/     # Shared TypeScript types (@blog/cms-types)
│   ├── config/        # Shared config (@blog/config)
│   ├── ui/            # Shared UI components (@blog/ui)
│   ├── utils/         # Shared utilities (@blog/utils)
│   └── test-utils/    # Test helpers (@blog/test-utils)
├── infra/terraform/   # IaC (Cloudflare, Vercel, AWS)
├── scripts/           # Build/deploy scripts
└── docs/              # Project documentation
```

## Key File Paths

### Frontend (apps/blog)

- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utilities and helpers
- `src/contents/` - Markdown articles (YYYY-MM-DD-slug.md)
- `e2e/` - Playwright E2E tests

### Backend (apps/cms-api)

- `src/index.ts` - Hono app entry point
- `src/handlers/` - API route handlers
- `src/middleware/` - Auth, CORS, etc.
- `src/lib/` - Database, storage utilities
- `migrations/` - D1 SQL migrations

### Shared Types (packages/cms-types)

- `src/article.ts` - Article, Category, Tag types
- `src/api.ts` - API request/response types

### Infrastructure (infra/terraform)

- `modules/` - Reusable Terraform modules
- `envs/dev/` - Development environment
- `envs/prod/` - Production environment
- `envs/shared/` - Shared resources (Discord)

## Package Dependencies

```text
apps/blog → @blog/cms-types, @blog/ui, @blog/utils, @blog/config
apps/cms-api → @blog/cms-types, @blog/utils
packages/ui → @blog/config
packages/test-utils → @blog/cms-types
```

## Environment URLs

| Env   | Blog                    | CMS API                              |
|-------|-------------------------|--------------------------------------|
| Local | localhost:3100          | localhost:3101                       |
| Dev   | blog-dev.tqer39.dev     | cms-api-dev.tqer39.workers.dev       |
| Prod  | blog.tqer39.dev         | cms-api.tqer39.workers.dev           |
