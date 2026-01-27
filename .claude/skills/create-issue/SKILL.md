---
name: create-issue
description: GitHub Issue の作成。「Issue を作成」「タスクを Issue にして」「これを Issue 化」などのリクエスト時に使用。会話中にタスクを認識した際にも積極的に使用。
---

# Create Issue

会話中に認識したタスクや改善点を GitHub Issue として作成するスキル。

## トリガー条件

以下のような状況で積極的に Issue 作成を提案する:

- バグや問題を発見したとき
- 「後でやる」「TODO」などの言及があったとき
- リファクタリングの必要性を認識したとき
- 機能改善のアイデアが出たとき
- 技術的負債を発見したとき
- ドキュメントの不足を認識したとき

## 手順

### Step 1: タスクの整理

会話から以下を抽出:

- **ゴール**: 何を達成したいか
- **タイプ**: feat / fix / refactor / docs / test / chore
- **背景**: なぜこのタスクが必要か
- **スコープ**: 影響範囲（ファイル、コンポーネント等）

### Step 2: Issue テンプレートに沿って作成

```bash
gh issue create \
  --title "<type>: <簡潔なタイトル>" \
  --body "$(cat <<'EOF'
## ゴール

<達成したいこと>

## タイプ

- [ ] feat (新機能)
- [ ] fix (バグ修正)
- [ ] refactor (リファクタリング)
- [ ] docs (ドキュメント)
- [ ] test (テスト)
- [ ] chore (メンテナンス)

## 背景・コンテキスト

<なぜこのタスクが必要か>

## スコープ

- 対象ファイル/コンポーネント:
- 影響範囲:

## 受け入れ条件

- [ ] 条件1
- [ ] 条件2

## 備考

<追加情報があれば>
EOF
)"
```

### Step 3: ラベルの付与（オプション）

```bash
gh issue edit <number> --add-label "<label>"
```

利用可能なラベル例:
- `bug` - バグ報告
- `enhancement` - 機能改善
- `documentation` - ドキュメント
- `refactor` - リファクタリング
- `priority:high` - 優先度高
- `priority:low` - 優先度低
- `good first issue` - 初心者向け

## タイトルの規則

| タイプ   | タイトル例                              |
| -------- | --------------------------------------- |
| feat     | feat: ダークモードの追加                |
| fix      | fix: ヘッダーのレイアウト崩れ           |
| refactor | refactor: 認証ロジックの整理            |
| docs     | docs: API ドキュメントの追加            |
| test     | test: ArticleCard のテスト追加          |
| chore    | chore: ESLint ルールの更新              |

## 会話からの Issue 作成例

### 例 1: バグ発見時

会話:
> 「記事ページでダークモード切り替えると、コードブロックの色が変わらない」

→ Issue 作成:
```text
タイトル: fix: ダークモード時にコードブロックの色が変わらない
ゴール: ダークモード切り替え時にコードブロックも適切に色が変わること
タイプ: fix
```

### 例 2: TODO の認識

会話:
> 「このコンポーネント、後でテスト書いておきたい」

→ Issue 作成:
```text
タイトル: test: ArticleCard コンポーネントのテスト追加
ゴール: ArticleCard のユニットテストを追加してカバレッジを向上
タイプ: test
```

### 例 3: リファクタリング提案

会話:
> 「この関数、複雑すぎるから分割した方がいいな」

→ Issue 作成:
```text
タイトル: refactor: processArticle 関数の分割
ゴール: 可読性と保守性の向上のため関数を適切に分割
タイプ: refactor
```

## クイックコマンド

```bash
# Issue 作成（シンプル）
gh issue create --title "タイトル" --body "説明"

# Issue 作成（ラベル付き）
gh issue create --title "タイトル" --body "説明" --label "bug"

# Issue 一覧確認
gh issue list

# 作成した Issue を確認
gh issue view <number>

# ラベル一覧
gh label list
```

## ユーザーへの確認

Issue を作成する前に、以下を確認:

1. タスクの内容が正しく理解できているか
2. タイトルと説明が適切か
3. 今すぐ作成するか、後で作成するか

```text
以下の内容で Issue を作成しますか？

タイトル: <title>
タイプ: <type>
ゴール: <goal>

[はい / 内容を修正 / キャンセル]
```

## 注意事項

- 重複 Issue がないか事前に確認（`gh issue list` で検索）
- タイトルは具体的かつ簡潔に
- 受け入れ条件は明確に定義
- 関連する Issue があればリンク（`Related to #XX`）
- 作成後は Issue 番号をユーザーに伝える
