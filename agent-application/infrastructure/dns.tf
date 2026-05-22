resource "google_compute_global_address" "application_ip" {
  name = "gmpro-agent-ip"
  depends_on = [
    google_project_service.compute_engine_api
  ]
}

