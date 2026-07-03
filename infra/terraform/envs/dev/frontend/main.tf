locals {
  config      = yamldecode(file("${path.module}/../../../config.yml"))
  environment = local.config.environments.dev
  domain      = "${local.environment.subdomain}.${local.config.project.domain}"
}
