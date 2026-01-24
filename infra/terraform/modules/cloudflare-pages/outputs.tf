output "project_name" {
  description = "Name of the Pages project"
  value       = cloudflare_pages_project.this.name
}

output "subdomain" {
  description = "Default Pages subdomain (*.pages.dev)"
  value       = cloudflare_pages_project.this.subdomain
}

output "domains" {
  description = "All domains associated with the project"
  value       = cloudflare_pages_project.this.domains
}
