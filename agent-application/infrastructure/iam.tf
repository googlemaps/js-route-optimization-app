resource "google_service_account" "application_service_account" {
  account_id   = "application-service-account"
  display_name = "Application Service Account"

  depends_on = [google_project_service.iam_api]
}

# Access is enforced at load balancer, so allow anyone to pass IAM checks at the Cloud Run level
resource "google_cloud_run_service_iam_binding" "iam_binding" {
  location = google_cloud_run_v2_service.application.location
  service  = google_cloud_run_v2_service.application.name
  role     = "roles/run.invoker"
  members = [
    "serviceAccount:service-${var.project_number}@gcp-sa-iap.iam.gserviceaccount.com",
    "allUsers"
  ]
}

resource "google_project_iam_member" "service_usage" {
  project = var.project_id
  role = "roles/serviceusage.serviceUsageConsumer"
  member = "serviceAccount:${google_service_account.application_service_account.email}"
}

resource "google_project_iam_member" "route_optimization_user" {
  project = var.project_id
  role = "roles/routeoptimization.editor"
  member = "serviceAccount:${google_service_account.application_service_account.email}"
}