# Vercel Project
resource "vercel_project" "blog" {
  name      = var.project_name
  framework = var.framework

  git_repository = {
    type = "github"
    repo = "${var.organization}/${var.repository}"
  }

  build_command    = var.build_command
  output_directory = var.output_directory

  environment = [
    for env_var in var.environment_variables : {
      key    = env_var.key
      value  = env_var.value
      target = env_var.target
    }
  ]
}

# Custom Domain
resource "vercel_project_domain" "blog" {
  project_id = vercel_project.blog.id
  domain     = var.domain
}
