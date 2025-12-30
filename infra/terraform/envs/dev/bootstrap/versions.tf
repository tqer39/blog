terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "072693953877-dev-terraform-state"
    key            = "blog/dev/bootstrap/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "dev-terraform-lock"
    encrypt        = true
  }
}
