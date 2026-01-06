output "record_id" {
  description = "CloudFlare record ID"
  value       = cloudflare_dns_record.blog.id
}
