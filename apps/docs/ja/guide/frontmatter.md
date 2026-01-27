# Frontmatter

Frontmatter は各記事ファイルの先頭にある YAML メタデータです。このガイドでは利用可能なフィールドを説明します。

## 基本構造

Frontmatter はトリプルダッシュで囲みます：

```yaml
---
title: 記事タイトル
tags: [tag1, tag2]
---

記事の本文はここから始まります...
```

## 必須フィールド

### title

記事のタイトル。唯一の必須フィールドです。

```yaml
---
title: TypeScript ジェネリクスの使い方
---
```

## オプションフィールド

### tags

カテゴリ分けのためのタグ配列：

```yaml
---
title: 私の記事
tags: [typescript, programming, tutorial]
---
```

### category

記事のカテゴリ：

```yaml
---
title: 私の記事
category: tech
---
```

利用可能なカテゴリ：
- `tech` - 技術記事
- `life` - 生活体験
- `books` - 書評
- `pta` - PTA 関連

### description

SEO とプレビュー用の短い説明：

```yaml
---
title: 私の記事
description: この記事で扱う内容の簡単な要約
---
```

検索結果での最適な表示のため、160 文字以内に収めてください。

## ステータスフィールド

### status

記事の公開状態を制御：

```yaml
---
title: 作業中
status: draft
---
```

利用可能な値：
- `draft` - 非公開
- `published` - 公開（デフォルト）

### publishedAt

公開日を明示的に設定：

```yaml
---
title: 私の記事
publishedAt: 2024-01-15
---
```

指定しない場合は作成日が使用されます。

### updatedAt

最終更新日を記録：

```yaml
---
title: 私の記事
updatedAt: 2024-02-20
---
```

## 完全な例

```yaml
---
title: Hono で REST API を構築する
description: Hono フレームワークを使用して型安全な REST API を作成する方法を学ぶ
tags: [hono, api, typescript, cloudflare-workers]
category: tech
status: published
publishedAt: 2024-01-15
updatedAt: 2024-02-20
---
```

## 日付フォーマット

日付は以下のフォーマットで指定できます：

```yaml
# ISO フォーマット（推奨）
publishedAt: 2024-01-15

# 時刻付き
publishedAt: 2024-01-15T09:30:00

# タイムゾーン付き
publishedAt: 2024-01-15T09:30:00+09:00
```

## ベストプラクティス

1. **必ずタイトルを含める** - 必須であり、あらゆる場所で使用される
2. **関連するタグを追加** - 整理と発見に役立つ
3. **良い説明を書く** - SEO とプレビューを改善
4. **下書きステータスを使用** - 作成中の記事に
5. **タグの一貫性を保つ** - 小文字、ハイフン区切りのタグを使用
