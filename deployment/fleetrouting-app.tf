# run-as service account
resource "google_service_account" "fleetrouting_app" {
  account_id   = "fleetrouting-app"
  display_name = "Fleet Routing App Service Account"
}

# Optimization IAM
resource "google_project_iam_binding" "cloudoptimization_editor" {
  project = data.google_project.project.id
  role    = "roles/routeoptimization.editor"

  members = [
    "serviceAccount:${google_service_account.fleetrouting_app.email}",
  ]

  depends_on = [
    google_project_service.optimization
  ]
}

# allow cloud run service agent to read from image repo
# (https://cloud.google.com/iam/docs/service-agents)
# service agent acccount may not be immediately available
# to bind to after enabling cloud run
resource "time_sleep" "wait_for_cloud_run_service_agent" {
  depends_on      = [google_project_service.cloud_run]
  create_duration = "60s"
}

# maps api key secret
resource "google_secret_manager_secret" "maps_api_key" {
  depends_on = [
    google_project_service.secret_manager
  ]

  secret_id = "dashboard-maps-api-key"
  labels    = {}

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_iam_member" "maps_api_key" {
  secret_id = google_secret_manager_secret.maps_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.fleetrouting_app.email}"
}

resource "google_secret_manager_secret_version" "maps_api_key" {
  secret      = google_secret_manager_secret.maps_api_key.id
  secret_data = var.maps_api_key
}


# cloud run services
module "cloud_run_fleetrouting_app" {
  source  = "GoogleCloudPlatform/cloud-run/google"
  version = "~> 0.2.0"

  project_id   = data.google_project.project.project_id
  location     = var.region
  service_name = var.deployment_name
  image        = "${var.image_repo_location}-docker.pkg.dev/${var.image_repo_project}/${var.image_repo_id}/${var.image_repo_channel}:${var.deployment_tag}"

  service_account_email = google_service_account.fleetrouting_app.email

  env_vars = [
    {
      name  = "PROJECT_ID"
      value = data.google_project.project.project_id
    },
    {
      name  = "API_ROOT"
      value = "https://${var.dns_name}/api"
    },
    {
      name  = "ALLOW_EXPERIMENTAL_FEATURES"
      value = var.allow_experimental_features
    },
    {
      name  = "ALLOW_USER_GCS_STORAGE"
      value = var.allow_user_gcs_storage
    },
    {
      name  = "STORAGE_BUCKET_NAME"
      value = google_storage_bucket.app_storage.name
    },
  ]

  env_secret_vars = [
    {
      name = "MAP_API_KEY"
      value_from = [{
        secret_key_ref = {
          name = split("/", google_secret_manager_secret.maps_api_key.name)[3]
          key  = "latest"
        }
      }]
    }
  ]


  limits = {
    cpu : "1000m"
    memory : "512Mi"
  }
  container_concurrency = 80
  timeout_seconds       = 3600

  # access enforced at the load balancer
  members = [
    "allUsers"
  ]

  service_annotations = {
    "run.googleapis.com/ingress" : "internal-and-cloud-load-balancing"
  }

  template_annotations = {
    "run.googleapis.com/vpc-access-connector" : google_vpc_access_connector.cloud_run_connector.name
    "run.googleapis.com/vpc-access-egress" : "private-ranges-only"
    "autoscaling.knative.dev/minScale" : "0"
    "autoscaling.knative.dev/maxScale" : "8"
  }
}
