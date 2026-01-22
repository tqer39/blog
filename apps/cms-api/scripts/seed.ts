/**
 * Seed script for sample data
 * Run with: pnpm seed (requires API server running)
 */

const API_URL = process.env.CMS_API_URL || 'http://localhost:3101/v1';
const API_KEY = process.env.CMS_API_KEY || 'dev-api-key';

interface CategoryInput {
  name: string;
  slug: string;
  color: string;
  displayOrder: number;
}

interface ArticleInput {
  title: string;
  description: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  headerImageId?: string;
  slideMode?: boolean;
}

const categories: CategoryInput[] = [
  { name: 'Tech', slug: 'tech', color: '#3B82F6', displayOrder: 1 },
  { name: 'Life', slug: 'life', color: '#10B981', displayOrder: 2 },
  { name: 'Books', slug: 'books', color: '#F59E0B', displayOrder: 3 },
];

async function createCategory(category: CategoryInput): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(category),
    });

    if (res.ok) {
      console.log(`  ✅ Created: ${category.name}`);
      return true;
    }
    const error = await res.json();
    console.log(`  ⚠️  Skipped: ${category.name} (${error.error})`);
    return false;
  } catch (e) {
    console.log(
      `  ❌ Error: ${category.name} (${e instanceof Error ? e.message : 'Unknown error'})`
    );
    return false;
  }
}

