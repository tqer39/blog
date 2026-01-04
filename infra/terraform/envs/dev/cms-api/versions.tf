terraform {
  required_version = "1.14.3"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.15.0"
    }
  }

  backend "s3" {
    bucket         = "tqer39-terraform-state"
    key            = "blog/dev/cms-api/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}
