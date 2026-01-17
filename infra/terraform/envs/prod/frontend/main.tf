locals {
  config      = yamldecode(file("${path.module}/../../../config.yml"))
  environment = local.config.environments.prod
  domain      = "${local.environment.subdomain}.${local.config.project.domain}"
}

# CloudFlare DNS Record
module "cloudflare_dns" {
  source = "../../../modules/cloudflare-dns"

  zone_id    = var.cloudflare_zone_id
  subdomain  = local.environment.subdomain
  repository = local.config.project.repository
}

# Vercel Project (prod)
module "vercel_project" {
  source = "../../../modules/vercel-project"

  project_name     = "${local.config.project.name}-prod"
  organization     = local.config.project.organization
  repository       = local.config.project.repository
  framework        = local.environment.vercel.framework
  root_directory   = local.environment.vercel.root_directory
  build_command    = local.environment.vercel.build_command
  output_directory = local.environment.vercel.output_directory
  domain           = local.domain

  environment_variables = [
    # Non-sensitive
    {
      key    = "CMS_API_URL"
      value  = "https://cms-api.tqer39.workers.dev/v1"
      target = ["production", "preview", "development"]
    },
    {
      key    = "NEXT_PUBLIC_SITE_URL"
      value  = "https://${local.domain}"
      target = ["production", "preview", "development"]
    },
    # Sensitive
    {
      key       = "CMS_API_KEY"
      value     = var.cms_api_key
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "ADMIN_PASSWORD_HASH"
      value     = var.admin_password_hash
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "AUTH_SECRET"
      value     = var.auth_secret
      target    = ["production", "preview"]
      sensitive = true
    },
  ]
}

# Note: Vercel domain verification TXT record must be added manually in CloudFlare
# Get the verification value from Vercel Dashboard -> Settings -> Domains
# Add TXT record: _vercel -> vc-domain-verify=<domain>,<verification-code>
