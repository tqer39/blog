terraform {
  backend "s3" {
    bucket  = "terraform-tfstate-tqer39-072693953877-ap-northeast-1"
    key     = "blog/infra/terraform/envs/shared/discord.tfstate"
    region  = "ap-northeast-1"
    encrypt = true
  }
}
