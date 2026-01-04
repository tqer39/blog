/**
 * Seed script for sample data
 * Run with: pnpm seed (requires API server running)
 */

const API_URL = process.env.CMS_API_URL || "http://localhost:8787/v1";
const API_KEY = process.env.CMS_API_KEY || "dev-api-key";

interface ArticleInput {
  title: string;
  description: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  headerImageId?: string;
}

// Upload a placeholder image from picsum.photos
async function uploadPlaceholderImage(): Promise<string | null> {
  try {
    // Fetch random image from picsum.photos (800x400)
    const imageRes = await fetch("https://picsum.photos/800/400");
    if (!imageRes.ok) return null;

    const imageBlob = await imageRes.blob();

    // Upload to CMS API
    const formData = new FormData();
    formData.append("file", imageBlob, "placeholder.jpg");

    const res = await fetch(`${API_URL}/images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    if (res.ok) {
      const data = (await res.json()) as { id: string };
      return data.id;
    }
    return null;
  } catch {
    return null;
  }
}

const articles: ArticleInput[] = [
  {
    title: "Hello World - ブログを始めました",
    description: "個人ブログを開設しました。技術記事やメモを書いていきます。",
    content: `# Hello World - ブログを始めました

## はじめに

このブログを開設しました。技術的なトピックや日々の学びを共有していきます。

## 技術スタック

このブログは以下の技術で構築されています：

- **Next.js 14** - React フレームワーク
- **Tailwind CSS** - スタイリング
- **Markdown** - コンテンツ管理
- **Vercel** - ホスティング

## コードスニペットのテスト

### TypeScript

\`\`\`typescript:example.ts
interface Article {
  title: string;
  date: string;
  tags: string[];
}

function getLatestArticles(articles: Article[]): Article[] {
  return articles
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 5);
}
\`\`\`

### Python

\`\`\`python:fibonacci.py
def fibonacci(n: int) -> list[int]:
    if n <= 0:
        return []
    elif n == 1:
        return [0]

    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

print(fibonacci(10))
\`\`\`

### JSON

\`\`\`json:package.json
{
  "name": "my-blog",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0"
  }
}
\`\`\`

## インラインコード

変数名は \`camelCase\` で、定数は \`UPPER_SNAKE_CASE\` で命名します。\`npm install\` でパッケージをインストールできます。

## Mermaid図表のテスト

フローチャートの例：

\`\`\`mermaid
graph TD
    A[記事を書く] --> B[Markdownファイル作成]
    B --> C[Git Push]
    C --> D[Vercel自動デプロイ]
    D --> E[公開完了]
\`\`\`

シーケンス図の例：

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Vercel
    User->>Browser: ブログにアクセス
    Browser->>Vercel: リクエスト
    Vercel-->>Browser: 静的HTML
    Browser-->>User: ページ表示
\`\`\`

## まとめ

今後も継続的に記事を更新していく予定です。`,
    tags: ["Next.js", "Blog"],
    status: "published",
  },
  {
    title: "Next.js App Router 完全ガイド",
    description:
      "Next.js 14のApp Routerについて詳しく解説します。Server Components、Client Components、Layoutsの使い方を学びましょう。",
    content: `# Next.js App Router 完全ガイド

## はじめに

Next.js 14で正式版となったApp Routerは、Reactアプリケーションの構築方法を大きく変えました。

## Server Components

デフォルトでサーバーコンポーネントとして動作します。

\`\`\`typescript
// app/page.tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
\`\`\`

## Client Components

インタラクティブな機能が必要な場合は "use client" を使用します。

\`\`\`typescript
"use client";

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

## まとめ

App Routerを使いこなして、モダンなWebアプリケーションを構築しましょう。`,
    tags: ["Next.js", "React", "TypeScript"],
    status: "published",
  },
  {
    title: "TypeScript ベストプラクティス 2024",
    description:
      "TypeScriptを効果的に使うためのベストプラクティスをまとめました。",
    content: `# TypeScript ベストプラクティス 2024

## 型推論を活用する

明示的な型注釈は必要な場合のみ使用しましょう。

\`\`\`typescript
// Good
const name = "John";

// Unnecessary
const name: string = "John";
\`\`\`

## Union Types

Union Typesを使って柔軟な型定義を行いましょう。

\`\`\`typescript
type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status) {
  switch (status) {
    case "pending": return "審査中";
    case "approved": return "承認済み";
    case "rejected": return "却下";
  }
}
\`\`\`

## まとめ

TypeScriptの型システムを正しく理解して、安全なコードを書きましょう。`,
    tags: ["TypeScript", "JavaScript"],
    status: "published",
  },
  {
    title: "Cloudflare Workers 入門",
    description:
      "Cloudflare Workersでエッジコンピューティングを始めましょう。",
    content: `# Cloudflare Workers 入門

## Cloudflare Workersとは

Cloudflare Workersは、世界中のエッジロケーションでJavaScriptを実行できるサーバーレスプラットフォームです。

## 基本的な使い方

\`\`\`typescript
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response("Hello World!");
  }
};
\`\`\`

## D1データベース

SQLiteベースのサーバーレスデータベースD1を使用できます。

\`\`\`typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const result = await env.DB.prepare("SELECT * FROM users").all();
    return Response.json(result);
  }
};
\`\`\`

## まとめ

Cloudflare Workersでエッジコンピューティングの世界を体験しましょう。`,
    tags: ["Cloudflare", "TypeScript"],
    status: "published",
  },
  {
    title: "Tailwind CSS 実践テクニック",
    description:
      "Tailwind CSSを使った効率的なスタイリングのテクニックを紹介します。",
    content: `# Tailwind CSS 実践テクニック

## カスタムカラーの定義

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        }
      }
    }
  }
}
\`\`\`

## レスポンシブデザイン

\`\`\`html
<div class="text-sm md:text-base lg:text-lg">
  レスポンシブなテキスト
</div>
\`\`\`

## ダークモード対応

\`\`\`html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  ダークモード対応
</div>
\`\`\`

## まとめ

Tailwind CSSでモダンなUIを効率的に構築しましょう。`,
    tags: ["CSS", "Tailwind"],
    status: "published",
  },
  {
    title: "React Hooks 徹底解説",
    description: "React Hooksの仕組みと正しい使い方を深掘りします。",
    content: `# React Hooks 徹底解説

## useStateの仕組み

\`\`\`typescript
const [count, setCount] = useState(0);

// 関数型アップデート
setCount(prev => prev + 1);
\`\`\`

## useEffectの注意点

依存配列を正しく設定することが重要です。

\`\`\`typescript
useEffect(() => {
  const subscription = api.subscribe(id);
  return () => subscription.unsubscribe();
}, [id]); // idが変わったときだけ再実行
\`\`\`

## useCallbackとuseMemo

\`\`\`typescript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
\`\`\`

## まとめ

Hooksを正しく理解して、効率的なReactコンポーネントを作りましょう。`,
    tags: ["React", "JavaScript"],
    status: "published",
  },
  {
    title: "Git ワークフロー改善テクニック",
    description: "日々のGit操作を効率化するテクニックを紹介します。",
    content: `# Git ワークフロー改善テクニック

## 便利なエイリアス

\`\`\`bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.st status
git config --global alias.lg "log --oneline --graph"
\`\`\`

## インタラクティブリベース

\`\`\`bash
git rebase -i HEAD~3
\`\`\`

## スタッシュの活用

\`\`\`bash
git stash save "作業中の変更"
git stash list
git stash pop
\`\`\`

## まとめ

Gitを使いこなして、チーム開発を効率化しましょう。`,
    tags: ["Git", "DevOps"],
    status: "published",
  },
  {
    title: "Docker Compose 設計パターン",
    description:
      "Docker Composeを使った開発環境構築のパターンを解説します。",
    content: `# Docker Compose 設計パターン

## 基本構成

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
\`\`\`

## マルチステージビルド

\`\`\`dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
\`\`\`

## まとめ

Docker Composeで再現可能な開発環境を構築しましょう。`,
    tags: ["Docker", "DevOps"],
    status: "published",
  },
  {
    title: "REST API 設計原則",
    description: "良いREST APIを設計するための原則をまとめました。",
    content: `# REST API 設計原則

## リソース指向

\`\`\`
GET    /users          # ユーザー一覧
GET    /users/:id      # ユーザー詳細
POST   /users          # ユーザー作成
PUT    /users/:id      # ユーザー更新
DELETE /users/:id      # ユーザー削除
\`\`\`

## ステータスコード

\`\`\`
200 OK           - 成功
201 Created      - 作成成功
400 Bad Request  - リクエストエラー
401 Unauthorized - 認証エラー
404 Not Found    - リソースなし
500 Server Error - サーバーエラー
\`\`\`

## ページネーション

\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100
  }
}
\`\`\`

## まとめ

一貫性のあるAPI設計で、使いやすいAPIを提供しましょう。`,
    tags: ["API", "Backend"],
    status: "published",
  },
  {
    title: "フロントエンドテスト戦略",
    description:
      "効果的なフロントエンドテストの戦略と実践方法を解説します。",
    content: `# フロントエンドテスト戦略

## テストピラミッド

1. ユニットテスト（多数）
2. 統合テスト（中程度）
3. E2Eテスト（少数）

## Vitestでのユニットテスト

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { sum } from './math';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
\`\`\`

## Playwrightでのe2Eテスト

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
});
\`\`\`

## まとめ

適切なテスト戦略で、信頼性の高いアプリケーションを作りましょう。`,
    tags: ["Testing", "JavaScript"],
    status: "published",
  },
  {
    title: "Webパフォーマンス最適化",
    description:
      "Webアプリケーションのパフォーマンスを改善するテクニックを紹介します。",
    content: `# Webパフォーマンス最適化

## Core Web Vitals

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

## 画像最適化

\`\`\`typescript
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority
    />
  );
}
\`\`\`

## コード分割

\`\`\`typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
\`\`\`

## まとめ

パフォーマンスを意識して、ユーザー体験を向上させましょう。`,
    tags: ["Performance", "Web"],
    status: "published",
  },
];

async function createArticle(article: ArticleInput): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(article),
    });

    if (res.ok) {
      console.log(`  ✅ Created: ${article.title}`);
      return true;
    }
    const error = await res.json();
    console.log(`  ⚠️  Skipped: ${article.title} (${error.error})`);
    return false;
  } catch (e) {
    console.log(
      `  ❌ Error: ${article.title} (${e instanceof Error ? e.message : "Unknown error"})`
    );
    return false;
  }
}

async function seed() {
  console.log("🌱 Seeding sample data...\n");

  // Upload placeholder images for first few articles
  console.log("📷 Uploading placeholder images...\n");
  const imageIds: (string | null)[] = [];
  const NUM_IMAGES = 3; // Number of articles to add images to

  for (let i = 0; i < NUM_IMAGES; i++) {
    const imageId = await uploadPlaceholderImage();
    imageIds.push(imageId);
    if (imageId) {
      console.log(`  ✅ Image ${i + 1}/${NUM_IMAGES} uploaded`);
    } else {
      console.log(`  ⚠️  Image ${i + 1}/${NUM_IMAGES} failed`);
    }
  }

  console.log("\n📝 Creating articles...\n");

  let created = 0;
  let failed = 0;

  for (const [index, article] of articles.entries()) {
    // Assign header image to first NUM_IMAGES articles
    const headerImageId = index < NUM_IMAGES ? imageIds[index] : undefined;
    const articleWithImage = headerImageId
      ? { ...article, headerImageId }
      : article;

    const success = await createArticle(articleWithImage);
    if (success) created++;
    else failed++;
  }

  console.log(`\n✅ Seed completed: ${created} created, ${failed} failed`);
}

seed().catch(console.error);
