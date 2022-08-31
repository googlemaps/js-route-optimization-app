terraform {
  required_version = ">=1.1.0"

  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "3.1.3"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.7.2"
    }
    google = {
      source  = "hashicorp/google"
      version = "4.22.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "4.22.0"
    }
  }
}

provider "google" {
  project = var.project
  region  = var.region
}

provider "google-beta" {
  project = var.project
  region  = var.region
}
