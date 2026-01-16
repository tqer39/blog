# Vercel Project
resource "vercel_project" "blog" {
  name      = var.project_name
  framework = var.framework

  git_repository = {
    type = "github"
    repo = "${var.organization}/${var.repository}"
  }

  root_directory   = var.root_directory
  build_command    = var.build_command
  output_directory = var.output_directory

  lifecycle {
    ignore_changes = [
      build_machine_type,
      resource_config,
      serverless_function_region,
    ]
  }
}

# Custom Domain
resource "vercel_project_domain" "blog" {
  project_id = vercel_project.blog.id
  domain     = var.domain
}
