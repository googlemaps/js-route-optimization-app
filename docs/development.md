# Google Fleet Routing App - Development

Follow these steps to set up a local development environment for the Fleet Routing App.

## Google Cloud Project Setup
🛑 Before you can run the app,
you will need access to a Google Cloud project
with **Optimization API** other required services enabled.
You will also need *Service Account* and *API Key* credentials
to authenticate requests.

> ⏭️ If you have already [deployed an instance](deployment.md)
> of **Fleet Routing App** to a Google Cloud project,
> you can use the resources in that project for local development.
> Skip to the [*Authentication*](#authentication) section.

If you don't have an existing deployment
or don't wish to use it for development purposes,
follow these steps to create a new project with the minimum requirements
to run **Fleet Routing App** locally.

### Prerequisites
- **Google account** with rights to create Google Cloud projects in your organization
- Google Cloud **Billing Account** to enable paid services
- [**Google Cloud SDK**](https://cloud.google.com/sdk/docs/install) installed and configured
  > You can use [Google Cloud Shell](https://cloud.google.com/shell) in a web browser
  > to complete this setup without installing anything on your local machine.

### Create Google Cloud Project

Run the following command to create a new Google Cloud project.
If you are not a member of a Google Cloud organization,
omit the `--folder` flag.

```sh
gcloud projects create {PROJECT_ID} --name={PROJECT_NAME} --folder={FOLDER_NUMBER}  --no-enable-cloud-apis
```

> Use the `--no-enable-cloud-apis` flag here
> to prevent default services and resources (VPCs, service accounts, etc.)
> from being created.
> Later, you will explicitly enable just the services required by Fleet Routing App.

Take note of your new `PROJECT_ID`, you will use this value
throughout the remaining steps.

### Enable Billing
**Cloud Fleet Routing** and **Google Maps Platform**, dependencies of
**Fleet Routing App**, are paid services that require a project
to be linked to a billing account before they can be enabled.

Follow the instructions in Google's documentation to
[enable billing for your new project](https://cloud.google.com/billing/docs/how-to/modify-project#enable_billing_for_a_project).

### Enable APIs
The frontend application depends on the following APIs:
- **Cloud Optimization API**
- **Google Maps Distance Matrix**
- **Google Maps Geocoding**
- **Google Maps JavaScript API**,
- **Google Maps Places**
- **Google Maps Static Maps**

Find and enable each of these APIs in the [**APIs & Services > Library**](https://console.cloud.google.com/apis/library)
section of Cloud Console or run the following `gcloud` commands:
```sh
# optimization
gcloud services enable cloudoptimization.googleapis.com --project {PROJECT_ID}
# distance matrix
gcloud services enable distance-matrix-backend.googleapis.com --project {PROJECT_ID}
# geocoding
gcloud services enable geocoding-backend.googleapis.com --project {PROJECT_ID}
# maps javascript
gcloud services enable maps-backend.googleapis.com --project {PROJECT_ID}
# places
gcloud services enable places-backend.googleapis.com --project {PROJECT_ID}
# static maps
gcloud services enable static-maps-backend.googleapis.com --project {PROJECT_ID}
```

### Create API Key
Create [an API key](https://cloud.google.com/docs/authentication/api-keys#creating_an_api_key)
to enable the frontend to use the required Google Maps APIs.

1. Go to **[Google Cloud Console](https://console.cloud.google.com)**
and open your project

2. Navigate to the [**APIs & Services > Credentials**](https://console.cloud.google.com/apis/credentials) section

3. Click the **+Create Credentials** button at the top of the screen, and select **API key**

4. In the resulting window click **Edit API key** to open
the API Key details page. Give it a meaningful name (e.g. "Fleet Routing Maps")
and leave the key unrestricted.

### Create Service Account
Create a service account in your Google Cloud project
to authenticate **Optimization API** requests from **Fleet Routing App**.

Run the following `gcloud` command to create
a `fleetrouting-app` Service Account in your project:

```sh
gcloud iam service-accounts create fleetrouting-app \
  --display-name="Fleet Routing App Service Account" \
  --project={PROJECT_ID}
```

### IAM
Grant your new service account the **Cloud Optimization AI Editor**
(`roles/cloudoptimization.editor`) role,
which is required for **Cloud Fleet Routing** requests.

Add the role to the service account's permissions
in the [**IAM & Admin > IAM**](https://console.cloud.google.com/iam-admin/iam)
section of Cloud Console, or run the following `gcloud` command:

```sh
gcloud projects add-iam-policy-binding {PROJECT_ID} \
  --member=fleetrouting-app@{PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/cloudoptimization.editor
```

---
## Authentication
### Service Account Credentials
To authenticate requests to **Cloud Fleet Routing**,
the backend needs credentials for a Google Cloud service account
with the **Cloud Optimization AI Editor** role.

> ℹ **Cloud Fleet Routing** requests cannot be authenticated with end-user credentials.

[Create a JSON service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)
for the *Fleet Routing App Service Account (`fleetrouting-app@`)*
in your project. Save it to your machine
and set the absolute path of the downloaded credentials JSON file
as the `GOOGLE_APPLICATION_CREDENTIALS` environment variable
(see [*Configure Environment Variables*](#configure-environment-variables) section).

### API Key for Google Maps
To load **Google Maps JavaScript API**
and make other requests to Google Maps Platform APIs,
the frontend needs an **API Key**.

Locate your API Key in the [**APIs & Services > Credentials**](https://console.cloud.google.com/apis/credentials)
section of Cloud Console. Copy its value
and set it as the `MAP_API_KEY` environment variable
(see [*Configure Environment Variables*](#configure-environment-variables) section).

---
## Local Environment

### Prerequisites
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org) LTS v16.

### Clone the Repository
This single repository contains both the `backend` and `frontend`
packages for the Fleet Routing App.
Clone the repository and navigate to the checked-out directory.

```shell
git clone https://github.com/google/cfr.git
cd fleetrouting-app
```

### Install Dependencies
The application uses [Lerna](https://github.com/lerna/lerna)
to build and run the `backend` and `frontend` packages side-by-side
for local development.

Navigate to the `application` directory and install the dependencies with `npm`.

```
cd application
npm install
```

> ℹ️ After installing top-level `application` dependencies,
> the `lerna init` and `lerna bootstrap` commands will run to install dependencies
> in the `backend` and `frontend` sub-packages.


## Run the App

### Configure Environment Variables
Create a `.env` environment variable file at `application/.env`.

Populate `application/.env` file with the details of your Google Cloud project as follows:

| Varable Name | Description | Default |
| - | - | - |
| **Required** | | |
| PROJECT_ID | ID (not number) of your Google Cloud project, a.k.a. **Optimization API** "parent" project  | |
| API_ROOT | URL of the backend API (probably `http://localhost:8080/api`) |  |
| FRONTEND_PROXY | URL of the frontend Angular development server (probably `http://localhost:4200/`) - *FOR DEVELOPMENT USE ONLY* |  |
| MAP_API_KEY | API Key to load Google Maps JavaScript API in frontend |  |
| GOOGLE_APPLICATION_CREDENTIALS | Path to a service account credentials JSON file to authenticate Google API requests | *Default application credentials* |
| **Optional** | | |
| LOG_FORMAT | Log format to output (`google` or `pretty`) | `google` |
| LOG_LEVEL | Minimum [Pino log level](https://getpino.io/#/docs/api?id=level-string) to output | `info` |
| GRPC_TRACE | gRPC component(s) to show internal logs for (or set to `all` to log every component). *See [gRPC Troubleshooting guide](https://github.com/grpc/grpc/blob/master/TROUBLESHOOTING.md)*. | If not set, no internal gRPC logs are enabled |
| GRPC_VERBOSITY | Minimum gRPC log level to output (when `GRPC_TRACE` is enabled). | `ERROR` |
| ALLOW_USER_GCS_STORAGE | When `true`, allow user to save scenario/solution files in a **Cloud Storage** bucket (see `STORAGE_BUCKET_NAME`) | `false` |
| STORAGE_BUCKET_NAME | (Optional) Storage bucket to save scenario/solution files (when `ALLOW_USER_GCS_STORAGE` is enabled) |  |
| STORAGE_PROJECT_ID | ID of the project that owns the **Storage** bucket referenced in `STORAGE_BUCKET_NAME` (if different than `PROJECT_ID`) | If not set, `PROJECT_ID` is used |
| STORAGE_CREDENTIALS | Path to a service account credentials JSON file to authenticate Storage API requests (if different than default or `GOOGLE_APPLICATION_CREDENTIALS`) | *Default application credentials* |

Template:

```env
PROJECT_ID={YOUR_PROJECT_ID}
API_ROOT=http://localhost:8080/api
FRONTEND_PROXY=http://localhost:4200/
MAP_API_KEY={YOUR_API_KEY}
STORAGE_BUCKET_NAME={YOUR_BUCKET_NAME}
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Start
To run the `backend` and `frontend` together in development mode,
navigate to the `application` directory and run `npm start`.
*Lerna* will start both packages in parallel:
- `backend` will start in "watch" mode, recompiling and restarting the server when changes are detected
- `frontend` will start the **Angular** development server (`ng serve`)

```bash
cd application
npm start
```

> 💡 Expect the backend to start near-instantly.
> However, the frontend may take several minutes until it's ready,
> depending on the speed of the Angular build.


After the frontend Angular build finishes,
open <http://localhost:8080> in your browser to view the app.
