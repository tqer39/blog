# Skill Template

Claude Code Skills のテンプレート。ベストプラクティスに基づいて作成。

参照: [Claude Platform - Agent Skills Best Practices](https://platform.claude.com/docs/ja/agents-and-tools/agent-skills/best-practices)

## テンプレート

```markdown
---
name: skill-name
description: スキルの説明。何をするか、いつ使用するかを含める。「〇〇を処理する」「〇〇の場合に使用」など具体的に記述。
---

# スキル名

スキルの目的を1-2文で説明。

## 使用条件

このスキルを使用するトリガー条件:

- 条件1
- 条件2
- 条件3

## 手順

### Step 1: 準備

最初に行うこと。

### Step 2: 実行

メインの処理。

```bash
# コマンド例
command --option value
```

### Step 3: 確認

結果の確認方法。

## 出力形式

期待される出力のテンプレート:

```markdown
# タイトル

## セクション1

内容

## セクション2

内容
```

## 注意事項

- 注意点1
- 注意点2
```text
(テンプレート終了)
```

## 命名規則

### name フィールド

- 最大 64 文字
- 小文字、数字、ハイフンのみ
- 動名詞形を推奨: `processing-pdfs`, `creating-issues`
- または名詞句: `pdf-processing`, `issue-creation`
- または動詞形: `process-pdfs`, `create-issue`

**避けるべき名前:**

- 曖昧: `helper`, `utils`, `tools`
- 一般的すぎる: `documents`, `data`, `files`
- 予約語: `anthropic-*`, `claude-*`

### description フィールド

- 最大 1024 文字
- 空にしない
- **三人称で記述**（「〇〇を処理する」「〇〇の場合に使用」）
- 何をするか + いつ使用するかの両方を含める

**良い例:**

```yaml
description: PDF ファイルからテキストと表を抽出する。PDF、フォーム、ドキュメント抽出について言及された場合に使用。
```

**悪い例:**

```yaml
description: ドキュメントに役立つ
```

## 構造のガイドライン

### 簡潔さ

- Claude が既に知っていることは書かない
- SKILL.md は 500 行以下に保つ
- 詳細は別ファイルに分割し参照

### 段階的開示

```text
skill-name/
├── SKILL.md              # メイン指示（500行以下）
├── REFERENCE.md          # 詳細リファレンス（必要時のみ読込）
├── EXAMPLES.md           # 使用例（必要時のみ読込）
└── scripts/
    └── utility.py        # ユーティリティスクリプト
```

SKILL.md から別ファイルへの参照は **1 レベルまで**:

```markdown
**詳細**: [REFERENCE.md](REFERENCE.md) を参照
**例**: [EXAMPLES.md](EXAMPLES.md) を参照
```

### ワークフロー

複雑なタスクにはチェックリストを提供:

```markdown
## ワークフロー

進捗を追跡するためにこのチェックリストをコピー:

- [ ] Step 1: 分析
- [ ] Step 2: 実装
- [ ] Step 3: 検証
- [ ] Step 4: 完了
```

### フィードバックループ

検証 → 修正 → 繰り返しのパターンを含める:

```markdown
## 検証プロセス

1. 検証スクリプトを実行
2. エラーがあれば修正
3. 再度検証
4. すべてパスするまで繰り返す
```

## 避けるべきパターン

1. **Windows スタイルのパス**: `scripts\helper.py` → `scripts/helper.py`
2. **選択肢の提示過多**: デフォルトを1つ提供
3. **時間依存の情報**: 日付を含む指示は避ける
4. **マジックナンバー**: 値には理由を記載
5. **深いネスト参照**: 1 レベルまで

## チェックリスト

スキル作成時に確認:

- [ ] name が命名規則に従っている
- [ ] description が具体的（何をする + いつ使用）
- [ ] SKILL.md が 500 行以下
- [ ] 参照ファイルは 1 レベル深さまで
- [ ] 一貫した用語を使用
- [ ] 具体的な例を含む
- [ ] ワークフローに明確なステップがある
