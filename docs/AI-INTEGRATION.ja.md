# AI 活用ガイド

[English version](AI-INTEGRATION.md)

本ドキュメントでは、ブログプロジェクトにおけるAI活用の全体像を
説明します。開発ワークフローの自動化とブログサービス機能の
両方をカバーしています。

## 概要

### 使用しているAIサービス

| サービス    | プロバイダー | 用途                           |
| ----------- | ------------ | ------------------------------ |
| Claude      | Anthropic    | コンテンツ支援、記事レビュー   |
| GPT-4o-mini | OpenAI       | PR説明文生成、メタデータ生成   |
| Gemini      | Google       | ヘッダー画像生成               |

### 必要なAPIキー

| シークレット        | サービス   | 使用箇所                         |
| ------------------- | ---------- | -------------------------------- |
| `ANTHROPIC_API_KEY` | Claude API | CMS API（レビュー、続き提案）    |
| `OPENAI_API_KEY`    | OpenAI API | GitHub Actions、CMS API          |
| `GEMINI_API_KEY`    | Google AI  | CMS API（画像生成）              |

---

## Part 1: 開発ワークフロー

### 1.1 PR説明文の自動生成

**ワークフロー**: `.github/workflows/generate-pr-description.yml`

プルリクエストの作成・更新時に、日本語のタイトルと説明文を
自動生成します。

- **モデル**: GPT-4o-mini
- **トリガー**: `main`ブランチへのPR作成・同期
- **アクション**: `tqer39/openai-generate-pr-description@v1.0.5`
- **除外**: ボットPR（renovate, tqer39-apps）

### 1.2 Claude Code

Claude Codeは本プロジェクトの主要なAI支援開発ツールです。

**設定ファイル**: `CLAUDE.md`（プロジェクトルート）

主な機能:

- コード生成・リファクタリング
- バグ分析・修正
- ドキュメント作成
- テスト作成
- アーキテクチャ設計支援

**モデル**: Claude Opus 4.5

### 1.3 Claude Code スキル

`.claude/skills/` ディレクトリに定義されたカスタムワークフロー:

| スキル               | 用途                             |
| -------------------- | -------------------------------- |
| `article-creation`   | 適切な構造で新規ブログ記事を作成 |
| `unit-test`          | Vitestテストを生成               |
| `architecture-design`| システムアーキテクチャを設計     |
| `release-notes`      | gitから変更履歴を生成            |
| `markdown-lint`      | Markdownファイルを検証           |
| `security`           | セキュリティレビューチェック     |
| `document-secrets`   | シークレットのドキュメント管理   |
| `translate-docs`     | ドキュメント翻訳（EN/JA）        |
| `rebase-main`        | git rebaseのコンフリクト解消     |
| `reorganize-docs`    | バイリンガルドキュメントの整理   |

### 1.4 MCP サーバー

Model Context Protocolサーバーによる拡張機能:

| サーバー   | 用途                               |
| ---------- | ---------------------------------- |
| `serena`   | コードナビゲーション、シンボル解析 |
| `context7` | ライブラリドキュメント検索         |

**設定**: `.claude/settings.local.json`

---

## Part 2: ブログサービスのAI機能

すべてのAI機能はCMS API（`apps/cms-api/src/handlers/ai.ts`）に
実装され、ブログフロントエンドから利用できます。

### 2.1 コンテンツ作成支援

#### 続き提案（Continuation Suggestions）

カーソル位置から続きの文章を提案します。

- **エンドポイント**: `POST /ai/suggest-continuation`
- **モデル**: Claude Sonnet 4
- **機能**:
  - 信頼度スコア付きの3つの提案
  - 長さオプション: 短い（30-100）、中（100-300）、長い（300-600）文字
  - コンテキスト認識: カーソル前2000文字 + 後500文字を抽出
- **UI**: Popoverで提案表示、キーボードショートカット（Cmd+J）

#### アウトライン生成（Outline Generation）

タイトルとカテゴリから記事構成を生成します。

