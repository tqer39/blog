terraform {
  required_version = "1.14.4"

  required_providers {
    discord = {
      source  = "Lucky3028/discord"
      version = "2.3.0"
    }
  }
}

provider "discord" {
  token = var.discord_bot_token
}
