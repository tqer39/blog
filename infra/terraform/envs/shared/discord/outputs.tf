output "server_id" {
  description = "Discord server ID"
  value       = data.discord_server.blog.id
}

output "category_cicd_id" {
  description = "CI/CD category channel ID"
  value       = discord_category_channel.cicd.id
}

output "channel_notifications_id" {
  description = "Blog notifications channel ID"
  value       = discord_text_channel.blog_notifications.id
}

output "channel_alerts_id" {
  description = "Blog alerts channel ID"
  value       = discord_text_channel.blog_alerts.id
}

output "webhook_dev_url" {
  description = "Webhook URL for dev notifications"
  value       = discord_webhook.blog_dev.url
  sensitive   = true
}

output "webhook_prod_url" {
  description = "Webhook URL for prod alerts"
  value       = discord_webhook.blog_prod.url
  sensitive   = true
}
