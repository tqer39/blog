# Terraform bcrypt ハッシュの $ エスケープ問題

## 概要

GitHub Actions から Terraform 経由で Vercel に bcrypt ハッシュ（`ADMIN_PASSWORD_HASH`）を設定する際、`$` 文字が正しく渡されない問題。

## 症状

- Vercel の `/my/login` で 500 Internal Server Error が発生
- Vercel ダッシュボードで手動設定すると正常に動作
- Terraform 経由で設定すると認証が失敗

## 原因

bcrypt ハッシュは以下のような形式:

```text
$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

この形式には複数の `$` 文字が含まれており、シェルでは `$` は変数展開の記号として解釈される。

### 問題のあったコード

`sync-secrets.yml` で GitHub Secrets を設定する際、`--body` オプションを使用していた:

```yaml
# 問題のあるコード
gh secret set ADMIN_PASSWORD_HASH_PROD --body "$ADMIN_PASSWORD_HASH_PROD"
```

この方法では、`gh` コマンドの引数として値を渡す際に、シェルによる解釈の影響を受ける可能性があった。

## 解決方法

`printf` と パイプを使用して、標準入力経由で値を渡す方法に変更:

```yaml
# 修正後のコード
printf '%s' "$ADMIN_PASSWORD_HASH_PROD" | gh secret set ADMIN_PASSWORD_HASH_PROD
```

### なぜこの方法が安全か

1. `printf '%s'` は引数をそのまま出力する（エスケープシーケンスを解釈しない）
2. パイプ経由で `gh secret set` に渡すことで、コマンドライン引数としての解釈を回避
3. `gh secret set` は `--body` が指定されない場合、標準入力から値を読み取る

## 修正箇所

**ファイル:** `.github/workflows/sync-secrets.yml`

```diff
- gh secret set ADMIN_PASSWORD_HASH_DEV --body "$ADMIN_PASSWORD_HASH_DEV"
- gh secret set ADMIN_PASSWORD_HASH_PROD --body "$ADMIN_PASSWORD_HASH_PROD"
+ printf '%s' "$ADMIN_PASSWORD_HASH_DEV" | gh secret set ADMIN_PASSWORD_HASH_DEV
+ printf '%s' "$ADMIN_PASSWORD_HASH_PROD" | gh secret set ADMIN_PASSWORD_HASH_PROD
```

同様のパターンを他のシークレット設定にも適用（特殊文字を含む可能性があるすべての値）。

## 検証方法

1. `sync-secrets.yml` ワークフローを実行してシークレットを再同期
2. `terraform-prod.yml` ワークフローを実行
3. Terraform Plan で `ADMIN_PASSWORD_HASH` の変更がないことを確認
   - 変更がない = Vercel の現在の値と一致 = 正しく同期されている

## 関連する他のシークレット

同様の問題を引き起こす可能性のある値:

| シークレット | 特殊文字の可能性 |
|-------------|-----------------|
| `ADMIN_PASSWORD_HASH_*` | `$` (bcrypt) |
| `AUTH_SECRET_*` | ランダム文字列 |
| `CMS_API_KEY_*` | 各種記号 |
| `CLOUDFLARE_API_TOKEN` | 各種記号 |

## ベストプラクティス

GitHub Secrets を設定する際は、常に `printf` + パイプ パターンを使用する:

```bash
# 推奨
printf '%s' "$SECRET_VALUE" | gh secret set SECRET_NAME

# 非推奨
gh secret set SECRET_NAME --body "$SECRET_VALUE"
```

## 参考リンク

- [GitHub CLI - gh secret set](https://cli.github.com/manual/gh_secret_set)
- [bcrypt ハッシュ形式](https://en.wikipedia.org/wiki/Bcrypt)
- [Bash での特殊文字のエスケープ](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)
