terraform {
  required_version = "1.14.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.27.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.15.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "4.2.0"
    }
  }

  backend "s3" {
    bucket         = "072693953877-prod-terraform-state"
    key            = "blog/prod/main/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "prod-terraform-lock"
    encrypt        = true
  }
}
