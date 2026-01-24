# Documentation Site Infrastructure
# Cloudflare Pages for static documentation hosting

locals {
  config = yamldecode(file("${path.module}/../../../config.yml"))
}

module "docs_pages" {
  source = "../../../modules/cloudflare-pages"

  account_id        = var.cloudflare_account_id
  project_name      = "blog-docs"
  production_branch = "main"

  zone_id       = var.cloudflare_zone_id
  subdomain     = "blog-docs"
  custom_domain = "blog-docs.${local.config.project.domain}"
}

# Note: Deployment is handled by GitHub Actions using wrangler/pages-action.
# The Pages project created here is a placeholder that will be populated
# by the CI/CD pipeline when changes are pushed to main.
