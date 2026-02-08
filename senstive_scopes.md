# Allowing Access to Sensitive Scopes with Application Default Credentials

This guide summarizes how to overcome the "Google has blocked access" error when using Application Default Credentials (ADC) with sensitive or restricted scopes (e.g., `gmail.compose`) during local development.

## Core Problem
When using `gcloud auth application-default login`, the default Google-provided `client_id` is only pre-authorized for a limited set of non-sensitive scopes. If your application requests sensitive or restricted scopes, Google will block the request because the default client is not authorized for those permissions.

## Solution: Using a Custom OAuth Client ID for Local ADC

The solution is to create a custom OAuth Client ID within your own Google Cloud Project and instruct `gcloud` to use it for ADC authorization. This bypasses the default restrictions while maintaining the convenience of ADC.

### Step 1: Configure the OAuth Consent Screen

1.  **Navigate to OAuth Consent Screen:** In the Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**.
2.  **Set User Type to Internal:** Choose **Internal**. This is crucial for local development as it avoids the external app verification process. Click **Create**.
3.  **App Details & Scopes:**
    *   Provide an app name (e.g., "gas-fakes local dev") and support email.
    *   On the **Scopes** page, click **Add or Remove Scopes**.
    *   Manually add all necessary scopes (e.g., `.../auth/drive`, `.../auth/spreadsheets`, `.../auth/gmail.compose`).
    *   Click **Add to Table**, then **Update**, and finally **Save and Continue**.

### Step 2: Create a Custom Desktop Client ID

1.  **Navigate to Credentials:** Go to **APIs & Services** → **Credentials**.
2.  **Create OAuth Client ID:** Click **+ Create Credentials** and select **OAuth client ID**.
3.  **Configure for Local Use:**
    *   Set the **Application type** to **Desktop app**.
    *   Give it a name (e.g., "gas-fakes desktop client").
    *   Click **Create**.
4.  **Download Credentials:** Download the JSON file and save it locally (e.g., `private/adc-credentials.json`). 
    *   **CRITICAL:** Add this file to your `.gitignore`. Never commit it to a public repository.

### Step 3: Authorize ADC Using the Custom Client ID

Execute the following command in your terminal, replacing the placeholders with your specific scopes and file path:

```bash
gcloud auth application-default login \
  --scopes='https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets' \
  --client-id-file=path/to/your/credentials.json
```

*   **Scopes:** This list should match or be a subset of the scopes you configured in Step 1.
*   **Client ID File:** The path to the JSON file you downloaded in Step 2.

### Completion
A browser window will open. As an internal user of your own project, you can now grant access to the application, including the sensitive scopes. Your local ADC configuration will be updated with a refresh token linked to your custom, authorized Client ID.

---
*Summary of article: [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials)*