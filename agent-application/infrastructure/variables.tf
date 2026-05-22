variable "project_id" {
  type = string
}

variable "project_number" {
  type = string
}

variable "region" {
  type = string
}

variable "iap_client_id" {
  type = string
}

variable "iap_client_secret" {
  type = string
  sensitive = true
}

variable "dns_name" {
  type = string
}

variable "app_container" {
  type = string
}

variable "agent_url" {
  type = string
}

variable "agent_stream_url" {
  type = string
}

variable "maps_api_key" {
  type = string
}

variable "map_id" {
  type = string
}