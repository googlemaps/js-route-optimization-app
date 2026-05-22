# vpc
resource "google_compute_network" "serverless_vpc" {
  name                    = "agent-app-network"
  auto_create_subnetworks = "false"
}

resource "google_compute_managed_ssl_certificate" "application_frontend_cert" {
  name = "application-frontend-cert"
  managed {
    domains = [var.dns_name]
  }
}