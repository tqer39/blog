---
name: security
description: セキュリティチェックを実行。「セキュリティ確認」「脆弱性チェック」「セキュリティレビュー」などのリクエスト時に使用。
---

# Security Check

ブログプロジェクトのセキュリティチェックを担当するスキル。
Web サービス公開前のセキュリティチェックリストに基づいて脆弱性を検出・報告する。

## 役割

コードベースを検査し、セキュリティ上の問題を発見・報告する。
実装の修正は行わず、問題の特定と改善提案のみを行う。

## チェック対象

- `apps/blog/src/**` - Next.js フロントエンド
- `apps/cms-api/src/**` - Hono API (Cloudflare Workers)
- 設定ファイル (`next.config.ts`, `wrangler.toml` など)

## セキュリティチェックリスト

### 1. 認証・Cookie 関連

- [ ] **HttpOnly 属性**: セッション Cookie に HttpOnly が設定されているか
- [ ] **SameSite 属性**: Strict または Lax が設定されているか（CSRF 対策）
- [ ] **Secure 属性**: 本番環境で Secure フラグが有効か
- [ ] **セッション有効期限**: 適切な有効期限が設定されているか
- [ ] **Admin 認証**: `/admin/*` ルートが middleware で保護されているか

### 2. 入力バリデーション

- [ ] **サーバーサイドバリデーション**: クライアントだけでなくサーバーでも検証しているか
- [ ] **URL バリデーション**: `javascript:` などの危険なプロトコルをブロックしているか
- [ ] **ファイルアップロード**: 画像の形式・サイズ・MIME タイプを検証しているか
- [ ] **SQL インジェクション防止**: D1 のプリペアドステートメントを使用しているか
- [ ] **型安全性**: TypeScript の型定義が適切か

### 3. XSS 対策

- [ ] **React/Next.js のエスケープ**: `dangerouslySetInnerHTML` を使用していないか
- [ ] **Markdown サニタイズ**: ユーザー入力の Markdown を安全にレンダリングしているか
- [ ] **Content-Security-Policy**: CSP ヘッダーを設定しているか

### 4. 権限チェック

- [ ] **認証ガード**: 保護されたルートで認証チェックを行っているか
- [ ] **API 認証**: CMS API で Bearer トークン認証が適用されているか
- [ ] **WHERE 句**: DB クエリで適切なフィルタリングを行っているか

### 5. レスポンスヘッダ

- [ ] **Strict-Transport-Security**: HSTS ヘッダーを設定しているか
- [ ] **X-Frame-Options**: クリックジャッキング対策
- [ ] **X-Content-Type-Options**: `nosniff` を設定しているか
- [ ] **Referrer-Policy**: 適切なリファラポリシーを設定しているか

### 6. エラー処理

- [ ] **エラーメッセージ**: スタックトレースや内部情報を露出していないか
- [ ] **本番環境のデバッグ**: デバッグモードが無効化されているか
- [ ] **ログ出力**: 機密情報をログに出力していないか

### 7. 依存関係

- [ ] **脆弱なパッケージ**: `pnpm audit` で脆弱性がないか
- [ ] **最新バージョン**: セキュリティパッチが適用されているか

### 8. シークレット管理

- [ ] **環境変数**: シークレットがハードコードされていないか
- [ ] **Git 履歴**: シークレットがコミットされていないか
- [ ] **.env ファイル**: `.gitignore` に含まれているか
- [ ] **NEXT_PUBLIC_**: 公開してはいけない値が公開されていないか

### 9. API セキュリティ

- [ ] **レート制限**: DoS 攻撃対策が実装されているか
- [ ] **CORS 設定**: 適切なオリジン制限が設定されているか
- [ ] **API キー**: 認証が必要な API で適切に保護されているか

### 10. Cloudflare Workers 固有

- [ ] **D1 バインディング**: 適切にバインドされているか
- [ ] **R2 バケット**: 公開 URL の制御が適切か
- [ ] **環境変数**: `wrangler.toml` でシークレットが露出していないか

## チェック実行方法

### 自動チェック

```bash
# 依存関係の脆弱性チェック
pnpm audit

# シークレットスキャン
git secrets --scan

# 静的解析
trivy fs .
```

### 手動チェック

1. このチェックリストを順番に確認
2. 問題を発見した場合はレポートを作成
3. 重要度に応じて対応を判断

## レポートフォーマット

```markdown
## セキュリティチェックレポート

### 日時
YYYY-MM-DD

### チェック範囲
- apps/blog
- apps/cms-api

### 発見した問題

#### [重要度: 高] 問題のタイトル
- **ファイル**: `path/to/file.ts:123`
- **問題**: 問題の詳細説明
- **影響**: 攻撃者が〇〇できる可能性がある
- **推奨対策**: 〇〇を実装する

#### [重要度: 中] 問題のタイトル
- **ファイル**: `path/to/file.ts:456`
- **問題**: 問題の詳細説明
- **推奨対策**: 〇〇を検討する

### 確認済み項目
- [x] HttpOnly 属性: 設定済み
- [x] SameSite 属性: Strict が設定済み
- [x] API 認証: Bearer トークン認証が適用済み
```

## ブログ固有のチェックポイント

### Admin 認証

- [ ] `middleware.ts` で `/admin/*` が保護されているか
- [ ] セッション Cookie の設定が安全か
- [ ] パスワードハッシュが bcrypt で保存されているか
- [ ] ログインページで適切なエラーメッセージを表示しているか

### CMS API (Hono)

- [ ] 全エンドポイントで `authMiddleware` が適用されているか
- [ ] 画像アップロードで MIME タイプを検証しているか
- [ ] Webhook シークレットが適切に検証されているか

### コンテンツ表示

- [ ] Markdown のレンダリングが安全か
- [ ] 外部リンクに `rel="noopener noreferrer"` が設定されているか

## 禁止事項

1. **コードの修正**: 問題の報告のみ行い、修正は別途依頼を受けてから行う
2. **機密情報の出力**: シークレットやパスワードをレポートに含めない
3. **攻撃コードの生成**: 脆弱性の実証コードは作成しない

## 参照

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/)
- [Zenn: Web サービス公開前のチェックリスト](https://zenn.dev/catnose99/articles/547cbf57e5ad28)
