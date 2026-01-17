# Cloudflare R2 の location hint が GitHub Actions から実行すると無視される問題

## 結論

Terraform で Cloudflare R2 バケットを作成する際、`location = "apac"` を指定しても **GitHub Actions (US リージョン) から実行すると ENAM (北米東部) になる**。

APAC リージョンで作成したい場合は、**日本からローカルで `terraform apply` を実行する**必要がある。

## 前提

- Terraform Cloudflare Provider v5.x
- R2 バケットの location は作成時のみ設定可能（後から変更不可）
- location パラメータは「ヒント」であり、保証ではない

## 発生した問題

### 症状

同じ Terraform コードで R2 バケットを作成したにもかかわらず、リージョンが異なる：

| バケット名 | 作成方法 | location 設定 | 実際のリージョン |
|-----------|---------|--------------|----------------|
| blog-assets-prod | ローカル (日本) | apac | APAC |
| blog-assets-dev | GitHub Actions | apac | ENAM |

### Terraform 設定

```hcl
# modules/cloudflare-r2/main.tf
resource "cloudflare_r2_bucket" "this" {
  account_id = var.account_id
  name       = var.bucket_name
  location   = var.location  # "apac" を指定
}

# modules/cloudflare-r2/variables.tf
variable "location" {
  description = "Location hint for the R2 bucket (apac, eeur, enam, weur, wnam)"
  type        = string
  default     = "apac"
}
```

両環境とも `location = "apac"` を明示的に指定しているが、結果が異なる。

## 原因

### 1. location は「ヒント」に過ぎない

Cloudflare のドキュメントより：

> Location Hints are only honored the first time a bucket with a given name is created.

location パラメータは Cloudflare への「リクエスト」であり、必ずしも尊重されるわけではない。

### 2. リクエスト元の地理的位置が影響

バケット作成時、Cloudflare は以下の要素を考慮してリージョンを決定する：

1. `location` パラメータ（ヒント）
2. **リクエスト元の IP アドレスの地理的位置**
3. その他の内部ロジック

GitHub Actions の `ubuntu-latest` ランナーは **米国** に配置されているため、ENAM が選択されやすい。

### 3. Terraform Provider の既知のバグ

関連する GitHub Issues：

