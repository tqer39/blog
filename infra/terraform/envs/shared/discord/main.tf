locals {
  config   = yamldecode(file("../../../config.yml"))
  discord  = local.config.discord
  channels = { for ch in local.discord.channels : ch.name => ch }
}

# Reference existing Discord server
data "discord_server" "blog" {
  server_id = local.discord.server_id
}

# CI/CD Category
resource "discord_category_channel" "cicd" {
  server_id = data.discord_server.blog.id
  name      = "CI/CD"
  position  = 1
}

# Text Channels
resource "discord_text_channel" "blog_notifications" {
  server_id = data.discord_server.blog.id
  name      = "blog-notifications"
  category  = discord_category_channel.cicd.id
  topic     = "Blog CI/CD notifications (dev environment)"
  position  = 0
}

resource "discord_text_channel" "blog_alerts" {
  server_id = data.discord_server.blog.id
  name      = "blog-alerts"
  category  = discord_category_channel.cicd.id
  topic     = "Blog CI/CD alerts (prod environment)"
  position  = 1
}

# Webhooks
resource "discord_webhook" "blog_dev" {
  channel_id = discord_text_channel.blog_notifications.id
  name       = "Blog Dev Notifications"
}

resource "discord_webhook" "blog_prod" {
  channel_id = discord_text_channel.blog_alerts.id
  name       = "Blog Prod Alerts"
}
