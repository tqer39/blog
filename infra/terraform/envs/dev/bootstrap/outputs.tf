output "deploy_role_arn" {
  description = "ARN of the deploy role for GitHub Actions"
  value       = module.deploy_role.role_arn
}
