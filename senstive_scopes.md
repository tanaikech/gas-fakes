# Allowing Access to Sensitive Scopes with Local Google Authentication

This guide summarizes how to overcome the "Google has blocked access" error when using local Google authentication (either Application Default Credentials (ADC) or Domain-Wide Delegation (DWD)) with sensitive or restricted scopes (e.g., `gmail.compose`) during local development.

## Core Problem
When you run `gas-fakes auth` (which calls `gcloud auth application-default login`) without a `--client-id-file`, your local identity is minted using Google's generic, globally shared "Google Cloud CLI" OAuth Client ID. 

Recently, Google restricted this generic Client ID from requesting sensitive Workspace scopes to prevent phishing and unauthorized access via generic CLI tools.

**Why this affects DWD:** Even when you use Domain-Wide Delegation (`authType: dwd`), `gas-fakes` locally uses your personal ADC identity to dynamically request the impersonated Service Account tokens (this avoids downloading permanent service account JSON keys). Google tracks the **provenance** of these tokens. Because the originating `gcloud` session is blocked from sensitive scopes, Google prevents the Service Account from escalating privileges into those sensitive scopes, resulting in a blocked request.

## Solution: Using a Custom OAuth Client ID

The solution is to create a custom OAuth Client ID within your own Google Cloud Project and instruct `gcloud` to use it for your local authorization. This bypasses the default restrictions while maintaining a secure, keyless chain of trust for both ADC and DWD.

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

### Step 3: Initialize gas-fakes with the Custom Client ID

If you are using the CLI (`gas-fakes init`), you will be asked:
> "Do you want to use a custom OAuth2 client credentials file to support sensitive scopes?"

Provide the path to the JSON file you downloaded in Step 2.


### Completion
A browser window will open. As an internal user of your own project, you can now grant access to the application, including the sensitive scopes. Your local configuration will be updated with a refresh token linked to your custom, authorized Client ID, allowing both ADC and DWD modes to operate without restriction.

---
*Summary of article: [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials)*