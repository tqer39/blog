# CMS API Infrastructure
# D1 Database + R2 Bucket for Blog CMS

locals {
  config = yamldecode(file("${path.module}/../../../config.yml"))
}

# D1 Database for articles, tags, and images metadata
module "cms_d1" {
  source = "../../../modules/cloudflare-d1"

  account_id    = var.cloudflare_account_id
  database_name = "blog-cms-prod"
}

# R2 Bucket for image storage
module "cms_r2" {
  source = "../../../modules/cloudflare-r2"

  account_id    = var.cloudflare_account_id
  bucket_name   = "blog-images-prod-v2"
  location      = "apac"
  custom_domain = "cdn.${local.config.project.domain}"
  zone_id       = var.cloudflare_zone_id
}

# Note: Worker deployment is handled by wrangler CLI for better DX.
# The worker bindings are configured in apps/cms-api/wrangler.toml
# and reference the D1 database and R2 bucket created here.
#
# After applying this Terraform:
# 1. Update wrangler.toml with the database_id from outputs
# 2. Deploy with: cd apps/cms-api && pnpm deploy
