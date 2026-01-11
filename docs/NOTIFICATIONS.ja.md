# 通知設定

[🇺🇸 English](./NOTIFICATIONS.md)

このドキュメントでは、ブログ更新通知の受け取り方を説明します。

## RSS フィード

このブログは以下の URL で RSS フィードを提供しています:

```text
https://blog.tqer39.dev/feed.xml
```

## Slack

### /feed コマンドで購読

```text
/feed subscribe https://blog.tqer39.dev/feed.xml
```

### 管理コマンド

```text
/feed list          # 購読中のフィード一覧
/feed remove <url>  # フィードを削除
```

## Discord

### MonitoRSS Bot を使用（推奨）

1. [monitorss.xyz](https://monitorss.xyz) にアクセス
2. Bot をサーバーに招待
3. RSS URL と投稿先チャンネルを設定

### Webhook を使用（上級者向け）

定期ジョブで RSS を取得し、Discord Webhook に投稿する。
