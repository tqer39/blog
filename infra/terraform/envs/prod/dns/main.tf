locals {
  config     = yamldecode(file("../../../config.yml"))
  env_config = local.config.environments.prod
  domain     = local.config.project.domain
}

module "dns" {
  source = "../../../modules/cloudflare-dns"

  zone_id    = var.cloudflare_zone_id
  subdomain  = local.env_config.subdomain
  repository = local.config.project.repository
  # vercel_cname uses default "cname.vercel-dns.com"
}
