output "d1_database_id" {
  description = "D1 Database ID - use this in wrangler.toml"
  value       = module.cms_d1.database_id
}

output "d1_database_name" {
  description = "D1 Database name"
  value       = module.cms_d1.database_name
}

output "r2_bucket_name" {
  description = "R2 Bucket name - use this in wrangler.toml"
  value       = module.cms_r2.bucket_name
}

output "wrangler_config" {
  description = "Configuration snippet for wrangler.toml"
  value       = <<-EOT
    # Add to wrangler.toml [env.staging]:
    [[env.staging.d1_databases]]
    binding = "DB"
    database_name = "${module.cms_d1.database_name}"
    database_id = "${module.cms_d1.database_id}"

    [[env.staging.r2_buckets]]
    binding = "R2_BUCKET"
    bucket_name = "${module.cms_r2.bucket_name}"
  EOT
}
