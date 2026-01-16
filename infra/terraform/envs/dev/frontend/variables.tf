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

# Vercel Environment Variables (sensitive)
variable "cms_api_key" {
  description = "CMS API Key for authentication"
  type        = string
  sensitive   = true
}

variable "basic_auth_user" {
  description = "Basic Auth username"
  type        = string
  sensitive   = true
}

variable "basic_auth_pass" {
  description = "Basic Auth password"
  type        = string
  sensitive   = true
}

variable "admin_password_hash" {
  description = "Admin password hash"
  type        = string
  sensitive   = true
}
