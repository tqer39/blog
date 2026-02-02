/**
 * Seed script for sample data
 * Run with: pnpm seed (requires API server running)
 *
 * Creates 11 articles that comprehensively cover all components:
 * - Code blocks (TypeScript, Python, JSON, etc.)
 * - Mermaid diagrams (flowchart, sequence)
 * - Tables
 * - Carousel
 * - Compare (before/after)
 * - Charts (line, bar, pie, area)
 * - Terminal
 * - 3D Model
 * - Code Diff
 * - File Tree
 * - Footnotes
 * - Slide mode
 * - Draft status
 * - With/without header images
 * - With/without tags
 * - All categories
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
  categoryId?: string;
  headerImageId?: string;
  slideMode?: boolean;
}

const categories: CategoryInput[] = [
  { name: 'Tech', slug: 'tech', color: '#3B82F6', displayOrder: 1 },
  { name: 'Life', slug: 'life', color: '#10B981', displayOrder: 2 },
  { name: 'Books', slug: 'books', color: '#F59E0B', displayOrder: 3 },
];

async function createCategory(category: CategoryInput): Promise<string | null> {
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
      const data = (await res.json()) as { id: string };
      console.log(`  ✅ Created: ${category.name} (${data.id})`);
      return data.id;
    }
    const error = await res.json();
    console.log(`  ⚠️  Skipped: ${category.name} (${error.error})`);
    return null;
  } catch (e) {
    console.log(
      `  ❌ Error: ${category.name} (${e instanceof Error ? e.message : 'Unknown error'})`
    );
    return null;
  }
}

async function uploadPlaceholderImage(): Promise<string | null> {
  try {
    const imageRes = await fetch('https://picsum.photos/800/400');
    if (!imageRes.ok) return null;

    const imageBlob = await imageRes.blob();
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

// 11 articles covering all components
const articles: ArticleInput[] = [
  // 1. 基本機能（コードブロック、Mermaid、テーブル） - Tech, published, with image
  {
    title: '基本機能デモ：コードブロック・Mermaid・テーブル',
    description:
      'コードブロック、Mermaid図、テーブルなどの基本的なMarkdown機能をテストします。',
    content: `# 基本機能デモ

## コードブロック

### TypeScript

\`\`\`typescript:example.ts
interface Article {
  id: string;
  title: string;
  tags: string[];
}

function getLatestArticles(articles: Article[]): Article[] {
  return articles.sort((a, b) => a.id.localeCompare(b.id)).slice(0, 5);
}
\`\`\`

### Python

\`\`\`python:fibonacci.py
def fibonacci(n: int) -> list[int]:
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

print(fibonacci(10))
\`\`\`

### JSON

\`\`\`json:config.json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.0.0"
  }
}
\`\`\`

## インラインコード

変数名は \`camelCase\` で、定数は \`UPPER_SNAKE_CASE\` で命名します。

## Mermaid図

### フローチャート

\`\`\`mermaid
graph TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理A]
    B -->|No| D[処理B]
    C --> E[終了]
    D --> E
\`\`\`

### シーケンス図

\`\`\`mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    User->>API: リクエスト
    API->>DB: クエリ
    DB-->>API: 結果
    API-->>User: レスポンス
\`\`\`

## テーブル

| 機能 | 状態 | 備考 |
|------|------|------|
| コードブロック | ✅ | 複数言語対応 |
| Mermaid | ✅ | フロー、シーケンス |
| テーブル | ✅ | GFM形式 |`,
    tags: ['Markdown', 'Tutorial'],
    status: 'published',
  },

  // 2. カルーセル機能 - Life, published, slide mode
  {
    title: '画像カルーセル機能デモ',
    description: '複数の画像をスライド形式で表示するカルーセル機能のデモです。',
    content: `# 画像カルーセル

---

## 風景写真

\`\`\`carousel
![山の風景](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop)
![海の夕日](https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop)
![森の小道](https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop)
\`\`\`

---

## 都市の写真

\`\`\`carousel
![高層ビル](https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop)
![夜景](https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=400&fit=crop)
\`\`\`

---

## 使い方

\`\`\`markdown
\\\`\\\`\\\`carousel
![画像1](URL1)
![画像2](URL2)
\\\`\\\`\\\`
\`\`\``,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },

  // 3. Before/After比較 - Tech, published, slide mode
  {
    title: 'Before/After比較機能デモ',
    description: 'スライダーで2枚の画像を比較できる機能のデモです。',
    content: `# Before/After比較

---

## 風景の比較

\`\`\`compare
![加工前](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop)
![加工後](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=400&fit=crop)
\`\`\`

---

## 操作方法

- **マウス**: ドラッグでスライダー移動
- **タッチ**: スワイプで移動
- **キーボード**: 左右矢印キー

---

## 使い方

\`\`\`markdown
\\\`\\\`\\\`compare
![Before](URL1)
![After](URL2)
\\\`\\\`\\\`
\`\`\``,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },

  // 4. チャート機能（全タイプ） - Tech, published, slide mode
  {
    title: 'インタラクティブチャート機能デモ',
    description: '折れ線・棒・円・エリアチャートの全タイプをデモします。',
    content: `# チャート機能

---

## 折れ線グラフ

\`\`\`chart
type: line
title: 月別アクセス数
data:
  - month: 1月
    visitors: 1200
  - month: 2月
    visitors: 1500
  - month: 3月
    visitors: 1800
  - month: 4月
    visitors: 2200
\`\`\`

---

## 棒グラフ

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
\`\`\`

---

## 円グラフ

\`\`\`chart
type: pie
title: トラフィックソース
data:
  - source: 検索
    value: 45
  - source: SNS
    value: 25
  - source: 直接
    value: 30
\`\`\`

---

## エリアチャート

\`\`\`chart
type: area
title: 売上推移
data:
  - month: 1月
    sales: 100
  - month: 2月
    sales: 150
  - month: 3月
    sales: 200
\`\`\``,
    tags: ['Tutorial', 'UI', 'Chart'],
    status: 'published',
    slideMode: true,
  },

  // 5. ターミナル再生 - Tech, published, slide mode
  {
    title: 'ターミナル再生機能デモ',
    description: 'コマンドラインの操作をアニメーション付きで表示します。',
    content: `# ターミナル再生

---

## プロジェクトセットアップ

\`\`\`terminal
$ mkdir my-project
$ cd my-project
$ npm init -y
Wrote to /my-project/package.json
$ npm install typescript
added 1 package in 2s
\`\`\`

---

## Git操作

\`\`\`terminal
$ git status
On branch main
Changes not staged for commit:
  modified: src/app/page.tsx
$ git add .
$ git commit -m "feat: update"
[main abc1234] feat: update
\`\`\`

---

## 操作方法

- **再生/一時停止**: ヘッダーボタン
- **コピー**: コマンド部分のみ
- **リプレイ**: 完了後に可能`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },

  // 6. 3Dモデルビューア - Tech, published, slide mode
  {
    title: '3Dモデルビューア機能デモ',
    description: '.glb/.gltf形式の3Dモデルをインタラクティブに表示します。',
    content: `# 3Dモデルビューア

---

## サンプルモデル

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

## 対応フォーマット

| 形式 | 説明 |
|------|------|
| .glb | バイナリ形式（推奨） |
| .gltf | JSON形式 |`,
    tags: ['Tutorial', 'UI', 'Three.js'],
    status: 'published',
    slideMode: true,
  },

  // 7. コードDiff - Tech, published, slide mode
  {
    title: 'Code Diff機能デモ',
    description: 'コードの変更差分をgit diff風に表示します。',
    content: `# Code Diff

---

## 標準diff形式

\`\`\`diff
- const message = "Hello";
+ const message = "Hello, World!";
  console.log(message);
\`\`\`

---

## YAML形式（before/after）

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

## 活用例

- コードレビューの説明
- リファクタリングの比較
- バグ修正の解説`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },

  // 8. ファイルツリー - Tech, published, slide mode
  {
    title: 'File Tree機能デモ',
    description: 'ディレクトリ構造をインタラクティブに表示します。',
    content: `# File Tree

---

## プロジェクト構造

\`\`\`tree
src/
  components/
    Button.tsx
    Card.tsx
  hooks/
    useAuth.ts
  pages/
    index.tsx
    blog/
      [slug].tsx
  utils/
    helpers.ts
package.json
tsconfig.json
\`\`\`

---

## 操作方法

- **展開/折りたたみ**: フォルダクリック
- **コピー**: ヘッダーボタン

---

## 記法

- 末尾 \`/\` → フォルダ
- それ以外 → ファイル
- インデント（2スペース）で階層`,
    tags: ['Tutorial', 'UI'],
    status: 'published',
    slideMode: true,
  },

  // 9. 脚注機能 - Books, published
  {
    title: '脚注（Footnotes）機能デモ',
    description: 'GFM形式の脚注を使って補足情報を追加できます。',
    content: `# 脚注機能

脚注は学術論文やドキュメントで補足説明を加えるのに便利です[^1]。

本文の流れを邪魔せずに、詳細な情報を提供できます[^detail]。

## 技術的な注意点

TypeScriptでは型安全性が重要です[^typescript]。

## 参照の活用例

引用や出典を明記する際にも脚注が活用できます[^citation]。

## まとめ

脚注機能を使うことで：

- 本文をすっきり保てる
- 補足情報を適切に配置できる
- 参照や出典を明記できる

[^1]: これが最初の脚注です。ページ下部にまとめて表示されます。
[^detail]: 名前付きの脚注も使えます。
[^typescript]: TypeScriptの公式ドキュメント: https://www.typescriptlang.org/docs/
[^citation]: 引用元を明記することで、情報の信頼性が向上します。`,
    tags: ['Tutorial', 'Markdown'],
    status: 'published',
  },

  // 10. 下書き記事 - Life, draft
  {
    title: '【下書き】執筆中の記事サンプル',
    description: 'これは下書き状態の記事サンプルです。公開されていません。',
    content: `# 下書き記事

この記事は **下書き状態** です。

## 確認ポイント

- [ ] 下書きフィルターで表示される
- [ ] 公開記事一覧には表示されない
- [ ] ステータスバッジが「Draft」になっている

## TODO

- 内容を追加する
- 画像を追加する
- レビューを依頼する

\`\`\`typescript
// 仮のコード
const draft = true;
\`\`\``,
    tags: ['Draft'],
    status: 'draft',
  },

  // 11. タグなし記事 - Books, published, no tags
  {
    title: 'タグなし記事のサンプル',
    description: 'タグが設定されていない記事のサンプルです。',
    content: `# タグなし記事

この記事には **タグが設定されていません**。

## 確認ポイント

- タグ欄が空または表示されない
- タグフィルターでは検索されない
- カテゴリのみで分類される

## 用途

- 分類が難しい記事
- 一時的なメモ
- テスト用途

シンプルな記事構成のテストにも使用できます。`,
    tags: [],
    status: 'published',
  },
];

async function createArticle(
  article: ArticleInput,
  categoryId?: string
): Promise<boolean> {
  try {
    const payload = categoryId ? { ...article, categoryId } : article;

    const res = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
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
  console.log('🌱 Seeding sample data (11 articles)...\n');

  // Create categories and store IDs
  console.log('📁 Creating categories...\n');
  const categoryIds: (string | null)[] = [];
  for (const category of categories) {
    const id = await createCategory(category);
    categoryIds.push(id);
  }

  const [techId, lifeId, booksId] = categoryIds;

  // Upload placeholder images for first 3 articles
  console.log('\n📷 Uploading placeholder images...\n');
  const imageIds: (string | null)[] = [];
  const NUM_IMAGES = 3;

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

  // Category assignment for articles:
  // 0: Tech (基本機能)
  // 1: Life (カルーセル)
  // 2: Tech (比較)
  // 3: Tech (チャート)
  // 4: Tech (ターミナル)
  // 5: Tech (3D)
  // 6: Tech (Diff)
  // 7: Tech (Tree)
  // 8: Books (脚注)
  // 9: Life (下書き)
  // 10: Books (タグなし)
  const articleCategories = [
    techId,
    lifeId,
    techId,
    techId,
    techId,
    techId,
    techId,
    techId,
    booksId,
    lifeId,
    booksId,
  ];

  let created = 0;
  let failed = 0;

  for (const [index, article] of articles.entries()) {
    // Assign header image to first NUM_IMAGES articles
    const headerImageId =
      index < NUM_IMAGES ? (imageIds[index] ?? undefined) : undefined;
    const categoryId = articleCategories[index] ?? undefined;

    const articleWithImage = headerImageId
      ? { ...article, headerImageId }
      : article;

    const success = await createArticle(articleWithImage, categoryId);
    if (success) created++;
    else failed++;
  }

  console.log(`\n✅ Seed completed: ${created} created, ${failed} failed`);
  console.log('\n📊 Coverage summary:');
  console.log('  - Code blocks: ✅');
  console.log('  - Mermaid diagrams: ✅');
  console.log('  - Tables: ✅');
  console.log('  - Carousel: ✅');
  console.log('  - Compare: ✅');
  console.log('  - Charts (line/bar/pie/area): ✅');
  console.log('  - Terminal: ✅');
  console.log('  - 3D Model: ✅');
  console.log('  - Code Diff: ✅');
  console.log('  - File Tree: ✅');
  console.log('  - Footnotes: ✅');
  console.log('  - Slide mode: ✅ (7 articles)');
  console.log('  - Draft status: ✅ (1 article)');
  console.log('  - Header images: ✅ (3 articles)');
  console.log('  - No tags: ✅ (1 article)');
  console.log('  - Categories: ✅ (Tech/Life/Books)');
}

seed().catch(console.error);
