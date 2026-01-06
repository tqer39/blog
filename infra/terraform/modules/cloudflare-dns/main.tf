# CloudFlare DNS Record for Vercel
resource "cloudflare_dns_record" "blog" {
  zone_id = var.zone_id
  name    = var.subdomain
  content = var.vercel_cname
  type    = "CNAME"
  proxied = false # Vercel handles CDN
  ttl     = 1     # Auto TTL when not proxied

  comment = "Managed by Terraform - ${var.repository}"
}
