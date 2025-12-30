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
