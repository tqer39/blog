# Cloudflare Pages Project
# Static site hosting on Cloudflare's edge network

resource "cloudflare_pages_project" "this" {
  account_id        = var.account_id
  name              = var.project_name
  production_branch = var.production_branch
}

# Custom domain for the Pages project
resource "cloudflare_pages_domain" "this" {
  count = var.custom_domain != null ? 1 : 0

  account_id   = var.account_id
  project_name = cloudflare_pages_project.this.name
  domain       = var.custom_domain
}

# DNS record for custom domain
resource "cloudflare_dns_record" "this" {
  count = var.custom_domain != null ? 1 : 0

  zone_id = var.zone_id
  name    = var.subdomain
  content = cloudflare_pages_project.this.subdomain
  type    = "CNAME"
  proxied = true
  ttl     = 1 # Auto TTL when proxied

  comment = "Managed by Terraform - ${var.project_name}"
}
