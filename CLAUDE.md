# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

個人ブログサービス。Next.js 14による静的ブログアプリケーション。Markdownファイルでコンテンツを管理し、Vercelでホスティング。

## Development Commands

```bash
# Setup (first time)
make bootstrap          # Install Homebrew and Brewfile packages
just setup              # Setup mise, direnv, hooks

# Development
just dev                # Run development server
just build              # Build for production
just lint               # Run biome lint
just format             # Run biome format
just check              # Run biome check (lint + format)

# Testing
just e2e                # Run Playwright E2E tests
just e2e-ui             # Run Playwright with UI

# Infrastructure
just tf -chdir=dev/bootstrap plan    # Terraform plan for bootstrap
just tf -chdir=dev/main plan         # Terraform plan for main infra
```

## Architecture

### Directory Structure

```text
/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── contents/               # Markdown articles
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript definitions
├── infra/terraform/
│   ├── config.yml              # Shared configuration
│   ├── modules/                # Reusable modules
│   │   ├── deploy-role/        # GitHub OIDC IAM Role
│   │   ├── cloudflare-dns/     # DNS records
│   │   └── vercel-project/     # Vercel project
│   └── envs/dev/
│       ├── bootstrap/          # Deploy role (manual apply)
│       └── main/               # CloudFlare + Vercel
└── e2e/                        # Playwright tests
```

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

- **Static Export**: `output: 'export'` in next.config.js for Vercel
- **Content**: Markdown files with gray-matter for front-matter parsing
- **Dark Mode**: next-themes with class-based switching
- **Styling**: Tailwind CSS with typography plugin
- **Code Highlighting**: react-syntax-highlighter (oneDark theme)
- **Diagrams**: Mermaid.js loaded from CDN
- **Formatter/Linter**: Biome (not ESLint/Prettier)
- **E2E Testing**: Playwright
- **IaC**: Terraform (AWS + CloudFlare + Vercel)

### Path Aliases

TypeScript path alias `@/*` maps to `src/*`.

## Deployment

- **Hosting**: Vercel with static export
- **Domain**: blog.tqer39.dev (CloudFlare DNS CNAME to Vercel)
- **CI/CD**: GitHub Actions
  - CI: lint, build, e2e tests
  - Terraform: plan on PR, apply on main

## Tool Management

- **Homebrew**: System packages (see Brewfile)
- **mise**: Node.js, Terraform versions (see .mise.toml)
- **just**: Task runner (see justfile)
- **prek**: Pre-commit hooks
