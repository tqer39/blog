output "dns_record_id" {
  description = "作成された DNS レコード ID"
  value       = module.dns.record_id
}

output "dev_fqdn" {
  description = "dev 環境の FQDN"
  value       = "${local.env_config.subdomain}.${local.domain}"
}
