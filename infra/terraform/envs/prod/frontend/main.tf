locals {
  config      = yamldecode(file("${path.module}/../../../config.yml"))
  environment = local.config.environments.prod
  domain      = "${local.environment.subdomain}.${local.config.project.domain}"
}
