terraform {
  required_version = "1.14.4"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.28.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.16.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "4.4.0"
    }
  }

  backend "s3" {
    bucket  = "terraform-tfstate-tqer39-072693953877-ap-northeast-1"
    key     = "blog/infra/terraform/envs/prod/prod-frontend.tfstate"
    encrypt = true
    region  = "ap-northeast-1"
  }
}
