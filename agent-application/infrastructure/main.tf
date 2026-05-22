terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "7.9.0"
    }

    google-beta = {
      source = "hashicorp/google-beta"
      version = "7.9.0"
    }
  }
}

provider "google" {
  project               = var.project_id
  billing_project       = var.project_id
  region                = var.region
  user_project_override = true
}

provider "google-beta" {
  project               = var.project_id
  billing_project       = var.project_id
  region                = var.region
  user_project_override = true
}