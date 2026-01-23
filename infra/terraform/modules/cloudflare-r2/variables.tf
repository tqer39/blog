variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "bucket_name" {
  description = "Name of the R2 bucket"
  type        = string
}

variable "location" {
  description = "Location hint for the R2 bucket (apac, eeur, enam, weur, wnam)"
  type        = string
  default     = "apac"
}

variable "custom_domain" {
  description = "Custom domain for public access (e.g., cdn.tqer39.dev)"
  type        = string
  default     = null
}

variable "zone_id" {
  description = "CloudFlare Zone ID (required if custom_domain is set)"
  type        = string
  default     = null
}
