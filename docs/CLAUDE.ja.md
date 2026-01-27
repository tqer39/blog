# CLAUDE.md

[🇺🇸 English](../CLAUDE.md)

このファイルは、Claude Code (claude.ai/code) がこのリポジトリのコードを扱う際の
ガイダンスを提供します。

## ブログの設計思想

### 目的

- あとで読み返す自分のためのログ（一般読者向けではない）
- 公開はしているが、他人への価値は副産物
- バズ狙い・一般読者への最適化は一切しない

### 想定読者

- 数ヶ月〜数年後の自分
- 思い出したいこと：当時の判断理由・感情・文脈
- 必要なもの：結論と「なぜそうしたか」を最短で知る

### 記事カテゴリ

| カテゴリ | 性質     | テンプレート                        |
| -------- | -------- | ----------------------------------- |
| Tech     | 判断ログ | 結論 → 前提 → 却下 → 実装           |
| Life/PTA | 経験ログ | 出来事 → 感情 → 構造 → 行動メモ     |
| Books    | 思考ログ | 読んだ理由 → 印象 → 変化 → メモ     |

すべての記事は「過去の自分へ」。愚痴は OK だが、気づきで締める。

### URL 設計

- 形式：`/articles/{ULID}`（slug は使わない）
- タイトル・カテゴリ・内容を変えても URL は永久固定
- ULID：26 文字、時刻順ソート可能

### UI 方針

- デザイン：「メモ帳 + インデックス」
- 派手さ不要、可読性最優先
- コードブロックは折りたたみ可能
- 1 スクロール = 1 トピック

### やらないこと

- コンテンツレベルの SEO（キーワード詰め込み、釣りタイトル）
- 一般読者向けの丁寧すぎる説明
- SNS 拡散前提の設計
- 反応数・アクセス数の監視

### 技術 SEO（許容）

- 構造化データ（JSON-LD）による検索エンジンへの正確な情報提供
- 記事・ページの適切なメタデータ
- 正規 URL とサイトマップの維持管理
- robots.txt の設定

## プロジェクト概要

Turborepo + pnpm workspaces で管理された個人ブログサービスのモノレポです。

- **システムアーキテクチャ**: 包括的な設計決定とデータフローについては [ARCHITECTURE.ja.md](ARCHITECTURE.ja.md) 参照
- **ディレクトリ構造**: [README.ja.md](README.ja.md) 参照
- **開発コマンド**: `just --list` を実行
- **GitHub Secrets**: [SECRETS.ja.md](SECRETS.ja.md) 参照

## 環境とデプロイ

**クイックリファレンス**:
- Local: `localhost:3100` (blog), `localhost:3101` (API)
- Dev: `blog-dev.tqer39.dev`
- Prod: `blog.tqer39.dev`

**詳細ドキュメント**: [ARCHITECTURE.ja.md](ARCHITECTURE.ja.md) を参照:
- 3環境構成と設定
- CI/CDとリリースフロー
- 認証レイヤー（Basic認証、APIキー、パスワード）
- デプロイアーキテクチャ

## 技術スタック

**コア**:
- Next.js 15 (App Router) + Hono + Cloudflare (D1/R2/Workers)
- TypeScript + Tailwind CSS + Turborepo + pnpm

**詳細ドキュメント**: 完全な技術スタックとアーキテクチャ決定については [ARCHITECTURE.ja.md](ARCHITECTURE.ja.md) を参照。

## Claude Code Skills

Skills は `.claude/skills/` に格納される Claude Code の再利用可能な指示です。

### Skills の作成

新しい Skills を作成する際は、テンプレートに従ってください: [SKILL-TEMPLATE.md](SKILL-TEMPLATE.md)

**主要な要件:**

1. **name**: 小文字、数字、ハイフンのみ（最大64文字）
   - 動名詞形を推奨: `creating-issues`, `processing-pdfs`
2. **description**: 機能と使用条件を三人称で記述
   - 良い例:「GitHub Issueを作成する。タスクを認識した際に使用。」
   - 悪い例:「Issueに役立つ」
3. **SKILL.md本文**: 500行以下に保つ
4. **参照**: 1レベルの深さまで（ネストした参照は避ける）

### ディレクトリ構造

```text
.claude/skills/
├── skill-name/
│   ├── SKILL.md          # メイン指示
│   ├── REFERENCE.md      # 追加詳細（オプション）
│   └── scripts/          # ユーティリティスクリプト（オプション）
```

### ベストプラクティス参照

参照: [Claude Platform - Agent Skills Best Practices](https://platform.claude.com/docs/ja/agents-and-tools/agent-skills/best-practices)
