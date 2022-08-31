locals {
  current_time = timestamp()
}

resource "google_storage_bucket" "app_storage" {
  name                        = random_pet.solution_storage_name.id
  uniform_bucket_level_access = true
  location                    = "US"
}

data "google_project" "project" {}

# Storage IAM
resource "google_storage_bucket_iam_member" "member" {
  bucket = google_storage_bucket.app_storage.name
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.fleetrouting_app.email}"
}

resource "random_pet" "solution_storage_name" {
  length    = 2
  separator = "-"
  prefix    = "dispatcher-app-storage"
  keepers = {
    solution_storage_name = var.deployment_name
  }
}
