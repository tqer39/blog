# CMS API Reference

This guide explains how to use the CMS API to manage articles programmatically.

## Authentication

All API endpoints (except health check and public settings) require authentication using an API key.

### Generating an API Key

1. Log in to your blog's admin panel
2. Navigate to **Settings** > **API Keys**
3. Click **Generate New Key**
4. Copy the key immediately - it will only be shown once

### Using the API Key

Include the API key in the `Authorization` header:

```text
Authorization: Bearer YOUR_API_KEY
```

## Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://cms-api.blog.tqer39.dev` |
| Development | `https://cms-api.blog-dev.tqer39.dev` |
| Local | `http://localhost:3101` |

## Endpoints

### Articles

#### List Articles

```http
GET /v1/articles
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `draft` or `published` |
| `tag` | string | Filter by tag name |
| `category` | string | Filter by category slug |
| `page` | number | Page number (default: 1) |
| `perPage` | number | Items per page (default: 10) |

**Example:**

```bash
curl -X GET "https://cms-api.blog.tqer39.dev/v1/articles?status=published&page=1&perPage=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "articles": [
    {
      "id": "01H123456789ABCDEFGHIJ",
      "hash": "abc123def456",
      "title": "My Article",
      "description": "Article description",
      "content": "# Content here",
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

#### Get Article

```http
GET /v1/articles/:hash
```

**Example:**

```bash
curl -X GET "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Create Article

```http
POST /v1/articles
```

**Request Body:**

```typescript
interface ArticleInput {
  title: string;           // Required
  content: string;         // Required
  description?: string;
  status?: 'draft' | 'published';
  tags?: string[];
  categoryId?: string | null;
  headerImageId?: string | null;
  slideMode?: boolean;
  slideDuration?: number | null;
}
```

**Example:**

```bash
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Article",
    "content": "# Hello World\n\nThis is my article content.",
    "description": "A brief description",
    "status": "draft",
    "tags": ["tech", "tutorial"]
  }'
```

**Response (201 Created):**

```json
{
  "id": "01H123456789ABCDEFGHIJ",
  "hash": "abc123def456",
  "title": "My New Article",
  "content": "# Hello World\n\nThis is my article content.",
  "description": "A brief description",
  "status": "draft",
  "publishedAt": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "tags": ["tech", "tutorial"],
  "categoryId": null,
  "category": null
}
```

#### Update Article

```http
PUT /v1/articles/:hash
```

**Request Body:** Partial `ArticleInput` - only include fields you want to update.

**Example:**

```bash
curl -X PUT "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "tags": ["tech", "updated"]
  }'
```

#### Delete Article

```http
DELETE /v1/articles/:hash
```

**Example:**

```bash
curl -X DELETE "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**

```json
{
  "success": true
}
```

#### Publish Article

```http
POST /v1/articles/:hash/publish
```

Sets the article status to `published` and records the publish timestamp.

**Example:**

```bash
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456/publish" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Unpublish Article

```http
POST /v1/articles/:hash/unpublish
```

Sets the article status back to `draft`.

**Example:**

```bash
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456/unpublish" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### API Key Management

#### Get API Key Status

```http
GET /v1/api-key/status
```

**Response:**

```json
{
  "hasKey": true,
  "enabled": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### Generate New API Key

```http
POST /v1/api-key/generate
```

::: warning
Generating a new key will invalidate the previous key.
:::

**Response:**

```json
{
  "key": "64-character-hex-string...",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### Disable API Key

```http
POST /v1/api-key/disable
```

#### Enable API Key

```http
POST /v1/api-key/enable
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Common Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the limit, you'll receive a `429 Too Many Requests` response.

## Example Workflows

### Create and Publish an Article

```bash
# 1. Create a draft article
RESPONSE=$(curl -s -X POST "https://cms-api.blog.tqer39.dev/v1/articles" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Article",
    "content": "# Hello\n\nContent here.",
    "status": "draft"
  }')

# 2. Extract the hash
HASH=$(echo $RESPONSE | jq -r '.hash')

# 3. Publish the article
curl -X POST "https://cms-api.blog.tqer39.dev/v1/articles/$HASH/publish" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Batch Update Tags

```bash
# Update tags for an existing article
curl -X PUT "https://cms-api.blog.tqer39.dev/v1/articles/abc123def456" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["new-tag-1", "new-tag-2", "new-tag-3"]
  }'
```
