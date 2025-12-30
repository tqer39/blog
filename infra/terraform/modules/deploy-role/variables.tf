variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "aws_env_name" {
  description = "AWS environment name"
  type        = string
}

variable "app_env_name" {
  description = "Application environment name"
  type        = string
}

variable "organization" {
  description = "GitHub organization name"
  type        = string
}

variable "repository" {
  description = "GitHub repository name"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
