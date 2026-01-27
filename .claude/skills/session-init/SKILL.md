---
name: session-init
description: セッション初期化。Claude Code セッション開始時にコンテキストを効率的にロード。「セッション開始」「コンテキスト確認」などのリクエスト時に使用。
---

# Session Init

Claude Code セッション開始時に必要最小限のコンテキストを効率的にロードするスキル。

## 目的

- LLM トークン消費の最小化
- 必要なコンテキストの即座のロード
- 遅延読み込みパターンの適用

## 初期化手順

### Step 1: プロジェクト概要の確認

```text
mcp__serena__read_memory: project_overview
```

このメモリには以下が含まれる:
- プロジェクトタイプ
- 技術スタック
- 主要なアーキテクチャ決定
- URL 設計

### Step 2: コードベース構造の確認（必要時のみ）

```text
mcp__serena__read_memory: codebase_map
```

ファイル探索が必要な場合のみ読み込む:
- パッケージ構成
- 主要ファイルパス
- 環境 URL

### Step 3: コーディング規約の確認（コード変更時のみ）

```text
mcp__serena__read_memory: conventions
```

コード編集が必要な場合のみ読み込む:
- 命名規則
- ファイル構成
- コミットメッセージ規約

### Step 4: アクティブ Issue の確認（課題駆動時のみ）

```text
mcp__serena__read_memory: active_issues
```

Issue ベースの作業時のみ読み込む:
- 現在のスプリント
- バックログ
- 優先度

## 遅延読み込みパターン

### 読み込みタイミングの判断

| タスクタイプ | 初期ロード | 追加ロード（必要時） |
|-------------|-----------|-------------------|
| 質問・調査 | project_overview | codebase_map |
| コード変更 | project_overview | codebase_map, conventions |
| Issue 対応 | project_overview | active_issues, codebase_map, conventions |
| ドキュメント | project_overview | - |
| テスト作成 | project_overview | conventions |

### 遅延読み込みの実践

1. **最初は project_overview のみ**を読み込む
2. タスクの内容を確認
3. **必要に応じて**追加のメモリを読み込む
4. シンボル検索は Serena の `find_symbol` を使用（ファイル全体を読まない）

## セッション開始時のチェックリスト

- [ ] project_overview を読み込んだ
- [ ] タスクのスコープを確認した
- [ ] 必要なメモリを特定した
- [ ] 不要なファイル読み込みを避けた

## トークン節約のヒント

1. **ファイル全体を読まない**: `find_symbol` で必要なシンボルのみ取得
2. **メモリを活用**: 繰り返し参照する情報はメモリに保存
3. **段階的な情報取得**: 必要になったら読み込む
4. **検索の絞り込み**: `relative_path` パラメータで対象を限定

## 利用可能なメモリ一覧

```text
mcp__serena__list_memories
```

現在のメモリ:
- `project_overview` - プロジェクト概要
- `codebase_map` - コードベース構造
- `conventions` - コーディング規約
- `active_issues` - アクティブ Issue

## Quick Start

```text
# セッション開始時
1. mcp__serena__read_memory: project_overview
2. タスク内容を確認
3. 必要に応じて追加メモリをロード
4. 作業開始
```
