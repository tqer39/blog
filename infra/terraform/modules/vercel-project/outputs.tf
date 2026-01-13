output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.blog.id
}

output "project_name" {
  description = "Vercel project name"
  value       = vercel_project.blog.name
}

output "domain" {
  description = "Custom domain"
  value       = vercel_project_domain.blog.domain
}
