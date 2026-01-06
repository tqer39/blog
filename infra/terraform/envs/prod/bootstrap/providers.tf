provider "aws" {
  region = local.config.aws.region

  default_tags {
    tags = {
      Project    = local.config.project.name
      ManagedBy  = "terraform"
      Repository = "github.com/${local.config.project.organization}/${local.config.project.repository}"
    }
  }
}
