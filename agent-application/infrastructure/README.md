# Getting started in a new environment

## Initial setup
1. Create a GCP project.
1. Install terraform and gcloud.
1. Configure OAuth (documented below).
1. Create a Google Maps API key for the JS API.
1. Create a Map ID, and optionally a style, to use for the map.
1. Run `terraform apply`.
1. Register the static ip created via terraform with Google Cloud DNS and wait for the certificate to validate.

## Configure OAuth
The application relies on **Identity-Aware Proxy** (IAP) to authenticate users. IAP requires OAuth to be configured for the project.

### Configure Consent Screen

1. Go to **[Google Cloud Console](https://console.cloud.google.com)** and open your project.

2. Navigate to the [**APIs & Services > OAuth consent screen**](https://console.cloud.google.com/apis/credentials) section.

3. Choose **User Type > Internal** and click **Create**.

4. Enter the appropriate information in the required **App name**, **User support email**, and **Developer contact information** fields. Mark the application as `Internal` or `External`, as appropriate. You may leave the optional fields blank.

5. No other values are required, click **Save and Continue** twice to finish.

### Create OAuth Client ID

1. Navigate to the [**APIs & Services > Credentials**](https://console.cloud.google.com/apis/credentials) section.

2. At the top of the screen click **+Create Credentials** and select **OAuth client ID**.

3. In the **Application type** drop-down **Web application**.

4. Enter meaningful **Name** and click **Create**.

> 📝 Take note of these **Client ID** and **Client secret** values.
> You will need to reference them later for deployment configuration.

### Configure the Authorized Redirect URI

1. On the credentials page, click the ✏️ (edit) icon next to the *Client ID* you just created.

1. In the **Authorized redirect URIs** section, click **+Add URI**.

1. Copy and paste the following URL into the text field and *REPLACE* the `{CLIENT_ID}` placeholder with the **Client ID** value you just created (visible in the top-right section of the page):
   ```txt
   https://iap.googleapis.com/v1/oauth/clientIds/{CLIENT_ID}:handleRedirect
   ```

   The final value should like something like this:
   ```
   https://iap.googleapis.com/v1/oauth/clientIds/999999999999-Zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz.apps.googleusercontent.com:handleRedirect
   ```

1. Click **Save**.
