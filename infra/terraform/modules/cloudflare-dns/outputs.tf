output "record_id" {
  description = "CloudFlare record ID"
  value       = cloudflare_dns_record.blog.id
}

output "hostname" {
  description = "Full hostname"
  value       = cloudflare_dns_record.blog.hostname
}
