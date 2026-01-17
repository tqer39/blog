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

- **System architecture**: See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for comprehensive design decisions and data flows
- **Directory structure**: See [README.md](README.md)
- **Development commands**: Run `just --list`
- **GitHub Secrets**: See [docs/SECRETS.md](docs/SECRETS.md)

## Environment & Deployment

**Quick Reference**:
- Local: `localhost:3100` (blog), `localhost:3101` (API)
- Dev: `blog-dev.tqer39.dev`
- Prod: `blog.tqer39.dev`

**Detailed documentation**: See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for:
- 3-environment structure and configuration
- CI/CD and release flow
- Authentication layers (Basic Auth, API Key, Password)
- Deployment architecture

## Tech Stack

**Core**:
- Next.js 15 (App Router) + Hono + Cloudflare (D1/R2/Workers)
- TypeScript + Tailwind CSS + Turborepo + pnpm

**Detailed documentation**: See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete tech stack and architecture decisions
