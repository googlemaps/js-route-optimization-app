# Google Fleet Routing App - Development

Follow these steps to set up a local development environment for the Fleet Routing App.

## Google Cloud Project
🛑 Before you can run the app,
you will need access to a Google Cloud project
with **Optimization API** and other required resources enabled.

See [project setup guide](project.md) for instructions.

## Prerequisites
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org) LTS v16.

### Service Account Credentials
To authenticate requests to **Cloud Fleet Routing**,
the backend needs credentials for a Google Cloud Platform service account
with the *Cloud Optimization AI Editor* role.

> ℹ **Cloud Fleet Routing** requests cannot be authenticated with end-user credentials.

In [project setup](project.md), a service account was created named
*Fleet Routing App Service Account (fleetrouting-app@)*.
[Create a JSON service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys)
for that service account, download it to your machine,
and set the path to the credentials JSON file
as the `GOOGLE_APPLICATION_CREDENTIALS` environment variable
(see *Configure Environment Variables* section).

### API Key for Google Maps
To load the **Google Maps JavaScript API**
and make other request to Google Maps Platform APIs,
the frontend needs an **API Key**.

In [project setup](project.md), you created an API Key for use with Google Maps.
Locate this key in Cloud Console and set it as the `MAP_API_KEY` environment variable
(see *Configure Environment Variables* section).


## Clone the Repository
This single repository contains both the backend and frontend
packages for the Fleet Routing App.
Clone the repository and navigate to the checked-out directory.

```shell
git clone https://github.com/google/cfr.git
cd fleetrouting-app
```

## Install Dependencies
The application uses [Lerna](https://github.com/lerna/lerna)
to build and run the backend and frontend packages side-by-side
for local development.

### Node.js
Requires [Node.js](https://nodejs.org) LTS v16.

Navigate to the `application` directory and install the dependencies.

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
Populate the file with details from your Google Cloud project as follows:

| Varable Name | Description | Default |
| - | - | - |
| **Required** | | |
| PROJECT_ID | ID (not number) of your Google Cloud project, a.k.a. **Optimization API** "parent" project  | |
| API_ROOT | URL of the backend API (probably `http://localhost:8080/api`) |  |
| FRONTEND_PROXY | URL of the frontend Angular development server (probably `http://localhost:4200`) - *FOR DEVELOPMENT USE ONLY* |  |
| MAP_API_KEY | API Key to load Google Maps JavaScript API in frontend |  |
| GOOGLE_APPLICATION_CREDENTIALS | Path to a service account credentials JSON file to authenticate Google API requests | *Default application credentials* |
| **Optional** | | |
| LOG_FORMAT | Log format to output (`google` or `pretty`) | `google` |
| LOG_LEVEL | Minimum [Pino log level](https://getpino.io/#/docs/api?id=level-string) to output | `info` |
| GRPC_TRACE | gRPC component(s) to show internal logs for (or set to `all` to log every component). *See [gRPC Troubleshooting guide](https://github.com/grpc/grpc/blob/master/TROUBLESHOOTING.md)*. | If not set, no internal gRPC logs are enabled |
| GRPC_VERBOSITY | Minimum gRPC log level to output (when `GRPC_TRACE` is enabled). | `ERROR` |
| ALLOW_USER_GCS_STORAGE | When `true`, allow user to store scenario/solution files in the **Storage** bucket | `false` |
| STORAGE_BUCKET_NAME | Storage bucket to store map icons and (optionally) scenario/solution files |  |
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
To run the backend and frontend together in development mode,
navigate to the `application` directory and run `npm start`.
*Lerna* will start both packages in parallel:
- `backend` will start in "watch" mode, recompiling and restarting the server when changes are detected
- `frontend` will start the Angular devevlopment server

```bash
cd application
npm start
```

> 💡 Expect the backend to start near-instantly.
> However, the frontend may take several minutes until it's ready,
> depending on the speed of the Angular build.


After the frontend Angular build finishes,
open <http://localhost:8080> in your browser to view the app.
