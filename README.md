# tqer39's Blog

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![codecov](https://img.shields.io/codecov/c/github/tqer39/blog?style=for-the-badge&logo=codecov&logoColor=white)](https://codecov.io/gh/tqer39/blog)
[![CI](https://img.shields.io/github/actions/workflow/status/tqer39/blog/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/tqer39/blog/actions/workflows/ci.yml)
[![Terraform](https://img.shields.io/github/actions/workflow/status/tqer39/blog/terraform-dev.yml?branch=main&style=for-the-badge&logo=terraform&label=terraform)](https://github.com/tqer39/blog/actions/workflows/terraform-dev.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

[🇯🇵 日本語版](docs/README.ja.md)

Personal blog built with Next.js, Hono, and Cloudflare.

## Prerequisites

- [Homebrew](https://brew.sh/)
- [mise](https://mise.jdx.dev/) (installed via Homebrew)
- macOS or Linux

## Quick Start

```bash
# 1. Install system dependencies
make bootstrap

# 2. Setup development environment
just setup

# 3. Full local setup (install deps, reset DB, run migrations, seed data)
just bootstrap

# 4. Start development servers (in separate terminals)
just dev-api   # CMS API on http://localhost:8787
just dev-blog  # Blog on http://localhost:3100

# 5. Access the blog
open http://localhost:3100
```

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed local development instructions
- [Claude Code Guide](CLAUDE.md) - AI assistant guidance for this repository

## Tech Stack

| Component  | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | Next.js 15 (App Router)      |
| Backend    | Hono on Cloudflare Workers   |
| Database   | Cloudflare D1 (SQLite)       |
| Storage    | Cloudflare R2                |
| Styling    | Tailwind CSS                 |
| Monorepo   | Turborepo + pnpm             |
| IaC        | Terraform                    |
| CI/CD      | GitHub Actions               |

## Project Structure

```text
apps/
├── blog/       # Next.js blog application
└── cms-api/    # Hono CMS API

packages/
├── cms-types/  # Shared TypeScript types
├── ui/         # Shared UI components
├── config/     # Shared configurations
└── utils/      # Shared utilities
```

## License

MIT
