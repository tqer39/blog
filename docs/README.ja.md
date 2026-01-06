# tqer39's Blog

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![codecov](https://img.shields.io/codecov/c/github/tqer39/blog?style=for-the-badge&logo=codecov&logoColor=white)](https://codecov.io/gh/tqer39/blog)
[![CI](https://img.shields.io/github/actions/workflow/status/tqer39/blog/ci.yml?branch=main&style=for-the-badge&logo=github&label=CI)](https://github.com/tqer39/blog/actions/workflows/ci.yml)
[![Terraform](https://img.shields.io/github/actions/workflow/status/tqer39/blog/terraform-dev.yml?branch=main&style=for-the-badge&logo=terraform&label=terraform)](https://github.com/tqer39/blog/actions/workflows/terraform-dev.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)

[🇺🇸 English](../README.md)

Next.js、Hono、Cloudflare で構築された個人ブログです。

## 前提条件

- [Homebrew](https://brew.sh/)
- [mise](https://mise.jdx.dev/)（Homebrew でインストール）
- macOS または Linux

## クイックスタート

```bash
# 1. システム依存関係をインストール
make bootstrap

# 2. 開発環境をセットアップ
just setup

# 3. フルセットアップ（依存関係、DB リセット、マイグレーション、シード）
just bootstrap

# 4. 開発サーバーを起動（別々のターミナルで）
just dev-api   # CMS API: http://localhost:8787
just dev-blog  # Blog: http://localhost:3100

# 5. ブログにアクセス
open http://localhost:3100
```

## ドキュメント

- [開発ガイド](DEVELOPMENT.ja.md) - 詳細なローカル開発手順
- [Claude Code ガイド](CLAUDE.ja.md) - AI アシスタント向けガイダンス

## 技術スタック

| コンポーネント | 技術                         |
| -------------- | ---------------------------- |
| フロントエンド | Next.js 15（App Router）     |
| バックエンド   | Hono on Cloudflare Workers   |
| データベース   | Cloudflare D1（SQLite）      |
| ストレージ     | Cloudflare R2                |
| スタイリング   | Tailwind CSS                 |
| モノレポ       | Turborepo + pnpm             |
| IaC            | Terraform                    |
| CI/CD          | GitHub Actions               |

## プロジェクト構成

```text
apps/
├── blog/       # Next.js ブログアプリケーション
└── cms-api/    # Hono CMS API

packages/
├── cms-types/  # 共有 TypeScript 型
├── ui/         # 共有 UI コンポーネント
├── config/     # 共有設定
└── utils/      # 共有ユーティリティ
```

## ライセンス

MIT
