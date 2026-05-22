resource "google_artifact_registry_repository" "api-registry" {
  location      = var.region
  repository_id = "application-registry"
  format        = "DOCKER"

  depends_on = [google_project_service.artifact_registry]
}
