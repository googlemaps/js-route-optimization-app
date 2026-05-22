resource "google_cloud_run_v2_service" "application" {
  name     = "gmpro-agent"
  location = "us-central1"
  deletion_protection = false
  default_uri_disabled = true
  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  scaling {
      manual_instance_count = 0
      min_instance_count = 0
      max_instance_count = 10
    }

  template {
    service_account = google_service_account.application_service_account.email
    containers {
      image = var.app_container
      env {
        name = "AGENT_URL"
        value = var.agent_url
      }
      env {
        name = "AGENT_STREAM_URL"
        value = var.agent_stream_url
      }
      env {
        name = "PROJECT_ID"
        value = var.project_id
      }
      env {
        name = "API_URL"
        value = "https://${var.dns_name}"
      }
      env {
        name = "MAPS_API_KEY"
        value = var.maps_api_key
      }
      env {
        name = "MAP_ID"
        value = var.map_id
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "2048Mi"
        }
      }
    }
  }
}