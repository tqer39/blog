variable "project_name" {
  description = "Vercel project name"
  type        = string
}

variable "framework" {
  description = "Framework (e.g., nextjs)"
  type        = string
  default     = "nextjs"
}

variable "organization" {
  description = "GitHub organization"
  type        = string
}

variable "repository" {
  description = "GitHub repository name"
  type        = string
}

variable "build_command" {
  description = "Build command"
  type        = string
  default     = "npm run build"
}

variable "output_directory" {
  description = "Output directory"
  type        = string
  default     = "out"
}

variable "domain" {
  description = "Custom domain"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables"
  type = list(object({
    key    = string
    value  = string
    target = list(string)
  }))
  default = []
}
