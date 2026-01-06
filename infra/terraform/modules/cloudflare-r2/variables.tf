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
