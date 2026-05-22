resource "google_compute_region_network_endpoint_group" "app_serverless_neg" {
  name                  = "agent-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = google_cloud_run_v2_service.application.name
  }
}

resource "google_compute_backend_service" "app_backend" {
  depends_on = [
    google_project_service.iap_api
  ]
  name        = "agent-backend"
  description = null
  enable_cdn  = false

  backend {
    group = google_compute_region_network_endpoint_group.app_serverless_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  iap {
    enabled = true
    oauth2_client_id     = var.iap_client_id
    oauth2_client_secret = var.iap_client_secret
  }
}

resource "google_compute_url_map" "app_urls" {
  name            = "agent-url-map"
  default_service = google_compute_backend_service.app_backend.id
}

resource "google_compute_target_https_proxy" "lb_https_proxy" {
  name = "lb-https-proxy"
  ssl_certificates = [
    google_compute_managed_ssl_certificate.application_frontend_cert.id
  ]
  url_map = google_compute_url_map.app_urls.id
}

resource "google_compute_global_forwarding_rule" "lb_https_forwarding_rule" {
  name                  = "lb-https-forwarding-rule"
  load_balancing_scheme = "EXTERNAL"
  target                = google_compute_target_https_proxy.lb_https_proxy.id
  ip_address            = google_compute_global_address.application_ip.id
  port_range            = "443"
}