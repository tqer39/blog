variable "account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "zone_id" {
  description = "Cloudflare Zone ID (required for custom domain or route)"
  type        = string
  default     = null
}

variable "script_name" {
  description = "Name of the Workers script"
  type        = string
}

variable "script_content" {
  description = "The script content (JavaScript/TypeScript module)"
  type        = string
  default     = "export default { fetch() { return new Response('Hello World'); } }"
}

variable "custom_domain" {
  description = "Custom domain for the worker (e.g., api.example.com)"
  type        = string
  default     = null
}

variable "route_pattern" {
  description = "Route pattern for the worker (e.g., example.com/api/*)"
  type        = string
  default     = null
}

variable "d1_bindings" {
  description = "D1 database bindings"
  type = list(object({
    name        = string
    database_id = string
  }))
  default = []
}

variable "r2_bindings" {
  description = "R2 bucket bindings"
  type = list(object({
    name        = string
    bucket_name = string
  }))
  default = []
}

variable "secret_bindings" {
  description = "Secret text bindings"
  type = list(object({
    name = string
    text = string
  }))
  default   = []
  sensitive = true
}

variable "env_bindings" {
  description = "Plain text environment variable bindings"
  type = list(object({
    name = string
    text = string
  }))
  default = []
}
