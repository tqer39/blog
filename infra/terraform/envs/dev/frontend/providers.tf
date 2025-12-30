provider "aws" {
  region = "ap-northeast-1"

  default_tags {
    tags = {
      Project    = "blog"
      ManagedBy  = "terraform"
      Repository = "github.com/tqer39/blog"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}
