terraform {
  required_version = "1.14.4"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.32.0"
    }
  }
  backend "s3" {
    bucket  = "terraform-tfstate-tqer39-072693953877-ap-northeast-1"
    key     = "blog/infra/terraform/envs/prod/prod-bootstrap.tfstate"
    encrypt = true
    region  = "ap-northeast-1"
  }
}
