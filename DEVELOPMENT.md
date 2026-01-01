# ローカル開発ガイド

## サービス一覧

| サービス       | ポート | URL                           | 説明              |
| -------------- | ------ | ----------------------------- | ----------------- |
| Blog (Next.js) | 3100   | <http://localhost:3100>       | フロントエンド    |
| Admin UI       | 3100   | <http://localhost:3100/admin> | 記事管理画面      |
| CMS API        | 8787   | <http://localhost:8787>       | バックエンド API  |
| MinIO (S3)     | 9000   | <http://localhost:9000>       | ローカル R2       |
| MinIO Console  | 9001   | <http://localhost:9001>       | MinIO 管理画面    |

## クイックスタート

```bash
# 1. セットアップ (初回のみ)
just setup

# 2. 全サービス起動
just dev-all

# 3. ブラウザでアクセス
open http://localhost:3100
```

## コマンド一覧

### 開発サーバー

| コマンド        | 説明                         |
| --------------- | ---------------------------- |
| `just dev-all`  | 全サービス起動               |
| `just dev-blog` | ブログのみ起動               |
| `just dev-api`  | CMS API のみ起動             |

### Docker (MinIO)

| コマンド           | 説明       |
| ------------------ | ---------- |
| `just docker-up`   | MinIO 起動 |
| `just docker-down` | MinIO 停止 |

### データベース

| コマンド                | 説明                |
| ----------------------- | ------------------- |
| `just db-migrate-local` | D1 migration (local)|

### コード品質

| コマンド      | 説明                      |
| ------------- | ------------------------- |
| `just lint`   | Biome でリント            |
| `just format` | Biome でフォーマット      |
| `just check`  | Biome でチェック          |
| `prek run -a` | 全 pre-commit フック実行  |

### ビルド・テスト

| コマンド      | 説明               |
| ------------- | ------------------ |
| `pnpm build`  | 全パッケージビルド |
| `just e2e`    | E2E テスト実行     |
| `just e2e-ui` | E2E テスト (UI)    |

## 環境変数

### Blog (apps/blog)

| 変数名        | 説明       | デフォルト                 |
| ------------- | ---------- | -------------------------- |
| `CMS_API_URL` | API の URL | `http://localhost:8787/v1` |
| `CMS_API_KEY` | API キー   | (なし)                     |

### CMS API (apps/cms-api)

| 変数名                   | 説明             | デフォルト    |
| ------------------------ | ---------------- | ------------- |
| `ENVIRONMENT`            | 環境名           | `development` |
| `API_KEY`                | API 認証キー     | `dev-api-key` |
| `VERCEL_DEPLOY_HOOK_URL` | デプロイフック   | (なし)        |

## 初期データ投入

既存の Markdown ファイルを CMS に移行:

```bash
# CMS API が起動している状態で
cd apps/blog
pnpm migrate
```

## MinIO (ローカル R2)

### アクセス情報

- **Console URL**: <http://localhost:9001>
- **Username**: `minioadmin`
- **Password**: `minioadmin`
- **Bucket**: `blog-images`

### 画像 URL

ローカル環境での画像 URL:

```text
http://localhost:9000/blog-images/{path}
```

## トラブルシューティング

### ポートが使用中

```bash
# 使用中のポートを確認
lsof -i :3100
lsof -i :8787
lsof -i :9000

# プロセスを終了
kill -9 <PID>
```

### D1 データベースをリセット

```bash
rm -rf apps/cms-api/.wrangler
just db-migrate-local
```

### MinIO データをリセット

```bash
docker-compose down -v
just docker-up
```
