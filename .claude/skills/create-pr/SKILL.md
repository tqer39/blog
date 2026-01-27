---
name: create-pr
description: Pull Request の作成。「PRを作成」「プルリクエストを作成」「変更をPRにして」などのリクエスト時に使用。
---

# Create Pull Request

現在のブランチから main ブランチへの Pull Request を作成するスキル。

## 前提条件

- `gh` CLI がインストールされていること
- GitHub にログイン済みであること（`gh auth status`）
- 現在のブランチが main 以外であること
- コミットが存在すること

## 手順

1. 現在の状態を確認

   ```bash
   git status
   git branch --show-current
   ```

2. main との差分コミットを取得

   ```bash
   git log origin/main..HEAD --oneline --no-merges
   ```

3. 差分の詳細を取得

   ```bash
   git diff origin/main...HEAD --stat
   ```

4. PR タイトルと説明文を生成

5. リモートにプッシュ（必要な場合）

   ```bash
   git push -u origin $(git branch --show-current)
   ```

6. PR を作成

   ```bash
   gh pr create --title "タイトル" --body "説明文"
   ```

## PR タイトルの規則

コミットの内容に基づいてタイトルを決定:

| プレフィックス | タイトル形式                   |
| -------------- | ------------------------------ |
| feat:          | 機能追加: 変更内容の要約       |
| fix:           | バグ修正: 修正内容の要約       |
| docs:          | ドキュメント更新: 更新内容     |
| refactor:      | リファクタ: 対象の要約         |
| chore:         | メンテナンス: 変更内容         |
| ci:            | CI/CD 改善: 改善内容           |
| test:          | テスト追加: 対象の要約         |

複数種類のコミットがある場合は、最も重要な変更を代表としてタイトルにする。

## PR 説明文テンプレート

```markdown
## 概要

この PR で行った変更の簡潔な説明（1-2 文）

## 変更内容

- 変更点 1
- 変更点 2
- 変更点 3

## テスト

- [ ] ローカルで動作確認済み
- [ ] 既存のテストが通ること確認済み
```

## 注意事項

- タイトルは日本語で、50 文字以内を目安にする
- 説明文も日本語で記述
- 破壊的変更がある場合は明記する
- 未コミットの変更がある場合は警告する
- draft PR にする場合は `--draft` オプションを使用
