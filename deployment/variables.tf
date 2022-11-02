variable "project" {
  type        = string
  description = "Project to deploy resources to"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$", var.project))
    error_message = "Not a valid a Google Cloud Project ID. Do not use the project's name or number, must be its ID."
  }
}

variable "region" {
  type        = string
  description = "Deployment region"
  default     = "us-central1"
}

variable "deployment_name" {
  type        = string
  description = "Name applied to deployed resources. Must be kebab case, 1-25 characters. *For backward compatibility with existing deployments, new deployments should use the default value."
  default     = "fleetrouting-app"

  validation {
    condition     = can(regex("^[a-z]+(-[a-z]+)*$", var.deployment_name))
    error_message = "Deployment name must be kebab case."
  }

  validation {
    condition     = can(regex("^.{1,25}$", var.deployment_name))
    error_message = "Deployment name must be 1-25 characters."
  }
}

variable "deployment_tag" {
  type        = string
  description = "Application version tag to deploy"
}

variable "dns_name" {
  type        = string
  description = "Globally resolvable DNS name for the application endpoint"
}

variable "dns_zone" {
  type        = string
  description = "Name of the zone to create `dns_name` A record(s) in"
}

variable "dns_project" {
  type        = string
  description = "Project that owns `dns_zone`"
}

variable "static_ip_address_name" {
  type        = string
  description = "Name of Google Cloud Global static IP address"
  default     = "fleetrouting-app-ip"
}

variable "maps_api_key" {
  type        = string
  description = "Maps API key"
  sensitive   = true
}

variable "iap_client_id" {
  type        = string
  description = "IAP Client ID"
  sensitive   = true
}

variable "iap_client_secret" {
  type        = string
  description = "IAP Client secret"
  sensitive   = true
}

variable "image_repo_project" {
  type        = string
  description = "Google Cloud project ID hosting the Artifact Repository"
  default     = "fleetrouting-app-ops"
}

variable "image_repo_location" {
  type        = string
  description = "Location hosting the `image_repo`"
  default     = "us"
}

variable "image_repo_id" {
  type        = string
  description = "ID of the Artifact Registry repository"
  default     = "fleetrouting-app"
}

variable "image_repo_channel" {
  type        = string
  description = "Artifact Registry channnel sub-folder (`snapshot` or `release`)"
  default     = "release"

  validation {
    condition     = contains(["snapshot", "release"], var.image_repo_channel)
    error_message = "Image channel must be either `snapshot` or `release`."
  }
}

variable "allow_experimental_features" {
  type        = string
  description = "When 'true', enables experimental CFR features (project must be allow-listed by Google)"
  default     = "false"

  validation {
    condition     = contains(["true", "false"], var.allow_experimental_features)
    error_message = "Must be either `'true'` or `'false'` (hint: should be a string literal, not a boolean value)."
  }
}

variable "allow_user_gcs_storage" {
  type        = string
  description = "When 'true', users can save files to GCS"
  default     = "false"

  validation {
    condition     = contains(["true", "false"], var.allow_user_gcs_storage)
    error_message = "Must be either `'true'` or `'false'` (hint: should be a string literal, not a boolean value)."
  }
}

variable "authorized_users" {
  type        = list(string)
  description = "List of users authorized to use the Fleet Routing applicaiton"
  default     = []
}
