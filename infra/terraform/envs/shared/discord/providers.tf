terraform {
  required_version = "1.14.3"

  required_providers {
    discord = {
      source  = "Lucky3028/discord"
      version = "2.2.2"
    }
  }
}

provider "discord" {
  token = var.discord_bot_token
}
