output "bucket_name" {
  description = "The name of the R2 bucket"
  value       = cloudflare_r2_bucket.this.name
}

output "bucket_id" {
  description = "The ID of the R2 bucket"
  value       = cloudflare_r2_bucket.this.id
}

output "custom_domain" {
  description = "The custom domain for public access"
  value       = var.custom_domain != null ? cloudflare_r2_custom_domain.this[0].domain : null
}
