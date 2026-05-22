resource "google_project_service" "iam_api" {
  project = var.project_id
  service = "iam.googleapis.com"
}

resource "google_project_service" "run_api" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "compute_engine_api" {
  project = var.project_id
  service = "compute.googleapis.com"
}

resource "google_project_service" "artifact_registry" {
  service                    = "artifactregistry.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "serverless_vpc_access" {
  service = "vpcaccess.googleapis.com"
}

resource "google_project_service" "iap_api" {
  service = "iap.googleapis.com"
}

resource "google_project_service" "route_optimization" {
  service = "routeoptimization.googleapis.com"
}

resource "google_project_service" "google_maps_js" {
  service = "maps-backend.googleapis.com"
}