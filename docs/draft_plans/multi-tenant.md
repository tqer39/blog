# Multi-Tenant SaaS Blog Platform (zakki.app) Implementation Plan

## Overview

Personal blog を note/medium/zenn のようなマルチテナント SaaS ブログプラットフォームに変換する。

### Target Architecture

```text
zakki.app                    - ランディング/認証
{user}.zakki.app             - ユーザーダッシュボード
{site}.{user}.zakki.app      - 個別ブログサイト
api.zakki.app                - CMS API
blog.tqer39.dev              - カスタムドメイン (CNAME)
```

### Key Requirements

| 要件 | 実装方針 |
| ------ | ---------- |
| 認証 | OAuth (Google, GitHub) + Email/Password |
| サイト数 | 1ユーザー複数サイト可 |
| 検索 | D1 FTS5 (SQLite 全文検索) |
| 課金 | Stripe フリーミアム |
| カスタムドメイン | Cloudflare for SaaS |
| 広告 | AdSense 対応 |

---

## Phase 1: Database Schema (Foundation)

### New Tables

**Migration: `003_multi_tenant.sql`**

```sql
-- 1. Users (テナント)
CREATE TABLE users (
  id TEXT PRIMARY KEY,                    -- ULID
  email TEXT UNIQUE NOT NULL,
  email_verified_at DATETIME,
  password_hash TEXT,                     -- nullable for OAuth-only
  slug TEXT UNIQUE NOT NULL,              -- URL: {slug}.zakki.app
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. OAuth Accounts
CREATE TABLE oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider, provider_account_id)
);

-- 3. Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                    -- random token
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sites (ブログ)
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                     -- URL: {slug}.{user}.zakki.app
  name TEXT NOT NULL,
  description TEXT,
  adsense_publisher_id TEXT,
  adsense_enabled INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, slug)
);

-- 5. Custom Domains
CREATE TABLE custom_domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  domain TEXT UNIQUE NOT NULL,
  verified_at DATETIME,
  ssl_status TEXT DEFAULT 'pending',
  cf_hostname_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Plans
CREATE TABLE plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stripe_price_id TEXT UNIQUE,
  article_limit INTEGER,
  storage_limit_mb INTEGER,
  custom_domain_limit INTEGER,
  sites_limit INTEGER,
  adsense_enabled INTEGER DEFAULT 0,
  price_monthly INTEGER
);

-- 7. Subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  current_period_end DATETIME
);
```

### Modify Existing Tables

```sql
-- Add site_id to existing tables
ALTER TABLE articles ADD COLUMN site_id TEXT REFERENCES sites(id);
ALTER TABLE categories ADD COLUMN site_id TEXT REFERENCES sites(id);
ALTER TABLE tags ADD COLUMN site_id TEXT REFERENCES sites(id);
ALTER TABLE images ADD COLUMN site_id TEXT REFERENCES sites(id);

-- Unique constraints per site
CREATE UNIQUE INDEX idx_categories_site_slug ON categories(site_id, slug);
CREATE UNIQUE INDEX idx_tags_site_name ON tags(site_id, name);
```

### FTS5 Search

**Migration: `004_fts.sql`**

```sql
CREATE VIRTUAL TABLE articles_fts USING fts5(
  title, content, description,
  content='articles',
  content_rowid='rowid',
  tokenize='unicode61'
);

-- Sync triggers
CREATE TRIGGER articles_fts_insert AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, content, description)
  VALUES (NEW.rowid, NEW.title, NEW.content, NEW.description);
END;

CREATE TRIGGER articles_fts_update AFTER UPDATE ON articles BEGIN
  INSERT INTO articles_fts(articles_fts, rowid, title, content, description)
  VALUES ('delete', OLD.rowid, OLD.title, OLD.content, OLD.description);
  INSERT INTO articles_fts(rowid, title, content, description)
  VALUES (NEW.rowid, NEW.title, NEW.content, NEW.description);
END;
```

### Critical Files

- `apps/cms-api/migrations/003_multi_tenant.sql` (new)
- `apps/cms-api/migrations/004_fts.sql` (new)
- `packages/cms-types/src/index.ts` (add new types)
- `apps/cms-api/src/types/rows.ts` (add row types)

