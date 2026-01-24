---
name: issue-solver
description: GitHub Issue からタスクを読み込み実装。「Issue #XXを解決」「課題を処理」「#XX を対応」などのリクエスト時に使用。
---

# Issue Solver

GitHub Issue を読み込み、実装計画を生成し、コードを実装するスキル。

## 使用方法

```text
Issue #123 を解決して
#45 を対応して
課題番号 67 を処理
```

## ワークフロー

### Step 1: Issue の取得

```bash
gh issue view <number>
```

Issue の内容を確認:
- ゴール
- タイプ（feat/fix/refactor/docs/test/chore）
- スコープ
- 受け入れ条件
- コンテキスト
- 優先度

### Step 2: コンテキストの読み込み

1. **スコープに応じたメモリをロード**:
   ```text
   mcp__serena__read_memory: codebase_map
   mcp__serena__read_memory: conventions
   ```

2. **関連ファイルの特定**:
   - Issue のコンテキストセクションから関連ファイルを抽出
   - Serena で関連シンボルを検索
   ```text
   mcp__serena__find_symbol: <関連シンボル名>
   ```

### Step 3: 実装計画の生成

TodoWrite を使用してタスクリストを作成:

```text
1. 関連コードの調査
2. テストの作成（TDD の場合）
3. 実装
4. テストの実行
5. リント・フォーマット
6. 受け入れ条件の確認
7. PR 作成
```

### Step 4: 実装

1. **ブランチ作成**:
   ```bash
   git checkout -b <type>/<short-description>
   ```
   例: `feat/add-dark-mode`, `fix/header-overflow`

2. **コーディング**:
   - conventions メモリに従う
   - テストを先に書く（TDD）
   - 既存パターンに合わせる

3. **テスト実行**:
   ```bash
   pnpm test
   pnpm lint
   ```

### Step 5: PR 作成

```bash
gh pr create --title "<type>(<scope>): <description>" --body "$(cat <<'EOF'
## Summary
<変更の要約>

## Related Issue
Closes #<issue-number>

## Changes
- <変更点1>
- <変更点2>

## Test Plan
- [ ] ユニットテスト追加
- [ ] E2E テスト確認
- [ ] ローカルで動作確認

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## タイプ別の対応

### feat (新機能)

1. 機能の設計を確認
2. 必要なコンポーネント/関数を特定
3. テストを先に作成
4. 実装
5. ドキュメント更新

### fix (バグ修正)

1. バグの再現手順を確認
2. 原因を特定
3. 修正のテストを作成
4. 修正を実装
5. 回帰テストを追加

### refactor (リファクタリング)

1. 現在のコードを理解
2. リファクタリング計画を立てる
3. テストが十分か確認
4. 段階的にリファクタリング
5. テストがパスすることを確認

### docs (ドキュメント)

1. 対象ドキュメントを特定
2. 変更内容を確認
3. markdown-lint スキルで検証

### test (テスト)

1. unit-test スキルを使用
2. テスト対象を特定
3. テストケースを作成
4. カバレッジを確認

### chore (メンテナンス)

1. 変更内容を確認
2. 影響範囲を調査
3. 実装
4. CI/CD への影響を確認

## 受け入れ条件のチェック

Issue の受け入れ条件を 1 つずつ確認:

```markdown
## 受け入れ条件

- [x] 条件1（確認済み）
- [x] 条件2（確認済み）
- [ ] 条件3（未確認）
```

すべての条件がチェックされるまで完了としない。

## コミットメッセージ

```text
<type>(<scope>): <description>

<body>

Refs #<issue-number>
```

例:
```text
feat(blog): add dark mode toggle

- Add ThemeToggle component
- Add theme context provider
- Add CSS variables for dark theme

Refs #123
```

## クイックコマンド

```bash
# Issue 一覧表示
gh issue list

# Issue 詳細表示
gh issue view <number>

# ブランチ作成
git checkout -b <type>/<description>

# PR 作成（Issue リンク付き）
gh pr create --title "..." --body "Closes #<number>"

# Issue をクローズ
gh issue close <number>
```

## 注意事項

- 受け入れ条件を満たすまで PR を作成しない
- テストがパスすることを確認
- lint エラーがないことを確認
- コミットメッセージは Conventional Commits に従う
- PR の本文に Issue 番号を含める（`Closes #XXX`）
