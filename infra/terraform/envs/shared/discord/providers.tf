terraform {
  required_version = "1.15.1"

  required_providers {
    discord = {
      source  = "Lucky3028/discord"
      version = "2.5.1"
    }
  }
}

provider "discord" {
  token = var.discord_bot_token
}