- **エンドポイント**: `POST /ai/generate-outline`
- **モデル**: Claude Sonnet 4
- **カテゴリ別テンプレート**:
  - **Tech**: 結論 -> 前提 -> 却下した選択肢 -> 実装
  - **Life**: 出来事の概要 -> 感情 -> 構造 -> 行動メモ
  - **Books**: なぜ読んだか -> 印象 -> 変化 -> メモ
- **出力**: H2/H3見出し付きのMarkdown形式アウトライン

#### テキスト変換（Text Transformation）

選択したテキストを様々なアクションで変換します。

- **エンドポイント**: `POST /ai/transform-text`
- **モデル**: Claude Sonnet 4
- **アクション**:
  - `rewrite` - 簡潔で明確に書き直す
  - `expand` - 詳細と例を追加
  - `summarize` - 内容を要約
  - `translate` - 日本語 <-> 英語
  - `formal` - フォーマルな文体に変換
  - `casual` - カジュアルな文体に変換
- **UI**: テキスト選択時にフローティングツールバー（Notion風）

### 2.2 メタデータ & SEO

#### メタデータ生成

SEO最適化されたdescriptionとタグを生成します。

- **エンドポイント**: `POST /ai/generate-metadata`
- **モデル**: GPT-4o-mini
- **出力**:
  - Description: 100-160文字、SEO最適化
  - Tags: 3-5個の関連タグ、小文字、ハイフン区切り
- **機能**: 記事の言語を自動検出、既存タグを優先

### 2.3 ビジュアルコンテンツ

#### ヘッダー画像生成

OGP準拠のヘッダー画像を生成します。

- **エンドポイント**: `POST /ai/generate-image`
- **モデル**: `gemini-2.5-flash-image`、`gemini-3-pro-image-preview`
- **仕様**: 1200x630px PNG/JPEG（OG画像標準）
- **ストレージ**: Cloudflare R2（メタデータはD1データベース）

### 2.4 品質保証

#### 記事レビュー

包括的な記事分析とフィードバックを提供します。

- **エンドポイント**: `POST /ai/review-article`
- **モデル**: Claude Sonnet 4
- **レビューカテゴリ**:
  - `clarity` - 論理的な流れ、読みやすさ
  - `structure` - 段落構成、見出しの使い方
  - `accuracy` - 技術的正確性
  - `grammar` - 誤字脱字、文法エラー
  - `style` - 一貫性、冗長性
- **出力**:
  - 総合スコア（1-10）
  - サマリー評価
  - 重要度別（info/warning/error）の詳細フィードバック

---

## APIリファレンス

### エンドポイント一覧

| エンドポイント            | メソッド | モデル         | 用途             |
| ------------------------- | -------- | -------------- | ---------------- |
| `/ai/generate-metadata`   | POST     | GPT-4o-mini    | description+tags |
| `/ai/generate-image`      | POST     | Gemini         | ヘッダー画像     |
| `/ai/review-article`      | POST     | Claude Sonnet  | 記事レビュー     |
| `/ai/suggest-continuation`| POST     | Claude Sonnet  | 続き提案         |
| `/ai/generate-outline`    | POST     | Claude Sonnet  | アウトライン     |
| `/ai/transform-text`      | POST     | Claude Sonnet  | テキスト変換     |

### 型定義

完全な型定義は `packages/cms-types/src/index.ts` を参照:

- リクエスト型: `TransformTextRequest`, `GenerateOutlineRequest` など
- レスポンス型: `TransformTextResponse`, `GenerateOutlineResponse` など
- Enum: `TransformAction`, `ArticleCategory`, `ContinuationLength` など

---

## 設定

### 環境変数

**CMS API**（Cloudflare Workers）:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

### GitHub シークレット

CI/CDワークフローに必要:

- `OPENAI_API_KEY` - PR説明文生成
- `ANTHROPIC_API_KEY` -（オプション、将来のCI統合用）
- `GEMINI_API_KEY` -（オプション、将来のCI統合用）

### ローカル開発

`apps/cms-api/` に `.dev.vars` を作成:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```
