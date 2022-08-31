# Google Fleet Routing App - Deployment

Follow these steps to deploy the Google **Fleet Routing App** container image
and supporting resources to an initialized Google Cloud Platform (GCP) project.

> 🛑 This document assumes that you have created
> and initialized a GCP project as described in the
> [project creation and configuration guide](project.md).
> If you have not created a project according to that process,
> go follow those steps, then come back here to continue with deployment.


## Prerequisites


- [**Google Cloud SDK**](https://cloud.google.com/sdk/docs/install) (`gcloud` CLI)
- [**Terraform CLI**](https://learn.hashicorp.com/tutorials/terraform/install-cli) v1.0 or later
- Access to the Fleet Routing App [source code repository](https://source.cloud.google.com/fleetrouting-app-ops/fleetrouting-app)


## Authorize `gcloud` CLI
The `gcloud` commands in the following steps will require
the CLI to be logged in as a Google account
with permission to modify the target project.

Additionally, **Terraform** will run as your `gcloud` *Application Default Credentials*.

If not already configured, run the following commands
to authorize the CLI and set your default credentials:
```sh
gcloud auth login

gcloud auth application-default login
```


## Get the code
Clone the repo with the following command:
```sh
gcloud source repos clone fleetrouting-app --project=fleetrouting-app-ops
cd fleetrouting-app
```

## Deploy the Fleet Routing Application

Open a shell to the root of the cloned source code repo
and follow these steps.

### Create a Configuration File

Create a file named `local.auto.tfvars`
in the `deployment/` directory:
```sh
touch deployment/local.auto.tfvars
```

Edit this file and populate `local.auto.tfvars` with appropriate values for your project.
The following sections explain the variables in detail.

#### Required Variables
At minimum, the following variables must be populated in your `local.auto.tfvars` file. If you followed the [project setup instructions](project.md), these values should be familiar:

- `project` - GCP *project ID* (NOT number or name) of the project you created in [project setup](project.md).
- `dns_name` - Fully-qualified domain name to host the app at, _without_ any   protocol (e.g. `fleetrouting.example.com`)
  - This domain must be registered in a **Google Cloud DNS zone** and be editable by your Google account.
- `deployment_tag` - Container version to deploy (`4.2.2` or later).
- `maps_api_key` - API Key credential created in [project setup](project.md) to enable Google Maps Platform features.
- `iap_client_id` and `iap_client_secret` - The OAuth credential you created during [project setup](project.md). Find these on the Cloud Console page for your project (_APIs & Services > Credentials > OAuth 2 Client IDs_). Click the name of your key and copy the values from the right hand side of the page.
- `authorized_users` - An array of users and/or groups of users who are authorized to access the app
  - Each entry should follow [IAM principal syntax](https://registry.terraform.io/providers/hashicorp/google/latest/docs/data-sources/iam_policy#members)
    (e.g. `user:alex@example.com`, `group:cfr-users@example.com`, `domain:example.com`).
  - Be sure to include yourself in this list
    (project owners do not automatically inherit *IAP-secured Web App User* permission).

##### Required Variables for Non-Google Deployments

The following variables are additionally required when deploying outside of
the Google-owned `fleetrouting.app` domain:

- `dns_zone` - ID of the Cloud DNS zone that owns your `dns_name` domain
- `dns_project` - ID of the GCP project that contains `dns_zone`

##### Sample Minimal `local.auto.tfvars` File
```hcl
project           = "my-fleetrouting-123"
dns_name          = "fleetrouting.example.com"

# for domains other than fleetrouting.app
dns_zone    = "example-com-zone"
dns_project = "my-dns-project-456"

deployment_tag = "4.2.2"  # or later

# find the following values in Cloud Console (APIs & Services > Credentials)
maps_api_key      = "AIzaBc123..."
iap_client_id     = "1234...5678-ZXhh...ZSA2.apps.googleusercontent.com"
iap_client_secret = "Z9y8X7..."

authorized_users = [
  "user:alex@example.com",
  "group:cfr-users@example.com",
  "domain:example.com"
]
```

#### Optional Variables
The following variables are not necessary to specify for most deployments.
Only set these when you need to override the defaults
or are referencing resources that already exist from a previous deployment.

| Variable Name | Description | Default |
| - | - | - |
| `allow_experimental_features` | When `'true'`, enables experimental CFR features in the app. Project must be allow-listed by Google for features to work. Must be a string literal (i.e. not a boolean value). | `'false'` |
| `allow_user_gcs_storage` | When `'true'`, enables scenarios and solutions to be stored in Google Cloud Storage. Must be a string literal (i.e. not a boolean value). | `'false'` |
| ~~`deployment_name`~~ | Deprecated: Name/prefix applied to deployed resources (must be kebab case).<br>*The `deployment_name` variable exists for backward compatibility with existing environments. New deployments should use the default value.* | `fleetrouting-app` |
| `image_repo_channel` | Build channel the `deployment_tag` belongs to (`release` or `snapshot`). Should be `release` for all official builds, `snapshot` builds should only be used for development and testing. | `release` |
| `static_ip_address_name` | Name of the external IP address. Set if you need to reference an existing IP address (e.g. from v3) in a new/updated deployment. | `fleetrouting-app-ip` |
| `region` | Google Cloud region to deploy to. Must be a supported [Cloud Run region](https://cloud.google.com/run/docs/locations). | `us-central1` |


### Deploy the GCP resources and application
Navigate to the `deployment/` directory.
Initialize **Terraform** and run the `apply` command to deploy the app and its resources:
```sh
cd deployment
terraform init

terraform apply
```

Resolve any errors that may appear due to missing or invalid values
in your `local.auto.tfvars` file.

Review the planned changes and, if everything looks good,
enter `yes` to confirm the deployment.

Expect the deployment process to take **10-20 minutes** to complete.
Terraform may take up to 10 minutes to deploy all the resources.
And it may take an additional 10 minutes after `apply` completes
for the HTTPS certificate to finish provisioning
and the load balancer to become healthy and start serving the app.

## Verify the Application is Running

Open your web browser and periodically refresh your deployed URL: `https://{domain_name}`

- Initially, expect to see "connection reset errors".
- Next, as the load balancer starts to come online, you may see "temporarily unavailable" errors.
- Then, expect your browser to display "SSL cipher" errors until
the HTTPS certificate finishes provisioning.

The application is live when you see a **Google Sign-In** page upon loading the URL.
After signing in, you should see the app's landing page
with "Cloud Fleet Routing API" displayed at the top.

---
### Troubleshooting

#### Google Sign-In Displays `Error 400: redirect_uri_mismatch`
Expand the **Request Details** section and check the displayed `redirect_uri` value.

Open your **OAuth Client ID** credential in Cloud Console
and verify that the URL in the error message
matches the configured **Authorized redirect URI**
(see *Configure the Authorized Redirect URI* section of [project setup](project.md).

Edit the **Authorized redirect URI** to match the `redirect_uri` in the error message.

#### Error: Page not found (`404`)
The Cloud Run service failed to deploy or is unhealthy.

Verify that `deployment_tag` is a valid container version.
If not, change the value and re-run `terraform apply`.

Go to the Cloud Run section of Cloud Console and check for errors.

### Google Sign-In Fails for External Users
An authorized user (from your `authorized_user` list) may still be rejected
if they are not a member of your GCP organization.
This is working as intended because OAuth was originally configured
as an *Internal* app, meaning it only supports identities from your organization.

To allow users outside your organization to access the app,
you must change the OAuth user type from *Internal* to *External*,
and set the publishing status to *Testing*.

1. Go to **[Google Cloud Console](https://console.cloud.google.com)** and open your project
2. Navigate to the **APIs & Services** > **OAuth consent screen** section
3. Click the **MAKE EXTERNAL** button
4. In the dialog that appears, change the **Publishing status** to **Testing** and click **CONFIRM**

> See [OAuth support](https://support.google.com/cloud/answer/10311615#publishing-status&zippy=%2Ctesting)
> for the limitations on apps published in *Testing* mode.

---
## Change Authorized Users
To add or remove authorized users,
edit the `authorized_users` list in `local.auto.tfvars`
and re-run the `terraform apply` command.
