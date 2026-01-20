# Blog Project Overview

## Project Type

Personal blog service monorepo (Turborepo + pnpm)

## Tech Stack

- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Backend: Hono on Cloudflare Workers
- Database: D1 (SQLite) on Cloudflare
- Storage: R2 (object storage) on Cloudflare
- Shared: Monorepo packages (@blog/cms-types, @blog/ui, @blog/config, @blog/utils)

## Key Architecture Decision

- Articles use ULID-based permanent URLs (`/articles/{ULID}`)
- No slug system for articles (intentional)
- Categories use slug for URL routes
- Tags use name as identifier (not slug)

## Development

- Local: blog on localhost:3100, API on localhost:3101
- Commands: Use `just --list` for available commands
- Testing: Vitest for unit tests, Playwright for E2E
- Linting: Biome, Markdownlint, Textlint, Shellcheck

## URL Design Philosophy

- Articles: Permanent ULID URLs (no slug changes)
- Categories: slug-based routing (can change)
- Tags: name-based filtering (query params only)
