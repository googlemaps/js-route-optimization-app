resource "google_compute_global_address" "fleetrouting_app_ip" {
  name = var.static_ip_address_name
  depends_on = [
    google_project_service.compute_engine
  ]
}

resource "google_dns_record_set" "fleetrouting_app_ip_records" {
  project      = var.dns_project
  managed_zone = var.dns_zone

  name = "${var.dns_name}."
  type = "A"
  ttl  = 300

  rrdatas = [
    google_compute_global_address.fleetrouting_app_ip.address
  ]
}
