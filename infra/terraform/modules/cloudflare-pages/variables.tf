variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "project_name" {
  description = "Name of the Pages project"
  type        = string
}

variable "production_branch" {
  description = "Git branch for production deployments"
  type        = string
  default     = "main"
}

variable "zone_id" {
  description = "Cloudflare Zone ID for DNS records"
  type        = string
  default     = null
}

variable "subdomain" {
  description = "Subdomain for the custom domain (e.g., 'blog-docs' for blog-docs.tqer39.dev)"
  type        = string
  default     = null
}

variable "custom_domain" {
  description = "Full custom domain (e.g., 'blog-docs.tqer39.dev')"
  type        = string
  default     = null
}
