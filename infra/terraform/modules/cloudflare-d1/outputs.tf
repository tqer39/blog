output "database_id" {
  description = "The ID of the D1 database"
  value       = cloudflare_d1_database.this.id
}

output "database_name" {
  description = "The name of the D1 database"
  value       = cloudflare_d1_database.this.name
}
