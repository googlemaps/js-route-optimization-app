# fleet routing app
resource "google_compute_region_network_endpoint_group" "fleetrouting_app_serverless_neg" {
  name                  = "${var.deployment_name}-neg"
  region                = var.region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = module.cloud_run_fleetrouting_app.service_name
  }
}

resource "google_compute_backend_service" "fleetrouting_app_backend" {
  depends_on = [
    google_project_service.identity_aware_proxy
  ]
  name        = "${var.deployment_name}-backend"
  description = null

  protocol = "HTTP2"
  enable_cdn  = false

  backend {
    group = google_compute_region_network_endpoint_group.fleetrouting_app_serverless_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  iap {
    enabled              = true
    oauth2_client_id     = var.iap_client_id
    oauth2_client_secret = var.iap_client_secret
  }
}

# unauthenticated backend (for static maps icons requests)
resource "google_compute_backend_service" "fleetrouting_app_icons_backend" {
  name        = "${var.deployment_name}-icons-backend"
  description = null

  protocol = "HTTP2"
  enable_cdn  = false

  backend {
    group = google_compute_region_network_endpoint_group.fleetrouting_app_serverless_neg.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_url_map" "fleetrouting_app_urls" {
  name            = "${var.deployment_name}-url-map"
  default_service = google_compute_backend_service.fleetrouting_app_backend.id

  host_rule {
    hosts        = ["*"]
    path_matcher = "${var.deployment_name}-paths"
  }

  path_matcher {
    name            = "${var.deployment_name}-paths"
    default_service = google_compute_backend_service.fleetrouting_app_backend.id

    # send icons requests to the unauthenticated backend (for static maps)
    path_rule {
      paths = [
        "/assets/icons/*",
      ]
      service = google_compute_backend_service.fleetrouting_app_icons_backend.id
    }
  }
}

resource "google_compute_target_https_proxy" "lb_https_proxy" {
  name = "lb-https-proxy"
  ssl_certificates = [
    google_compute_managed_ssl_certificate.fleetrouting_app_frontend.id
  ]
  url_map = google_compute_url_map.fleetrouting_app_urls.id
}

resource "google_compute_global_forwarding_rule" "lb_https_forwarding" {
  name                  = "lb-https-forwarding"
  load_balancing_scheme = "EXTERNAL"
  ip_address            = google_compute_global_address.fleetrouting_app_ip.id
  port_range            = "443"
  target                = google_compute_target_https_proxy.lb_https_proxy.id
}

data "google_iam_policy" "fleetrouting_app_authorized_users" {
  depends_on = [
    google_project_service.identity_aware_proxy
  ]
  binding {
    role    = "roles/iap.httpsResourceAccessor"
    members = var.authorized_users
  }
}

resource "google_iap_web_backend_service_iam_policy" "fleetrouting_app_iap_iam" {
  depends_on = [
    google_project_service.identity_aware_proxy
  ]
  web_backend_service = google_compute_backend_service.fleetrouting_app_backend.name
  policy_data         = data.google_iam_policy.fleetrouting_app_authorized_users.policy_data
}
