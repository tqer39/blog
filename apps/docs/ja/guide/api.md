# CMS API リファレンス

このガイドでは、CMS API を使用してプログラムから記事を管理する方法を説明します。

## 認証

ヘルスチェックと公開設定を除くすべての API エンドポイントには、API キーによる認証が必要です。

### API キーの生成

1. ブログの管理画面にログイン
2. **設定** > **API キー** に移動
3. **新しいキーを生成** をクリック
4. キーをすぐにコピー - 一度しか表示されません

### API キーの使用

`Authorization` ヘッダーに API キーを含めます:

```text
Authorization: Bearer YOUR_API_KEY
```

## ベース URL

| 環境 | ベース URL |
|------|----------|
| 本番 | `https://cms-api.blog.tqer39.dev` |
| 開発 | `https://cms-api.blog-dev.tqer39.dev` |
| ローカル | `http://localhost:3101` |

## エンドポイント

### 記事

#### 記事一覧

```http
GET /v1/articles
```

**クエリパラメータ:**

| パラメータ | 型 | 説明 |
|-----------|------|-------------|
| `status` | string | ステータスでフィルタ: `draft` または `published` |
| `tag` | string | タグ名でフィルタ |
| `category` | string | カテゴリ slug でフィルタ |
| `page` | number | ページ番号 (デフォルト: 1) |
| `perPage` | number | 1ページあたりの件数 (デフォルト: 10) |

**例:**

```bash
curl -X GET "https://cms-api.blog.tqer39.dev/v1/articles?status=published&page=1&perPage=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**レスポンス:**

```json
{
  "articles": [
    {
      "id": "01H123456789ABCDEFGHIJ",
      "hash": "abc123def456",
      "title": "記事タイトル",
      "description": "記事の説明",
      "content": "# コンテンツ",
      "status": "published",
      "publishedAt": "2024-01-15T10:00:00Z",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "tags": ["tech", "typescript"],
      "categoryId": "cat_123",
      "category": { "id": "cat_123", "name": "Tech", "slug": "tech", "color": "#3b82f6" }
    }
  ],
  "total": 100,
  "page": 1,
  "perPage": 10
}
```

#### 記事取得

```http
GET /v1/articles/:hash
```

**例:**

```bash
curl -X GET "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 記事作成

```http
POST /v1/articles
```

**リクエストボディ:**

```typescript
interface ArticleInput {
  title: string;           // 必須
  content: string;         // 必須
  description?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  categoryId?: string | null;
  headerImageId?: string | null;
  slideMode?: boolean;
  slideDuration?: number | null;
}
```

**例:**

```bash
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新しい記事",
    "content": "# Hello World\n\nこれは記事の内容です。",
    "description": "簡単な説明",
    "status": "draft",
    "tags": ["tech", "tutorial"]
  }'
```

**レスポンス (201 Created):**

```json
{
  "id": "01H123456789ABCDEFGHIJ",
  "hash": "abc123def456",
  "title": "新しい記事",
  "content": "# Hello World\n\nこれは記事の内容です。",
  "description": "簡単な説明",
  "status": "draft",
  "publishedAt": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "tags": ["tech", "tutorial"],
  "categoryId": null,
  "category": null
}
```

#### 記事更新

```http
PUT /v1/articles/:hash
```

**リクエストボディ:** `ArticleInput` の部分的な更新 - 更新したいフィールドのみ含めます。

**例:**

```bash
curl -X PUT "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新されたタイトル",
    "tags": ["tech", "updated"]
  }'
```

#### 記事削除

```http
DELETE /v1/articles/:hash
```

**例:**

```bash
curl -X DELETE "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**レスポンス:**

```json
{
  "success": true
}
```

#### 記事公開

```http
POST /v1/articles/:hash/publish
```

記事のステータスを `published` に設定し、公開日時を記録します。

**例:**

```bash
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456/publish" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### 記事非公開

```http
POST /v1/articles/:hash/unpublish
```

記事のステータスを `draft` に戻します。

**例:**

```bash
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456/unpublish" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### API キー管理

#### API キーのステータス取得

```http
GET /v1/api-key/status
```

**レスポンス:**

```json
{
  "hasKey": true,
  "enabled": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### 新しい API キーを生成

```http
POST /v1/api-key/generate
```

::: warning 注意
新しいキーを生成すると、以前のキーは無効になります。
:::

**レスポンス:**

```json
{
  "key": "64文字の16進数文字列...",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### API キーを無効化

```http
POST /v1/api-key/disable
```

#### API キーを有効化

```http
POST /v1/api-key/enable
```

## エラーレスポンス

すべてのエラーは以下の形式に従います:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人間が読めるメッセージ",
    "details": {}
  }
}
```

**一般的なエラーコード:**

| コード | HTTP ステータス | 説明 |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | API キーがないか無効 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `VALIDATION_ERROR` | 400 | リクエストボディが無効 |
| `INTERNAL_ERROR` | 500 | サーバーエラー |

## レート制限

API には乱用防止のためのレート制限があります。制限を超えると `429 Too Many Requests` レスポンスが返されます。

## 使用例

### 記事の作成と公開

```bash
# 1. 下書き記事を作成
RESPONSE=$(curl -s -X POST "https://cms-api.blog.tqer39.dev/v1/articles" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "私の記事",
    "content": "# Hello\n\nここに内容を書きます。",
    "status": "draft"
  }')

# 2. hash を抽出
HASH=$(echo $RESPONSE | jq -r '.hash')

# 3. 記事を公開
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles/$HASH/publish" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### タグの一括更新

```bash
# 既存記事のタグを更新
curl -X PUT "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["new-tag-1", "new-tag-2", "new-tag-3"]
  }'
```
