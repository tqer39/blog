# Environment Configuration

[🇯🇵 日本語版](ENVIRONMENT.ja.md)

## Overview

This project uses a 3-environment structure: Local, Dev, and Prod.

## Environments

| Environment | Blog | CMS API | CDN |
| ----------- | ---- | ------- | --- |
| Local | localhost:3100 | localhost:3101 | localhost:3102 |
| Dev | blog-dev.tqer39.dev | cms-api-dev.workers.dev | cdn.tqer39.dev |
| Prod | blog.tqer39.dev | cms-api.workers.dev | cdn.tqer39.dev |

## Port Assignments

| Service | Port | Description |
| ------- | ---- | ----------- |
| Blog (Next.js) | 3100 | Frontend application |
| CMS API (Hono) | 3101 | Backend API |
| R2 Local | 3102 | R2 emulator (MinIO) |

## Domain Structure

```text
tqer39.dev (Base Domain)
├── blog.tqer39.dev         # Production Blog
├── blog-dev.tqer39.dev     # Development Blog
├── cdn.tqer39.dev          # R2 CDN (Production & Dev)
└── *.tqer39.workers.dev    # Cloudflare Workers
    ├── cms-api             # Production CMS API
    └── cms-api-dev         # Development CMS API
```

## Configuration

All environment-related constants are centralized in:

```text
packages/config/src/constants.ts
```

### Available Constants

```typescript
import {
  PORTS,          // Port numbers
  BASE_DOMAIN,    // Base domain (tqer39.dev)
  DOMAINS,        // Full domain URLs
  CORS_ORIGINS,   // Allowed CORS origins
  getLocalImageUrl,  // Helper for local image URLs
  getCdnImageUrl,    // Helper for CDN image URLs
} from '@blog/config';
```

### Usage Example

```typescript
// CMS API - CORS configuration
import { CORS_ORIGINS } from '@blog/config';

cors({
  origin: [...CORS_ORIGINS],
});

// Next.js - Image configuration
const { PORTS, BASE_DOMAIN } = require('@blog/config');

images: {
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: String(PORTS.CMS_API),
    },
  ],
}
```

## Authentication

| Method | Target | Environment | Purpose |
| ------ | ------ | ----------- | ------- |
| Basic Auth | CMS API (all) | Dev only | External access |
| API Key | CMS API /v1 | All | API authentication |
| Password | Admin UI | All | Admin login |

## Related Files

- `packages/config/src/constants.ts` - Centralized constants
- `apps/blog/next.config.js` - CSP and image patterns
- `apps/cms-api/src/index.ts` - CORS configuration
- `apps/cms-api/wrangler.toml` - Worker configuration
- `infra/terraform/config.yml` - Terraform domain config
