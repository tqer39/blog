# AI Integration Guide

[🇯🇵 日本語版](AI-INTEGRATION.ja.md)

This document provides an overview of AI usage in the blog project.
It covers development workflow automation and blog service features.

## Overview

### AI Services Used

| Service     | Provider  | Purpose                             |
| ----------- | --------- | ----------------------------------- |
| Claude      | Anthropic | Content assistance, article review  |
| GPT-4o-mini | OpenAI    | PR descriptions, metadata           |
| Gemini      | Google    | Header image generation             |

### Required API Keys

| Secret              | Service    | Used In                            |
| ------------------- | ---------- | ---------------------------------- |
| `ANTHROPIC_API_KEY` | Claude API | CMS API (review, continuation)     |
| `OPENAI_API_KEY`    | OpenAI API | GitHub Actions, CMS API (metadata) |
| `GEMINI_API_KEY`    | Google AI  | CMS API (image generation)         |

---

## Part 1: Development Workflow

### 1.1 PR Description Generation

**Workflow**: `.github/workflows/generate-pr-description.yml`

Automatically generates Japanese PR titles and descriptions when a pull
request is created or updated.

- **Model**: GPT-4o-mini
- **Trigger**: PR creation/synchronization to `main` branch
- **Action**: `tqer39/openai-generate-pr-description@v1.0.5`
- **Exclusions**: Bot PRs (renovate, tqer39-apps)

### 1.2 Claude Code Integration

Claude Code is the primary AI-assisted development tool for this project.

**Configuration**: `CLAUDE.md` (project root)

Key capabilities:

- Code generation and refactoring
- Bug analysis and fixes
- Documentation writing
- Test creation
- Architecture design assistance

**Model**: Claude Opus 4.5

### 1.3 Claude Code Skills

Custom workflows defined in `.claude/skills/` directory:

| Skill                | Purpose                               |
| -------------------- | ------------------------------------- |
| `article-creation`   | Create new blog articles              |
| `unit-test`          | Generate Vitest tests                 |
| `architecture-design`| Design system architecture            |
| `release-notes`      | Generate changelogs from git          |
| `markdown-lint`      | Validate markdown files               |
| `security`           | Run security review checklist         |
| `document-secrets`   | Maintain secrets documentation        |
| `translate-docs`     | Translate documentation (EN/JA)       |
| `rebase-main`        | Resolve git rebase conflicts          |
| `reorganize-docs`    | Organize bilingual documentation      |

### 1.4 MCP Servers

Model Context Protocol servers provide enhanced capabilities:

| Server     | Purpose                          |
| ---------- | -------------------------------- |
| `serena`   | Code navigation, symbol analysis |
| `context7` | Library documentation lookup     |

**Configuration**: `.claude/settings.local.json`

---

## Part 2: Blog Service AI Features

All AI features are implemented in the CMS API
(`apps/cms-api/src/handlers/ai.ts`) and exposed through the blog frontend.

### 2.1 Content Creation Assistance

#### Continuation Suggestions

Generate continuation options for article text at cursor position.

- **Endpoint**: `POST /ai/suggest-continuation`
- **Model**: Claude Sonnet 4
- **Features**:
  - 3 continuation suggestions with confidence scores
  - Length options: short (30-100), medium (100-300), long (300-600) chars
  - Context-aware: extracts 2000 chars before + 500 chars after cursor
- **UI**: Popover with suggestions, keyboard shortcut (Cmd+J)

#### Inline Completion

Copilot-style real-time suggestions while typing.

- **Model**: Claude Sonnet 4 (via suggest-continuation API)
- **Features**:
  - Debounced API calls (800ms after typing stops)
  - Ghost text overlay at cursor position
  - Tab to accept, Esc to dismiss
- **UI**: Toggle button in toolbar (Sparkles icon)

#### Outline Generation

Generate article structure based on title and category.

- **Endpoint**: `POST /ai/generate-outline`
- **Model**: Claude Sonnet 4
- **Category Templates**:
  - **Tech**: Conclusion -> Assumptions -> Rejected options -> Implementation
  - **Life**: Event overview -> Emotions -> Structure -> Action memo
  - **Books**: Why read -> Impressions -> Changes -> Notes
- **Output**: Markdown-formatted outline with H2/H3 headings

#### Text Transformation

Transform selected text with various actions.

- **Endpoint**: `POST /ai/transform-text`
- **Model**: Claude Sonnet 4
- **Actions**:
  - `rewrite` - Simplify and clarify
  - `expand` - Add detail and examples
  - `summarize` - Condense content
  - `translate` - Japanese <-> English
  - `formal` - Convert to formal style
  - `casual` - Convert to casual style
- **UI**: Floating toolbar on text selection (Notion-style)

### 2.2 Metadata & SEO

#### Metadata Generation

Generate SEO-optimized description and tags.

- **Endpoint**: `POST /ai/generate-metadata`
- **Model**: GPT-4o-mini
- **Output**:
  - Description: 100-160 characters, SEO-optimized
  - Tags: 3-5 relevant tags, lowercase, hyphenated
- **Features**: Auto-detects article language, prefers existing tags

### 2.3 Visual Content

#### Header Image Generation

Generate OGP-compliant header images.

- **Endpoint**: `POST /ai/generate-image`
- **Models**: `gemini-2.5-flash-image`, `gemini-3-pro-image-preview`
- **Specifications**: 1200x630px PNG/JPEG (OG image standard)
- **Storage**: Cloudflare R2 with metadata in D1 database

### 2.4 Quality Assurance

#### Article Review

Comprehensive article analysis and feedback.

- **Endpoint**: `POST /ai/review-article`
- **Model**: Claude Sonnet 4
- **Review Categories**:
  - `clarity` - Logical flow, readability
  - `structure` - Paragraph organization, heading usage
  - `accuracy` - Technical correctness
  - `grammar` - Typos, grammar errors
  - `style` - Consistency, verbosity
- **Output**:
  - Overall score (1-10)
  - Summary assessment
  - Detailed feedback items with severity (info/warning/error)

---

## API Reference

### Endpoints

| Endpoint                  | Method | Model          | Purpose            |
| ------------------------- | ------ | -------------- | ------------------ |
| `/ai/generate-metadata`   | POST   | GPT-4o-mini    | Description + tags |
| `/ai/generate-image`      | POST   | Gemini         | Header image       |
| `/ai/review-article`      | POST   | Claude Sonnet  | Article review     |
| `/ai/suggest-continuation`| POST   | Claude Sonnet  | Continuation       |
| `/ai/generate-outline`    | POST   | Claude Sonnet  | Outline            |
| `/ai/transform-text`      | POST   | Claude Sonnet  | Text transform     |

### Type Definitions

See `packages/cms-types/src/index.ts` for complete type definitions:

- Request types: `TransformTextRequest`, `GenerateOutlineRequest`, etc.
- Response types: `TransformTextResponse`, `GenerateOutlineResponse`, etc.
- Enums: `TransformAction`, `ArticleCategory`, `ContinuationLength`, etc.

---

## Configuration

### Environment Variables

**CMS API** (Cloudflare Workers):

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

### GitHub Secrets

Required for CI/CD workflows:

- `OPENAI_API_KEY` - PR description generation
- `ANTHROPIC_API_KEY` - (optional, for future CI integrations)
- `GEMINI_API_KEY` - (optional, for future CI integrations)

### Local Development

Create `.dev.vars` in `apps/cms-api/`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```