---

## Phase 2: Authentication

### Session-Based Auth

Replace API key auth with database-backed sessions.

```typescript
// apps/cms-api/src/middleware/session.ts
export async function sessionMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'zakki_session');
  if (!token) return unauthorized();

  const sql = `SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > ?`;
  const session = await db.prepare(sql).bind(token, now()).first();

  if (!session) return unauthorized();
  c.set('auth', { userId: session.user_id, user: session });
  await next();
}
```

### OAuth Implementation

```text
/api/auth/login/google     - Initiate OAuth
/api/auth/login/github     - Initiate OAuth
/api/auth/callback/google  - Handle callback
/api/auth/callback/github  - Handle callback
/api/auth/signup           - Email registration
/api/auth/login            - Email login
/api/auth/logout           - Clear session
```

### Password Hashing

Use Web Crypto API (PBKDF2) for Workers compatibility.

```typescript
// packages/utils/src/password.ts
export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(password: string, stored: string): Promise<boolean>
```

### Critical Files (Phase 2)

- `apps/cms-api/src/middleware/session.ts` (new)
- `apps/cms-api/src/handlers/auth.ts` (new)
- `apps/blog/src/app/api/auth/[...nextauth]/route.ts` (new)
- `packages/utils/src/password.ts` (new)
- `apps/cms-api/src/middleware/auth.ts` (modify)

---

## Phase 3: Multi-Tenant Routing

### URL Resolution

```typescript
// apps/cms-api/src/lib/tenant.ts
interface TenantContext {
  userSlug: string | null;
  siteSlug: string | null;
  customDomain: string | null;
}

function parseTenantFromHost(host: string): TenantContext {
  // blog.tqer39.zakki.app -> { siteSlug: 'blog', userSlug: 'tqer39' }
  // tqer39.zakki.app -> { userSlug: 'tqer39', siteSlug: null }
  // blog.tqer39.dev -> { customDomain: 'blog.tqer39.dev' }
}
```

### Next.js Middleware

```typescript
// apps/blog/src/middleware.ts
export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const tenant = parseTenantFromHost(host);

  if (tenant.customDomain) {
    const site = await resolveSiteByDomain(tenant.customDomain);
    // Inject site context
  }

  // Inject x-user-slug, x-site-slug headers
}

export const config = {
  matcher: ['/((?!_next|api|static).*)'],
};
```

### Tenant Middleware (API)

```typescript
// apps/cms-api/src/middleware/tenant.ts
export async function tenantMiddleware(c: Context, next: Next) {
  const siteId = c.req.header('X-Site-Id');
  const site = await resolveSite(c, siteId);

  // Authorization check for write operations
  if (c.req.method !== 'GET') {
    const auth = c.get('auth');
    if (site.userId !== auth.userId) return forbidden();
  }

  c.set('site', site);
  await next();
}
```

### Critical Files (Phase 3)

- `apps/cms-api/src/lib/tenant.ts` (new)
- `apps/cms-api/src/middleware/tenant.ts` (new)
- `apps/blog/src/middleware.ts` (rewrite)
- `apps/cms-api/src/handlers/articles.ts` (add site_id filter)

---

## Phase 4: Billing (Stripe)

### Plan Tiers

| Feature | Free | Pro ($9/mo) | Business ($29/mo) |
| ------- | ---- | ----------- | ----------------- |
| 記事数 | 10 | 100 | Unlimited |
| ストレージ | 100MB | 2GB | 20GB |
| カスタムドメイン | 0 | 1 | 5 |
| AdSense | No | Yes | Yes |
| サイト数 | 1 | 3 | 10 |

### API Endpoints

```text
POST /v1/billing/checkout     - Create checkout session
POST /v1/billing/portal       - Customer portal
GET  /v1/billing/subscription - Current subscription
POST /v1/webhooks/stripe      - Webhook handler
```

### Webhook Events

- `checkout.session.completed` - 新規契約
- `customer.subscription.updated` - プラン変更
- `customer.subscription.deleted` - キャンセル

### Usage Limit Middleware

