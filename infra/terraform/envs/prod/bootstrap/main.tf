locals {
  config = yamldecode(file("${path.module}/../../../config.yml"))
}

module "deploy_role" {
  source = "../../../modules/deploy-role"

  aws_account_id = local.config.aws.account_id
  aws_env_name   = "prod"
  app_env_name   = "prod"
  organization   = local.config.project.organization
  repository     = local.config.project.repository
  tags           = local.config.tags.common
}