// Upload a placeholder image from picsum.photos
async function uploadPlaceholderImage(): Promise<string | null> {
  try {
    // Fetch random image from picsum.photos (800x400)
    const imageRes = await fetch('https://picsum.photos/800/400');
    if (!imageRes.ok) return null;

    const imageBlob = await imageRes.blob();

    // Upload to CMS API
    const formData = new FormData();
    formData.append('file', imageBlob, 'placeholder.jpg');

    const res = await fetch(`${API_URL}/images`, {
      method: 'POST',
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
    title: 'Hello World - ブログを始めました',
    description: '個人ブログを開設しました。技術記事やメモを書いていきます。',
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
    tags: ['Next.js', 'Blog'],
    status: 'published',
  },
  {
    title: 'Next.js App Router 完全ガイド',
    description:
      'Next.js 14のApp Routerについて詳しく解説します。Server Components、Client Components、Layoutsの使い方を学びましょう。',
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
    tags: ['Next.js', 'React', 'TypeScript'],
    status: 'published',
  },
  {
    title: 'TypeScript ベストプラクティス 2024',
    description:
      'TypeScriptを効果的に使うためのベストプラクティスをまとめました。',
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
    tags: ['TypeScript', 'JavaScript'],
    status: 'published',
  },
  {
    title: 'Cloudflare Workers 入門',
    description: 'Cloudflare Workersでエッジコンピューティングを始めましょう。',
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
    tags: ['Cloudflare', 'TypeScript'],
    status: 'published',
  },
  {
    title: 'Tailwind CSS 実践テクニック',
    description:
      'Tailwind CSSを使った効率的なスタイリングのテクニックを紹介します。',
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
    tags: ['CSS', 'Tailwind'],
    status: 'published',
  },
  {
    title: 'React Hooks 徹底解説',
    description: 'React Hooksの仕組みと正しい使い方を深掘りします。',
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
    tags: ['React', 'JavaScript'],
    status: 'published',
  },
  {
    title: 'Git ワークフロー改善テクニック',
    description: '日々のGit操作を効率化するテクニックを紹介します。',
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
    tags: ['Git', 'DevOps'],
    status: 'published',
  },
  {
    title: 'Docker Compose 設計パターン',
    description: 'Docker Composeを使った開発環境構築のパターンを解説します。',
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
    tags: ['Docker', 'DevOps'],
    status: 'published',
  },
  {
    title: 'REST API 設計原則',
    description: '良いREST APIを設計するための原則をまとめました。',
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
    tags: ['API', 'Backend'],
    status: 'published',
  },
  {
    title: 'フロントエンドテスト戦略',
    description: '効果的なフロントエンドテストの戦略と実践方法を解説します。',
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
    tags: ['Testing', 'JavaScript'],
    status: 'published',
  },
  {
    title: 'Webパフォーマンス最適化',
    description:
      'Webアプリケーションのパフォーマンスを改善するテクニックを紹介します。',
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
    tags: ['Performance', 'Web'],
    status: 'published',
  },
  {
    title: '画像カルーセル機能のデモ',
    description:
      'Markdownでカルーセルを使う方法を紹介します。複数の画像をスライド形式で表示できます。',
    content: `# 画像カルーセル機能のデモ

Markdown記法を拡張して画像カルーセルを簡単に作成できます。

---

## 基本的な使い方

\`\`\`carousel\` の中に画像をMarkdown形式で記述するだけで、自動的にカルーセル表示されます。

---

## 風景写真のカルーセル

以下は風景写真のカルーセル例です：

\`\`\`carousel
![山の風景](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop)
![海の夕日](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop)
![森の小道](https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop)
![湖畔の朝](https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=400&fit=crop)
\`\`\`

---

## 都市の写真

都市をテーマにしたカルーセルも作成できます：

\`\`\`carousel
![高層ビル](https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop)
![夜景](https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop)
![街並み](https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=400&fit=crop)
\`\`\`

---

## 記法について

カルーセルを作成するには、以下のMarkdown記法を使用します：

\`\`\`markdown
\\\`\\\`\\\`carousel
![画像1の説明](画像1のURL)
![画像2の説明](画像2のURL)
\\\`\\\`\\\`
\`\`\`

---

## ポイント

- 各画像は \`![alt](url)\` 形式で記述
- alt テキストはキャプションとして表示
- 画像は1枚でも複数枚でもOK
- 左右の矢印ボタンで操作

---

## まとめ

カルーセル機能で複数の関連画像をコンパクトに表示できます。

旅行記や製品紹介、ギャラリーなどに活用してください。`,
    tags: ['Tutorial', 'Markdown'],
    status: 'published',
    slideMode: true,
  },
  {
    title: 'TypeScript 入門スライド',
    description:
      'TypeScriptの基礎をスライド形式で学べるプレゼンテーション。スライドモードで閲覧できます。',
    content: `# TypeScript 入門

初心者向け TypeScript 基礎講座

---

## TypeScript とは？

- JavaScript に**型**を追加した言語
- Microsoft が開発
- 大規模開発に最適

\`\`\`typescript
// JavaScript
const name = "John";

// TypeScript
const name: string = "John";
\`\`\`

---

## 基本的な型

| 型 | 説明 | 例 |
|---|---|---|
| string | 文字列 | "hello" |
| number | 数値 | 42 |
| boolean | 真偽値 | true |
| array | 配列 | [1, 2, 3] |

---

## 型注釈

変数に型を明示的に指定できます。

\`\`\`typescript
// 基本型
let message: string = "Hello";
let count: number = 10;
let isActive: boolean = true;

// 配列
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];
\`\`\`

---

## インターフェース

オブジェクトの形を定義します。

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email?: string; // オプショナル
}

const user: User = {
  id: 1,
  name: "Alice"
};
\`\`\`

---

## 関数の型

引数と戻り値に型を指定できます。

\`\`\`typescript
function add(a: number, b: number): number {
  return a + b;
}

// アロー関数
const multiply = (a: number, b: number): number => {
  return a * b;
};
\`\`\`

---

## Union Types

複数の型を許容できます。

\`\`\`typescript
type Status = "pending" | "approved" | "rejected";

function handleStatus(status: Status) {
  switch (status) {
    case "pending":
      return "審査中";
    case "approved":
      return "承認済み";
    case "rejected":
      return "却下";
  }
}
\`\`\`

---

## Generics

型をパラメータ化できます。

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

const str = identity<string>("hello");
const num = identity<number>(42);
\`\`\`

---

## まとめ

- TypeScript は JavaScript + 型
- 型注釈でバグを早期発見
- インターフェースでオブジェクト構造を定義
- Union Types で柔軟な型定義
- Generics で再利用可能なコード

**次のステップ**: 実際にプロジェクトで使ってみよう！`,
    tags: ['TypeScript', 'Tutorial'],
    status: 'published',
    slideMode: true,
  },
  {
    title: 'Before/After比較コンポーネントのデモ',
    description:
      '画像の比較表示機能を使って、ビフォー・アフターを直感的に確認できます。',
    content: `# Before/After比較コンポーネント

スライダーをドラッグして、2枚の画像を比較できます。

---

## 風景写真の加工前後

写真の加工前後を比較してみましょう：

\`\`\`compare
![加工前](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop)
![加工後](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=400&fit=crop)
\`\`\`

---

## 都市の昼と夜

同じ場所の昼と夜の違いを比較：

\`\`\`compare
![昼間](https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop)
![夜景](https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop)
\`\`\`

---

## 使い方

\`\`\`markdown
\\\`\\\`\\\`compare
![Before](画像URL1)
![After](画像URL2)
\\\`\\\`\\\`
\`\`\`

### 操作方法

- **マウス**: ドラッグまたはクリックでスライダー移動
- **タッチ**: スワイプでスライダー移動
- **キーボード**: 左右矢印キーで微調整

---

## まとめ

Before/After比較は以下の用途に便利です：

- 写真の加工前後
- デザインの変更比較
- 時間経過による変化
- A/Bテストの結果表示`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },
  {
    title: 'インタラクティブチャート機能のデモ',
    description:
      'YAML形式でデータを定義するだけで、折れ線・棒・円・エリアチャートを表示できます。',
    content: `# インタラクティブチャート機能

YAML形式でデータを定義するだけで、美しいチャートを表示できます。

---

## 折れ線グラフ

月別のアクセス数推移：

\`\`\`chart
type: line
title: 月別アクセス数
data:
  - month: 1月
    visitors: 1200
    pageviews: 3500
  - month: 2月
    visitors: 1500
    pageviews: 4200
  - month: 3月
    visitors: 1800
    pageviews: 5100
  - month: 4月
    visitors: 2200
    pageviews: 6300
  - month: 5月
    visitors: 2800
    pageviews: 7800
\`\`\`

---

## 棒グラフ

プログラミング言語の人気度：

\`\`\`chart
type: bar
title: 言語別使用率
data:
  - lang: TypeScript
    usage: 85
  - lang: Python
    usage: 72
  - lang: Go
    usage: 45
  - lang: Rust
    usage: 28
\`\`\`

---

## 円グラフ

トラフィックソースの内訳：

\`\`\`chart
type: pie
title: トラフィックソース
data:
  - source: 検索
    value: 45
  - source: SNS
    value: 25
  - source: 直接
    value: 20
  - source: リファラル
    value: 10
\`\`\`

---

## エリアチャート

売上推移：

\`\`\`chart
type: area
title: 月別売上
data:
  - month: 1月
    sales: 100
  - month: 2月
    sales: 150
  - month: 3月
    sales: 180
  - month: 4月
    sales: 220
  - month: 5月
    sales: 300
\`\`\`

---

## 使い方

YAML形式で設定：

\`\`\`yaml
type: line | bar | pie | area
title: グラフタイトル
data:
  - name: ラベル
    value: 数値
\`\`\``,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },
  {
    title: 'ターミナル再生コンポーネントのデモ',
    description:
      'コマンドラインの操作をタイピングアニメーション付きで表示できます。',
    content: `# ターミナル再生コンポーネント

コマンドラインの操作を、タイピングアニメーション付きで表示できます。

---

## 基本的な使い方

プロジェクトのセットアップ手順：

\`\`\`terminal
$ mkdir my-project
$ cd my-project
$ npm init -y
Wrote to /my-project/package.json
$ npm install typescript
added 1 package in 2s
\`\`\`

---

## Next.js プロジェクト作成

Next.js の新規プロジェクト作成：

\`\`\`terminal
$ npx create-next-app@latest my-app
✔ Would you like to use TypeScript? Yes
✔ Would you like to use ESLint? Yes
✔ Would you like to use Tailwind CSS? Yes
Creating a new Next.js app in /my-app
Installing dependencies...
Success! Created my-app
$ cd my-app
$ npm run dev
> Ready on http://localhost:3000
\`\`\`

---

## Git 操作

変更をコミットしてプッシュ：

\`\`\`terminal
$ git status
On branch main
Changes not staged for commit:
  modified: src/app/page.tsx
$ git add .
$ git commit -m "feat: add new feature"
[main abc1234] feat: add new feature
 1 file changed, 10 insertions(+)
$ git push origin main
Enumerating objects: 5, done.
Writing objects: 100% (3/3), done.
\`\`\`

---

## 操作方法

- **再生/一時停止**: ヘッダーのボタンで制御
- **コピー**: コマンド部分のみコピー可能
- **リプレイ**: 完了後にリプレイ可能`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },
  {
    title: '3Dモデルビューア機能のデモ',
    description:
      '.glb/.gltfファイルを読み込んで、3Dモデルをインタラクティブに表示できます。',
    content: `# 3Dモデルビューア

.glb/.gltf 形式の3Dモデルをインタラクティブに表示できます。

---

## サンプルモデル

以下は公開されているサンプルモデルです：

\`\`\`model
src: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Box/glTF-Binary/Box.glb
autoRotate: true
scale: 1
\`\`\`

---

## 操作方法

- **回転**: マウスドラッグ
- **ズーム**: マウスホイール
- **自動回転**: 設定で有効/無効

---

## 使い方

YAML形式で設定：

\`\`\`yaml
src: モデルのURL (.glb または .gltf)
autoRotate: true/false
scale: 倍率 (デフォルト: 1)
\`\`\`

### 対応フォーマット

- **.glb**: バイナリ形式（推奨）
- **.gltf**: JSON形式

---

## 活用例

- 製品の3Dプレビュー
- 建築モデルの展示
- キャラクターモデルの紹介
- インタラクティブな説明図`,
    tags: ['Tutorial', 'UI', 'Three.js'],
    status: 'published',
    slideMode: true,
  },
  {
    title: 'Code Diff機能のデモ',
    description: 'コードの変更差分をgit diff風に表示できます。',
    content: `# Code Diff

コードの変更差分を視覚的に表示できます。

---

## 標準diff形式

\`+\` と \`-\` プレフィックスで追加・削除行を表示：

\`\`\`diff
- const message = "Hello";
+ const message = "Hello, World!";
  console.log(message);
- // old comment
+ // new improved comment
\`\`\`

---

## YAML形式（before/after比較）

2つのコードブロックを比較：

\`\`\`diff
language: typescript
before: |
  function greet(name) {
    console.log("Hello " + name);
  }
after: |
  function greet(name: string): void {
    console.log(\`Hello \${name}\`);
  }
\`\`\`

---

## 使い方

### 標準diff形式
\`\`\`
\\\`\\\`\\\`diff
- 削除行
+ 追加行
  変更なし行
\\\`\\\`\\\`
\`\`\`

### YAML形式
\`\`\`yaml
language: typescript
before: |
  変更前のコード
after: |
  変更後のコード
\`\`\`

---

## 活用例

- コードレビューの説明
- リファクタリングのビフォーアフター
- バグ修正の解説`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },
  {
    title: 'File Tree機能のデモ',
    description: 'ディレクトリ構造をインタラクティブに表示できます。',
    content: `# File Tree

プロジェクトのディレクトリ構造を視覚的に表示できます。

---

## サンプル

\`\`\`tree
src/
  components/
    Button.tsx
    Card.tsx
    Modal.tsx
  hooks/
    useAuth.ts
    useForm.ts
  pages/
    index.tsx
    about.tsx
    blog/
      [slug].tsx
  utils/
    helpers.ts
    constants.ts
  styles/
    globals.css
package.json
tsconfig.json
README.md
\`\`\`

---

## 操作方法

- **展開/折りたたみ**: フォルダをクリック
- **コピー**: ヘッダーのコピーボタン

---

## 記法

インデント（2スペース）で階層を表現：
- 末尾 \`/\` → フォルダ
- それ以外 → ファイル

\`\`\`
\\\`\\\`\\\`tree
プロジェクト/
  フォルダ/
    ファイル.ts
\\\`\\\`\\\`
\`\`\`

---

## 活用例

- プロジェクト構成の説明
- 新規ファイル追加の案内
- ディレクトリ設計のドキュメント`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },
];

async function createArticle(article: ArticleInput): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      `  ❌ Error: ${article.title} (${e instanceof Error ? e.message : 'Unknown error'})`
    );
    return false;
  }
}

async function seed() {
  console.log('🌱 Seeding sample data...\n');

  // Create categories
  console.log('📁 Creating categories...\n');
  for (const category of categories) {
    await createCategory(category);
  }

  // Upload placeholder images for first few articles
  console.log('\n📷 Uploading placeholder images...\n');
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

  console.log('\n📝 Creating articles...\n');

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
