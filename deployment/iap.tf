# IAP service account, required to enable IAP for Cloud Run
# https://cloud.google.com/iap/docs/enabling-cloud-run
resource "google_project_service_identity" "iap_sa" {
  provider = google-beta
  service  = "iap.googleapis.com"
}
