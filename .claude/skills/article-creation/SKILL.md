---
name: article-creation
description: 新規ブログ記事の作成。「記事を書きたい」「新しい記事を作成」「ブログ投稿」などのリクエスト時に使用。
---

# Article Creation

新規 Markdown 記事を作成するスキル。

## 投稿方法

2つの方法がある。CMS API（推奨）を優先し、API が利用できない場合はファイル直接作成を使用。

| 方法 | 説明 | 利用シーン |
| --- | --- | --- |
| CMS API（推奨） | API 経由で記事を投稿 | `just dev-api` で API 起動済み |
| ファイル直接作成 | Markdown ファイルを直接配置 | API が利用できない場合のフォールバック |

## 環境変数

`.envrc.local` に設定（direnv で自動読込）:

```bash
# .envrc.local.example をコピーして設定
cp .envrc.local.example .envrc.local
# 値を編集
vim .envrc.local
# direnv を許可
direnv allow
```

| 変数名 | 説明 | 例 |
| --- | --- | --- |
| `SKILL_CMS_API_URL` | CMS API エンドポイント | `https://cms-api.tqer39.dev/v1` |
| `SKILL_CMS_API_KEY` | CMS API 認証キー | Cloudflare Workers から取得 |

## 方法1: CMS API 経由（推奨）

### ArticleInput 型

```typescript
{
  title: string;                    // 必須
  content: string;                  // 必須（Markdown 本文）
  description?: string;             // SEO 用説明文
  status?: 'draft' | 'published';   // デフォルト: draft
  tags?: string[];                  // タグ配列
  categoryId?: string | null;       // カテゴリ ID
}
```

### API エンドポイント

| メソッド | エンドポイント | 用途 |
| --- | --- | --- |
| POST | `/articles` | 記事作成 |
| POST | `/articles/{hash}/publish` | 公開 |
| POST | `/articles/{hash}/unpublish` | 下書きに戻す |

### 記事作成コマンド

```bash
curl -X POST "${SKILL_CMS_API_URL}/articles" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${SKILL_CMS_API_KEY}" \
  -d '{
    "title": "記事タイトル",
    "content": "## はじめに\n\n本文をここに...",
    "description": "SEO用の記事説明",
    "status": "draft",
    "tags": ["Tag1", "Tag2"]
  }'
```

レスポンス例:

```json
{
  "success": true,
  "data": {
    "hash": "01JKABCD1234567890ABCDEF",
    "title": "記事タイトル",
    "status": "draft"
  }
}
```

### 記事公開コマンド

```bash
curl -X POST "${SKILL_CMS_API_URL}/articles/{hash}/publish" \
  -H "X-API-Key: ${SKILL_CMS_API_KEY}"
```

### 下書きに戻すコマンド

```bash
curl -X POST "${SKILL_CMS_API_URL}/articles/{hash}/unpublish" \
  -H "X-API-Key: ${SKILL_CMS_API_KEY}"
```

### 手順（CMS API）

1. ユーザーからタイトル・テーマを確認
2. 適切なタグを提案
3. 記事コンテンツを Markdown で作成
4. curl で `status: "draft"` として投稿
5. レスポンスの `hash` を確認
6. ユーザー確認後、publish エンドポイントで公開

## 方法2: ファイル直接作成（フォールバック）

CMS API が利用できない場合に使用。

### 記事の配置場所

```text
apps/blog/src/contents/YYYY-MM-DD-slug.md
```

### ファイル名規則

- 形式: `YYYY-MM-DD-slug.md`
- slug: 英数字とハイフンのみ（例: `hello-world`, `nextjs-tips`）
- 日付: 記事の公開日

### Front-matter 構造

```yaml
---
title: "記事タイトル"
date: "YYYY-MM-DD"
published: true
tags: ["Tag1", "Tag2"]
description: "SEO用の記事説明（100-160文字程度）"
---
```

#### フィールド説明

| フィールド    | 必須 | 説明                                 |
| ------------- | ---- | ------------------------------------ |
| title         | Yes  | 記事タイトル（日本語可）             |
| date          | Yes  | 公開日（YYYY-MM-DD形式）             |
| published     | Yes  | true: 公開 / false: 下書き           |
| tags          | Yes  | タグの配列（2-5個推奨）              |
| description   | Yes  | SEO用説明文                          |

### 記事テンプレート

```markdown
---
title: "タイトル"
date: "YYYY-MM-DD"
published: false
tags: ["Tag"]
description: "説明"
---

## はじめに

導入文をここに。

## 本文

メインコンテンツ。

### コード例

\`\`\`typescript:example.ts
// コード例
\`\`\`

### 図表（Mermaid）

\`\`\`mermaid
graph TD
    A[開始] --> B[終了]
\`\`\`

## まとめ

締めくくり。
```

### 手順（ファイル直接作成）

1. ユーザーからタイトル・テーマを確認
2. slug を提案（英語、ハイフン区切り）
3. 適切なタグを提案
4. テンプレートから記事ファイルを作成
5. `published: false` で作成（ユーザー確認後、true へ変更）
6. `just lint` を実行してエラーがないことを確認

## 注意事項

- 日本語と英語の混在可
- コードブロックにはファイル名を付ける（`:filename.ext`）
- Mermaid 図は適宜活用
- 画像は `/public/images/` に配置し `/images/xxx.png` で参照
