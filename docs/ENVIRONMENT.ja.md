# 環境設定

[🇺🇸 English](ENVIRONMENT.md)

## 概要

このプロジェクトは開発・ステージング・本番の3環境構成を使用しています。

## 環境一覧

| 環境 | Blog | CMS API | CDN |
| ---- | ---- | ------- | --- |
| Local | localhost:3100 | localhost:3200 | localhost:3300 |
| Dev | blog-dev.tqer39.dev | cms-api-dev.workers.dev | cdn.tqer39.dev |
| Prod | blog.tqer39.dev | cms-api.workers.dev | cdn.tqer39.dev |

## ポート割り当て

| サービス | ポート | 説明 |
| -------- | ------ | ---- |
| Blog (Next.js) | 3100 | フロントエンド |
| CMS API (Hono) | 3200 | バックエンド API |
| R2 Local | 3300 | R2 エミュレータ (MinIO) |

## ドメイン構造

```text
tqer39.dev (ベースドメイン)
├── blog.tqer39.dev         # 本番ブログ
├── blog-dev.tqer39.dev     # 開発ブログ
├── cdn.tqer39.dev          # R2 CDN (本番 & 開発)
└── *.tqer39.workers.dev    # Cloudflare Workers
    ├── cms-api             # 本番 CMS API
    └── cms-api-dev         # 開発 CMS API
```

## 設定

環境関連の定数はすべて以下に集約されています：

```text
packages/config/src/constants.ts
```

### 利用可能な定数

```typescript
import {
  PORTS,          // ポート番号
  BASE_DOMAIN,    // ベースドメイン (tqer39.dev)
  DOMAINS,        // 完全なドメイン URL
  CORS_ORIGINS,   // 許可された CORS オリジン
  getLocalImageUrl,  // ローカル画像 URL ヘルパー
  getCdnImageUrl,    // CDN 画像 URL ヘルパー
} from '@blog/config';
```

### 使用例

```typescript
// CMS API - CORS 設定
import { CORS_ORIGINS } from '@blog/config';

cors({
  origin: [...CORS_ORIGINS],
});

// Next.js - 画像設定
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

## 認証

| 方式 | 対象 | 環境 | 目的 |
| ---- | ---- | ---- | ---- |
| Basic Auth | CMS API (全体) | Dev のみ | 外部アクセス制御 |
| API Key | CMS API /v1 | 全環境 | API 認証 |
| Password | Admin UI | 全環境 | 管理者ログイン |

## 関連ファイル

- `packages/config/src/constants.ts` - 定数の集約
- `apps/blog/next.config.js` - CSP と画像パターン
- `apps/cms-api/src/index.ts` - CORS 設定
- `apps/cms-api/wrangler.toml` - Worker 設定
- `infra/terraform/config.yml` - Terraform ドメイン設定
