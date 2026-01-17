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

  # Set to valid default to avoid state drift errors
  # Valid values: "" (default), "enhanced", "turbo"
  resource_config = {
    build_machine_type = ""
  }

}

# Custom Domain
resource "vercel_project_domain" "blog" {
  project_id = vercel_project.blog.id
  domain     = var.domain
}

# Environment Variables
resource "vercel_project_environment_variable" "env" {
  for_each = { for env in var.environment_variables : env.key => env }

  project_id = vercel_project.blog.id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
  sensitive  = each.value.sensitive
}
