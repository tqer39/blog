# GitHub OIDC Provider data source
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# Deploy Role for GitHub Actions
resource "aws_iam_role" "deploy" {
  name = "${var.aws_env_name}-${var.repository}-deploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.organization}/${var.repository}:*"
          }
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = merge(var.tags, {
    Name        = "${var.aws_env_name}-${var.repository}-deploy-role"
    Environment = var.app_env_name
  })
}

# Policy for deploy role
resource "aws_iam_role_policy" "deploy" {
  name = "${var.aws_env_name}-${var.repository}-deploy-policy"
  role = aws_iam_role.deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::terraform-tfstate-tqer39-${var.aws_account_id}-ap-northeast-1",
          "arn:aws:s3:::terraform-tfstate-tqer39-${var.aws_account_id}-ap-northeast-1/*"
        ]
      },
    ]
  })
}
