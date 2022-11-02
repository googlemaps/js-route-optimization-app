# Google Fleet Routing App - Project Setup
Follow these instructions to create a Google Cloud project
and configure it so it's ready to deploy
an instance of **Fleet Routing App** into.

> ⏭️ If you have already completed the one-time setup steps below,
> you can skip to the [application deployment instructions](deployment.md).

## Prerequisites

- **Google account** with rights to create Google Cloud projects in your organization
- Google Cloud **Billing Account** to enable paid services
- [**Google Cloud SDK**](https://cloud.google.com/sdk/docs/install) installed and configured
  > You can use [Google Cloud Shell](https://cloud.google.com/shell) in a web browser
  > to complete this setup without installing anything on your local machine.
- DNS zone where the app will be hosted, registered with **Google Cloud DNS**
  > The target domain can be managed either in the same project as the app
  > or in a separate project you control.
  > But it must be registered with **Google Cloud DNS**.

---
## Create a Google Cloud project

### Authenticate the `gcloud` CLI

Run the this command and follow the prompts to log in with your Google account:

```sh
gcloud auth login
```

### Create a Google Cloud project

Run the following command to create a new Google Cloud project.
If you are not a member of a Google Cloud organization,
omit the `--folder` flag.

```sh
gcloud projects create {PROJECT_ID} --name={PROJECT_NAME} --folder={FOLDER_NUMBER}  --no-enable-cloud-apis
```

> Use the `--no-enable-cloud-apis` flag here
> to prevent default services and resources (VPCs, service accounts, etc.)
> from being created.
> Later, **Terraform** will explicitly enable just the services required by Fleet Routing App.

### Enable Billing
**Cloud Fleet Routing** and **Google Maps Platform** and dependencies of
**Fleet Routing App** are paid services that require a project
to be linked to a billing account before they can be enabled.

Follow the instructions in Google's documentation to
[enable billing for your new project](https://cloud.google.com/billing/docs/how-to/modify-project#enable_billing_for_a_project).


---
## Create a Google Maps API Key

The frontend application depends on **Google Maps JavaScript API**
as well as the **Geocoding**, **Places**, and **Static Maps** APIs.

Create [an API key](https://cloud.google.com/docs/authentication/api-keys#creating_an_api_key)
to enable the frontend to use the required Google Maps APIs.

1. Go to **[Google Cloud Console](https://console.cloud.google.com)** and open your project

2. Navigate to the [**APIs & Services > Credentials**](https://console.cloud.google.com/apis/credentials) section

3. Click the **+Create Credentials** button at the top of the screen, and select **API key**

4. In the resulting window click **Edit API key** to open the API Key details page.
   Give it a meaningful name (e.g. "Fleet Routing Maps").
   Leave the key unrestricted for now.

   > 🕑 After deployment is complete, you may return to this screen to add restrictions.
   > See *Restrict API Key* section for details.

> 📝 Take note of your new API Key value.
> You will need to reference it later for deployment configuration.

### Restrict API Key

To prevent unauthorized use of your API Key,
add the following restrictions after deployment is complete.

#### Application Restrictions
DO NOT add any **Application Restrictions**,
they will break the Geocoding API integration.

#### API Restrictions
In the **API restrictions** section, toggle the **Restrict Key** option
and select the following APIs from the dropdown checklist:
   - Geocoding API
   - Maps JavaScript API
   - Places API
   - Static Maps API


## Configure OAuth
The application relies on **Identity-Aware Proxy** (IAP) to authenticate users.
IAP requires OAuth to be configured for the project.

> Each organization has its own security practices.
> The minimal goal with this configuration is to restrict access
> to members of your Google Cloud or Google Workspace organization.

### Configure Consent Screen

1. Go to **[Google Cloud Console](https://console.cloud.google.com)** and open your project

2. Navigate to the [**APIs & Services > OAuth consent screen**](https://console.cloud.google.com/apis/credentials) section

3. Choose **User Type > Internal** and click **Create**

4. Enter the appropriate information in the required **App name**, **User support email**, and **Developer contact information** fields. You may leave the optional fields blank.

5. No other values are required, click **Save and Continue** twice to finish.

### Create OAuth Client ID

1. Navigate to the [**APIs & Services > Credentials**](https://console.cloud.google.com/apis/credentials) section

2. At the top of the screen click **+Create Credentials** and select **OAuth client ID**

3. In the **Application type** drop-down **Web application**

4. Enter meaningful **Name** and click **Create**

> 📝 Take note of these **Client ID** and **Client secret** values.
> You will need to reference them later for deployment configuration.

### Configure the Authorized Redirect URI

1. On the credentials page, click the ✏️ (edit) icon
   next to the *Client ID* you just created

1. In the **Authorized redirect URIs** section, click **+Add URI**

1. Copy and paste the following URL into the text field
   and *REPLACE* the `{CLIENT_ID}` placeholder
   with the **Client ID** value you just created (visible in the top-right section of the page):
   ```txt
   https://iap.googleapis.com/v1/oauth/clientIds/{CLIENT_ID}:handleRedirect
   ```

   The final value should like something like this:
   ```
   https://iap.googleapis.com/v1/oauth/clientIds/999999999999-Zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz.apps.googleusercontent.com:handleRedirect
   ```

1. Click **Save**

---
## Deploy Fleet Routing App

In the previous steps, you created:

- A new Google Cloud project
- An API Key for Google Maps Platform
- OAuth credentials for IAP

After these manual steps, the necessary prerequisites are in place
to deploy Fleet Routing App.

**Next step:** [Deploy the application](deployment.md)
