output "script_name" {
  description = "The name of the Workers script"
  value       = cloudflare_workers_script.this.name
}

output "custom_domain" {
  description = "The custom domain hostname (if configured)"
  value       = var.custom_domain != null ? cloudflare_workers_custom_domain.this[0].hostname : null
}

output "route_pattern" {
  description = "The route pattern (if configured)"
  value       = var.route_pattern != null ? cloudflare_workers_route.this[0].pattern : null
}
