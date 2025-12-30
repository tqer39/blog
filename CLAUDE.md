# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

個人ブログサービスの monorepo。Turborepo + pnpm workspaces で管理。

## Development Commands

```bash
# Setup (first time)
make bootstrap          # Install Homebrew and Brewfile packages
just setup              # Setup mise, direnv, hooks

# Development
pnpm dev                # Run all dev servers
pnpm build              # Build all packages
pnpm check              # Run biome check

# Filter by package
pnpm --filter @blog/web dev    # blog のみ起動
pnpm --filter @blog/web build  # blog のみビルド

# Testing
pnpm e2e                # Run Playwright E2E tests

# Infrastructure
just tf -chdir=dev/bootstrap plan
just tf -chdir=dev/main plan
```

## Architecture

### Monorepo Structure

```text
/
├── apps/
│   └── blog/                   # Next.js ブログアプリ (@blog/web)
│       ├── src/
│       │   ├── app/            # App Router
│       │   ├── components/     # React components
│       │   ├── contents/       # Markdown articles
│       │   └── lib/            # Utility functions
│       ├── e2e/                # Playwright tests
│       └── package.json
├── packages/
│   ├── ui/                     # 共通 UI コンポーネント (@blog/ui)
│   ├── config/                 # 共通設定 (@blog/config)
│   └── utils/                  # 共通ユーティリティ (@blog/utils)
├── infra/terraform/
│   ├── modules/                # Terraform modules
│   └── envs/dev/               # Environment configs
├── turbo.json                  # Turborepo 設定
├── pnpm-workspace.yaml         # pnpm workspace 設定
└── package.json                # Root package.json
```

### Package Names

| Directory       | Package Name | Description            |
| --------------- | ------------ | ---------------------- |
| apps/blog       | @blog/web    | Next.js ブログアプリ   |
| packages/ui     | @blog/ui     | 共通 UI コンポーネント |
| packages/config | @blog/config | 共通設定               |
| packages/utils  | @blog/utils  | 共通ユーティリティ     |

### Markdown Front-matter

```yaml
---
title: "Article Title"
date: "2025-12-30"
published: true
tags: ["Tag1", "Tag2"]
description: "Article description for SEO"
---
```

### Key Technical Decisions

- **Monorepo**: Turborepo + pnpm workspaces
- **Static Export**: `output: 'export'` in next.config.js
- **Content**: Markdown files with gray-matter
- **Dark Mode**: next-themes with class-based switching
- **Styling**: Tailwind CSS with typography plugin
- **Code Highlighting**: react-syntax-highlighter (oneDark theme)
- **Diagrams**: Mermaid.js loaded from CDN
- **Formatter/Linter**: Biome (not ESLint/Prettier)
- **E2E Testing**: Playwright
- **IaC**: Terraform (AWS + CloudFlare + Vercel)

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*` in each app.

## Deployment

- **Hosting**: Vercel with static export
- **Domain**: blog.tqer39.dev (CloudFlare DNS CNAME to Vercel)
- **CI/CD**: GitHub Actions
  - CI: lint, build, e2e tests (pnpm)
  - Terraform: plan on PR, apply on main

## Tool Management

- **Homebrew**: System packages (see Brewfile)
- **mise**: Node.js, pnpm, Terraform (see .mise.toml)
- **just**: Task runner (see justfile)
- **prek**: Pre-commit hooks
