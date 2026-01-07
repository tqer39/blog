# Cloudflare D1 Database
resource "cloudflare_d1_database" "this" {
  account_id = var.account_id
  name       = var.database_name

  lifecycle {
    ignore_changes = [read_replication]
  }
}