- [#6458](https://github.com/cloudflare/terraform-provider-cloudflare/issues/6458) - location hint が常に replacement を強制する
- [#5819](https://github.com/cloudflare/terraform-provider-cloudflare/issues/5819) - R2 region が大文字小文字を区別する
- [#5373](https://github.com/cloudflare/terraform-provider-cloudflare/issues/5373) - API 呼び出しの不具合

## 解決策

### 方法 1: ローカルから terraform apply を実行（推奨）

APAC リージョンにしたい場合、**日本国内から** `terraform apply` を実行する。

```bash
# ローカル (日本) から実行
cd infra/terraform/envs/dev/cms-api

export AWS_PROFILE=your-profile
export CLOUDFLARE_API_TOKEN=$(op read "op://shared-secrets/cloudflare/blog-api-token")
export CLOUDFLARE_ACCOUNT_ID=$(op read "op://shared-secrets/cloudflare/account-id")

terraform apply \
  -var="cloudflare_api_token=$CLOUDFLARE_API_TOKEN" \
  -var="cloudflare_account_id=$CLOUDFLARE_ACCOUNT_ID"
```

### 方法 2: 既存バケットの再作成

既に間違ったリージョンで作成されてしまった場合：

```bash
# 1. Terraform state から削除
terraform state rm module.cms_r2.cloudflare_r2_bucket.this

# 2. Cloudflare Dashboard でバケットを手動削除
#    (中身が空であることを確認)

# 3. ローカルから再作成
terraform apply -var="..."
```

### 方法 3: バケット名を変更して新規作成

データ移行が不要な場合、新しい名前でバケットを作成：

```hcl
# 変更前
bucket_name = "blog-assets-dev"

# 変更後
bucket_name = "blog-images-dev-v2"
```

## ワークフロー設計への影響

### CI/CD での R2 バケット作成は避ける

R2 バケットの作成は **初回のみ** であり、頻繁に実行するものではない。

以下のように分離することを推奨：

```text
初期セットアップ (ローカルから手動実行)
├── R2 バケット作成
├── D1 データベース作成
└── その他の永続リソース

継続的デプロイ (GitHub Actions)
├── Worker デプロイ
├── DB マイグレーション
└── その他の更新系
```

### Terraform の分割

```text
infra/terraform/envs/dev/
├── bootstrap/     # 初期セットアップ用 (ローカル実行)
│   └── main.tf    # R2, D1 など
└── cms-api/       # 継続的デプロイ用 (CI/CD 実行可)
    └── main.tf    # Worker 設定など
```

## まとめ

| 項目 | 内容 |
|-----|------|
| 問題 | R2 の location hint が GitHub Actions から実行すると無視される |
| 原因 | リクエスト元の地理的位置が影響し、US ランナーからは ENAM になる |
| 解決策 | APAC にしたい場合は日本からローカルで terraform apply を実行 |
| 教訓 | R2/D1 などの永続リソースは CI/CD ではなくローカルから作成する |

## 参考リンク

- [Cloudflare R2 Documentation - Location Hints](https://developers.cloudflare.com/r2/reference/data-location/)
- [Terraform Cloudflare Provider - R2 Bucket](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs/resources/r2_bucket)
- [GitHub Issue #6458 - Location hint force replacement](https://github.com/cloudflare/terraform-provider-cloudflare/issues/6458)

## 実際に試したコード

```shell
  cd /Users/takeruooyama/workspace/blog/infra/terraform/envs/prod/cms-api

  export AWS_PROFILE=portfolio
  export CLOUDFLARE_API_TOKEN=$(op read "op://shared-secrets/cloudflare/blog-api-token")
  export CLOUDFLARE_ACCOUNT_ID=$(op read "op://shared-secrets/cloudflare/account-id")
  export CLOUDFLARE_ZONE_ID=$(op read "op://shared-secrets/cloudflare/blog-zone-id")

  terraform plan \
    -var="cloudflare_api_token=$CLOUDFLARE_API_TOKEN" \
    -var="cloudflare_account_id=$CLOUDFLARE_ACCOUNT_ID" \
    -var="cloudflare_zone_id=$CLOUDFLARE_ZONE_ID"

🕒 11:22 blog  infra  terraform  envs  prod  cms-api on ☁️  portfolio [7h9m55s] on  ref/dev-admin-login-error-260117-957f84 [📦📝] via 💠 default
▶   # 確認後
  terraform apply \
    -var="cloudflare_api_token=$CLOUDFLARE_API_TOKEN" \
    -var="cloudflare_account_id=$CLOUDFLARE_ACCOUNT_ID" \
    -var="cloudflare_zone_id=$CLOUDFLARE_ZONE_ID"
zsh: command not found: #
module.cms_r2.cloudflare_r2_bucket.this: Refreshing state... [id=blog-assets-prod]
module.cms_d1.cloudflare_d1_database.this: Refreshing state... [id=dff8f762-4b93-42c6-861a-641c22cb92ed]

Terraform used the selected providers to generate the following execution plan. Resource
actions are indicated with the following symbols:
-/+ destroy and then create replacement

Terraform will perform the following actions:

  # module.cms_r2.cloudflare_r2_bucket.this must be replaced
-/+ resource "cloudflare_r2_bucket" "this" {
      ~ creation_date = "2026-01-14T18:39:10.126Z" -> (known after apply)
      ~ id            = "blog-assets-prod" -> (known after apply)
      ~ location      = "APAC" -> "apac"
      ~ name          = "blog-assets-prod" -> "blog-images-prod-v2" # forces replacement
        # (3 unchanged attributes hidden)
    }

Plan: 1 to add, 0 to change, 1 to destroy.

Changes to Outputs:
  ~ r2_bucket_name   = "blog-assets-prod" -> "blog-images-prod-v2"
  ~ wrangler_config  = <<-EOT
        # Add to wrangler.toml:
        [[d1_databases]]
        binding = "DB"
        database_name = "blog-cms-prod"
        database_id = "dff8f762-4b93-42c6-861a-641c22cb92ed"

        [[r2_buckets]]
        binding = "R2_BUCKET"
      - bucket_name = "blog-assets-prod"
      + bucket_name = "blog-images-prod-v2"
    EOT

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

module.cms_r2.cloudflare_r2_bucket.this: Destroying... [id=blog-assets-prod]
module.cms_r2.cloudflare_r2_bucket.this: Destruction complete after 1s
module.cms_r2.cloudflare_r2_bucket.this: Creating...
module.cms_r2.cloudflare_r2_bucket.this: Creation complete after 2s [id=blog-images-prod-v2]

Apply complete! Resources: 1 added, 0 changed, 1 destroyed.

Outputs:

d1_database_id = "dff8f762-4b93-42c6-861a-641c22cb92ed"
d1_database_name = "blog-cms-prod"
r2_bucket_name = "blog-images-prod-v2"
wrangler_config = <<EOT
# Add to wrangler.toml:
[[d1_databases]]
binding = "DB"
database_name = "blog-cms-prod"
database_id = "dff8f762-4b93-42c6-861a-641c22cb92ed"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "blog-images-prod-v2"

EOT
```
