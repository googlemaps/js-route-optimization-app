# vpc
resource "google_compute_network" "serverless_vpc" {
  name                    = "${var.deployment_name}-network"
  auto_create_subnetworks = "false"
}

resource "google_vpc_access_connector" "cloud_run_connector" {
  depends_on = [
    google_project_service.serverless_vpc_access
  ]
  # max length of name is 21 chars, truncate `deployment_name` to fit
  name          = "${substr(var.deployment_name, 0, 16)}-conn"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.serverless_vpc.name
}

resource "google_compute_managed_ssl_certificate" "fleetrouting_app_frontend" {
  name = "${var.deployment_name}-frontend"
  managed {
    domains = [var.dns_name]
  }
}
