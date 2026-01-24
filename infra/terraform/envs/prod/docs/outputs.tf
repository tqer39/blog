output "pages_project_name" {
  description = "Cloudflare Pages project name"
  value       = module.docs_pages.project_name
}

output "pages_subdomain" {
  description = "Default Pages subdomain"
  value       = module.docs_pages.subdomain
}

output "pages_domains" {
  description = "All domains for the Pages project"
  value       = module.docs_pages.domains
}
