locals {
  config     = yamldecode(file("../../../config.yml"))
  env_config = local.config.environments.prod
  domain     = local.config.project.domain
}

# frontend の state から CNAME ターゲットを取得
data "terraform_remote_state" "frontend" {
  backend = "s3"
  config = {
    bucket = "terraform-tfstate-tqer39-072693953877-ap-northeast-1"
    key    = "blog/infra/terraform/envs/prod/prod-frontend.tfstate"
    region = "ap-northeast-1"
  }
}

module "dns" {
  source = "../../../modules/cloudflare-dns"

  zone_id      = var.cloudflare_zone_id
  subdomain    = local.env_config.subdomain
  vercel_cname = data.terraform_remote_state.frontend.outputs.vercel_cname_target
  repository   = local.config.project.repository
}
