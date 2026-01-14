variable "cloudflare_api_token" {
  description = "CloudFlare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "CloudFlare Zone ID for tqer39.dev"
  type        = string
}

variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel Team/Organization ID"
  type        = string
  default     = null
}

variable "cms_api_key" {
  description = "CMS API Key for authentication"
  type        = string
  sensitive   = true
}

variable "basic_auth_user" {
  description = "Basic Auth username for dev environment"
  type        = string
  sensitive   = true
}

variable "basic_auth_pass" {
  description = "Basic Auth password for dev environment"
  type        = string
  sensitive   = true
}

variable "admin_password_hash" {
  description = "Admin password hash for admin login"
  type        = string
  sensitive   = true
}
