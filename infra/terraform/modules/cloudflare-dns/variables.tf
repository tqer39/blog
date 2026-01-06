variable "zone_id" {
  description = "CloudFlare Zone ID"
  type        = string
}

variable "subdomain" {
  description = "Subdomain name (e.g., 'blog' for blog.tqer39.dev)"
  type        = string
}

variable "vercel_cname" {
  description = "Vercel CNAME target"
  type        = string
  default     = "cname.vercel-dns.com"
}

variable "repository" {
  description = "Repository name for comment"
  type        = string
}
