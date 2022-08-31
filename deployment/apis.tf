# optimization / fleet routing
resource "google_project_service" "maps_for_fleet_routing" {
  service = "mapsfleetrouting.googleapis.com"

  depends_on = [
    google_project_service.distance_matrix
  ]
}

resource "google_project_service" "optimization" {
  service = "cloudoptimization.googleapis.com"
  depends_on = [
    google_project_service.maps_for_fleet_routing
  ]
}

# maps platform
resource "google_project_service" "maps_javascript" {
  service = "maps-backend.googleapis.com"
}

resource "google_project_service" "static_maps" {
  service = "static-maps-backend.googleapis.com"
}

resource "google_project_service" "distance_matrix" {
  service = "distance-matrix-backend.googleapis.com"
}

resource "google_project_service" "geocoding" {
  service = "geocoding-backend.googleapis.com"
}

resource "google_project_service" "places" {
  service = "places-backend.googleapis.com"
}

# core cloud services
resource "google_project_service" "compute_engine" {
  service = "compute.googleapis.com"
}

resource "google_project_service" "cloud_run" {
  service = "run.googleapis.com"
}

resource "google_project_service" "identity_aware_proxy" {
  service = "iap.googleapis.com"
}

resource "google_project_service" "secret_manager" {
  service = "secretmanager.googleapis.com"
}

resource "google_project_service" "serverless_vpc_access" {
  service = "vpcaccess.googleapis.com"
}

resource "google_project_service" "storage" {
  service = "storage-component.googleapis.com"
}