```typescript
// apps/cms-api/src/middleware/usage.ts
export async function usageLimitMiddleware(c: Context, next: Next) {
  if (c.req.method === 'GET') return next();

  const plan = await getUserPlan(c);
  if (c.req.path.includes('/articles') && c.req.method === 'POST') {
    const count = await getArticleCount(c);
    if (plan.articleLimit && count >= plan.articleLimit) {
      return forbidden('Article limit reached');
    }
  }
  await next();
}
```

### Critical Files (Phase 4)

- `apps/cms-api/src/handlers/billing.ts` (new)
- `apps/cms-api/src/handlers/webhooks/stripe.ts` (new)
- `apps/cms-api/src/middleware/usage.ts` (new)
- `packages/config/src/plans.ts` (new)

---

## Phase 5: Infrastructure

### DNS Configuration (Terraform)

```hcl
# zakki.app zone
resource "cloudflare_dns_record" "api" {
  name    = "api"
  type    = "CNAME"
  content = "cms-api.zakki.workers.dev"
  proxied = true
}

resource "cloudflare_dns_record" "wildcard" {
  name    = "*"
  type    = "CNAME"
  content = "cname.vercel-dns.com"
  proxied = false
}

resource "cloudflare_dns_record" "double_wildcard" {
  name    = "*.*"
  type    = "CNAME"
  content = "cname.vercel-dns.com"
  proxied = false
}
```

### Cloudflare for SaaS (Custom Domains)

```hcl
resource "cloudflare_custom_hostname" "saas" {
  zone_id  = var.zakki_zone_id
  hostname = "*.zakki.app"
  ssl {
    method = "http"
    type   = "dv"
  }
}
```

### Vercel Configuration

```json
// apps/blog/vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Environment Variables

```bash
# OAuth
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

# Stripe
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# Session
SESSION_SECRET (32 bytes random)
```

### Critical Files (Phase 5)

- `infra/terraform/envs/saas/main.tf` (new)
- `infra/terraform/modules/cloudflare-saas/main.tf` (new)
- `apps/blog/vercel.json` (modify)
- `packages/config/src/constants.ts` (add zakki.app domains)

---

## Phase 6: Migration

### Migrate Existing Data

```sql
-- Create default user for existing data
INSERT INTO users (id, email, name, slug)
VALUES ('usr_tqer39', 'admin@tqer39.dev', 'tqer39', 'tqer39');

-- Create default site
INSERT INTO sites (id, user_id, slug, name)
VALUES ('site_tqer39_blog', 'usr_tqer39', 'blog', 'tB');

-- Backfill site_id
UPDATE articles SET site_id = 'site_tqer39_blog';
UPDATE categories SET site_id = 'site_tqer39_blog';
UPDATE tags SET site_id = 'site_tqer39_blog';
UPDATE images SET site_id = 'site_tqer39_blog';

-- Register custom domain
INSERT INTO custom_domains (id, site_id, domain, verified_at, ssl_status)
VALUES (
  'dom_tqer39', 'site_tqer39_blog', 'blog.tqer39.dev',
  CURRENT_TIMESTAMP, 'active'
);
```

---

## Implementation Order

1. **Phase 1**: Database schema migration (1-2 weeks)
2. **Phase 2**: Authentication system (1-2 weeks)
3. **Phase 3**: Multi-tenant routing (2 weeks)
4. **Phase 4**: Billing integration (1-2 weeks)
5. **Phase 5**: Infrastructure setup (1 week)
6. **Phase 6**: Data migration & launch (1 week)

---

## Verification

### Unit Tests

```bash
pnpm test
```

### Integration Tests

1. ユーザー登録 (OAuth + Email)
2. サイト作成・設定
3. 記事 CRUD (site_id スコープ)
4. 全文検索
5. カスタムドメイン設定
6. Stripe checkout/webhook

### E2E Tests (Playwright)

```bash
pnpm -F @blog/web test:e2e
```

1. `zakki.app` でサインアップ
2. `{user}.zakki.app` でダッシュボード表示
3. `blog.{user}.zakki.app` でブログ表示
4. カスタムドメインでアクセス

### Local Development

```bash
# Start all services
just dev

# Test subdomain routing (add to /etc/hosts)
127.0.0.1 zakki.local
127.0.0.1 tqer39.zakki.local
127.0.0.1 blog.tqer39.zakki.local
```
