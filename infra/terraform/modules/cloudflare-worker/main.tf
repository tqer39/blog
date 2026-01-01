# Cloudflare Workers Script
# Note: The actual script content is deployed via wrangler CLI.
# This module manages the worker configuration and bindings in Terraform.

resource "cloudflare_workers_script" "this" {
  account_id = var.account_id
  name       = var.script_name
  content    = var.script_content
  module     = true

  dynamic "d1_database_binding" {
    for_each = var.d1_bindings
    content {
      name        = d1_database_binding.value.name
      database_id = d1_database_binding.value.database_id
    }
  }

  dynamic "r2_bucket_binding" {
    for_each = var.r2_bindings
    content {
      name        = r2_bucket_binding.value.name
      bucket_name = r2_bucket_binding.value.bucket_name
    }
  }

  dynamic "secret_text_binding" {
    for_each = var.secret_bindings
    content {
      name = secret_text_binding.value.name
      text = secret_text_binding.value.text
    }
  }

  dynamic "plain_text_binding" {
    for_each = var.env_bindings
    content {
      name = plain_text_binding.value.name
      text = plain_text_binding.value.text
    }
  }
}

# Custom domain for the worker
resource "cloudflare_workers_custom_domain" "this" {
  count = var.custom_domain != null ? 1 : 0

  account_id = var.account_id
  zone_id    = var.zone_id
  hostname   = var.custom_domain
  service    = cloudflare_workers_script.this.name
}

# Worker route (alternative to custom domain)
resource "cloudflare_workers_route" "this" {
  count = var.route_pattern != null ? 1 : 0

  zone_id     = var.zone_id
  pattern     = var.route_pattern
  script_name = cloudflare_workers_script.this.name
}
