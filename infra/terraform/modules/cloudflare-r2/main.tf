# Cloudflare R2 Bucket
resource "cloudflare_r2_bucket" "this" {
  account_id = var.account_id
  name       = var.bucket_name
  location   = var.location
}

# Custom Domain for public access
resource "cloudflare_r2_custom_domain" "this" {
  count = var.custom_domain != null ? 1 : 0

  account_id  = var.account_id
  bucket_name = cloudflare_r2_bucket.this.name
  zone_id     = var.zone_id
  domain      = var.custom_domain
  enabled     = true
}
