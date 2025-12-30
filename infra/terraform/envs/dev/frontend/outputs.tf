output "cloudflare_hostname" {
  description = "CloudFlare DNS hostname"
  value       = module.cloudflare_dns.hostname
}

output "vercel_project_id" {
  description = "Vercel project ID"
  value       = module.vercel_project.project_id
}

output "vercel_domain" {
  description = "Vercel custom domain"
  value       = module.vercel_project.domain
}
