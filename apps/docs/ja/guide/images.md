# 画像

このガイドでは、ブログ記事に画像を追加する方法を説明します。

## 画像のアップロード

### Admin UI を使用

1. `/admin` で Admin UI を開く
2. 記事エディタに移動
3. ツールバーの画像アップロードボタンをクリック
4. 画像ファイルを選択
5. 画像 URL が自動的に挿入される

### 対応フォーマット

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)
- SVG (`.svg`)

## Markdown 構文

### 基本的な画像

```markdown
![代替テキスト](/images/example.jpg)
```

### タイトル付き画像

```markdown
![代替テキスト](/images/example.jpg "画像タイトル")
```

タイトルはホバー時にツールチップとして表示されます。

## 画像サイズ

### 幅の指定

クエリパラメータで幅を制御：

```markdown
![代替テキスト](/images/example.jpg?w=600)
```

### 高さの指定

```markdown
![代替テキスト](/images/example.jpg?h=400)
```

### 両方の指定

```markdown
![代替テキスト](/images/example.jpg?w=600&h=400)
```

::: warning
両方を指定すると、画像がフィットするようにトリミングされる場合があります。レスポンシブな画像には幅のみを使用してください。
:::

## キャプション

強調を使って画像の下にキャプションを追加：

```markdown
![山の風景](/images/mountain.jpg)
*2024年、富士山で撮影*
```

## CDN URL

Admin UI でアップロードした画像は自動的に CDN 経由で配信されます：

```text
https://cdn.blog.tqer39.dev/images/{image-id}.{ext}
```

### URL 構造

| 部分 | 説明 |
|------|------|
| `cdn.blog.tqer39.dev` | CDN ドメイン |
| `images` | 画像ディレクトリ |
| `{image-id}` | 一意の画像識別子 |
| `{ext}` | ファイル拡張子 |

## ベストプラクティス

1. **説明的な代替テキストを使用** - アクセシビリティに重要
2. **アップロード前に最適化** - ファイルサイズを適切に保つ
3. **可能な限り WebP を使用** - より良い圧縮
4. **コンテキストのためにキャプションを追加** - 読者の理解を助ける

## 画像をリンクにする

画像をクリック可能にする：

```markdown
[![代替テキスト](/images/thumbnail.jpg)](/images/full-size.jpg)
```
