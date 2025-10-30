# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Getting Started with `gas-fakes`

This guide provides a consolidated set of instructions to get you up and running with `gas-fakes` for local Google Apps Script development on Node.js.

## Introduction

`gas-fakes` allows you to run your Google Apps Script code in a local Node.js environment, emulating native GAS services like `DriveApp` and `SpreadsheetApp`. This enables faster development, testing, and debugging without constantly deploying to the Apps Script platform.

The key principle is to use the exact same synchronous code you would write for Apps Script. `gas-fakes` handles the complexities of authentication and the asynchronous nature of the underlying Google Workspace APIs for you.

## Prerequisites

1.  **Node.js**: A current version of Node.js installed on your machine.
2.  **Google Cloud Project**: You must have a Google Cloud Platform (GCP) project. You cannot use the Apps Script-managed cloud project. If you don't have one, create a new project and ensure it is associated with a Google Workspace organization if possible.

---

## Step 1: Install the Package

In your Node.js project directory, install `gas-fakes` from npm:

```sh
npm i @mcpher/gas-fakes
```

## Step 2: Set Up Authentication Shells and Environment

Authentication is handled using Application Default Credentials (ADC), enhanced with an OAuth client to access restricted scopes.

1.  **Download Helper Scripts**: Get the `shells` folder from the `gas-fakes` repository and place it in your project's root directory.

2.  **Create and Configure `.env` File**: You can create the environment file in one of two ways:

    *   **Interactive Setup (Recommended)**
        Run the `setup.sh` script from within the `shells` directory. It will guide you through creating your `.env` file by asking for the necessary values. If an `.env` file already exists, it will use the existing values as defaults.
        ```sh
        cd shells
        ./setup.sh
        ```

    *   **Manual Setup**
        Alternatively, you can create a `.env` file in your project root manually. Here is an example with all possible variables:
        ```env
        # Google Cloud Project ID (required)
        GCP_PROJECT_ID="your-gcp-project-id"

        # Path to OAuth client credentials for restricted scopes (optional, but recommended)
        CLIENT_CREDENTIAL_FILE="private/your-credentials.json"

        # A test file ID for checking authentication (optional)
        DRIVE_TEST_FILE_ID="some-drive-file-id-you-can-access"

        # Storage configuration for PropertiesService and CacheService ('FILE' or 'UPSTASH')
        # Defaults to 'FILE' if not set.
        STORE_TYPE="UPSTASH"

        # Logging destination for Logger.log() ('CONSOLE', 'CLOUD', 'BOTH', 'NONE')
        # Defaults to 'CONSOLE' if not set.
        LOG_DESTINATION="BOTH"

        # Upstash credentials (only used if STORE_TYPE is 'UPSTASH')
        UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
        UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
        ```

## Step 3: Configure OAuth for Restricted Scopes - if you plan to use them

Recent Google security policies require extra steps to access certain APIs (like Gmail etc.) with ADC. If you need to access these, you will need to create an OAuth client and mark it for "internal" use, otherwise the google auth login process will block your app.

1.  **Go to OAuth Consent Screen**: In the Google Cloud Console, navigate to **APIs & Services -> OAuth consent screen** for your project.

2.  **Configure Consent**:
    *   Choose **Internal** for the User Type and click **Create**.
    *   Give your app a name (e.g., "gas-fakes local dev"), provide a user support email, and add your own email as the developer contact. Click **Save and Continue**.

3.  **Add Scopes**: On the "Scopes" page, click **Add or Remove Scopes**.
    *   Scroll to the bottom and paste the full list of scopes your project will need into the text box under "Manually add scopes". This should be all the ones you plan to access, and should either match or be a superset of the ones in your .env file. The example below contains gmail.compose which would normally be blocked for Node access.
    ```
    https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/documents,https://www.googleapis.com/auth/gmail.labels,,https://www.googleapis.com/auth/gmail.compose
    ```
    *   Click **Add to Table**, then **Update**, and finally **Save and Continue**.

4.  **Create OAuth Client ID**:
    *   Navigate to **APIs & Services -> Credentials**.
    *   Click **+ Create Credentials** and select **OAuth client ID**.
    *   Set the Application type to **Desktop app**.
    *   Give it a name (e.g., "gas-fakes desktop client").
    *   Click **Create**. A popup will show your Client ID and Secret. Click **Download JSON** and save the file to a secure location in your project (e.g., a `private/` folder that is included in your `.gitignore`).

5.  **Update `.env` with Credentials Path**: Add a new line to your `.env` file pointing to the JSON file you just downloaded.
    If you used `setup.sh`, you can re-run it to add or update this value.
    ```
    CLIENT_CREDENTIAL_FILE="private/your-downloaded-credentials-file.json"
    ```

## Step 4: Authorize Your Application

Now, run the provided shell scripts to use your new configuration to log in and authorize the application.

1.  **Login with ADC**: This script initiates the Google login flow. It will open a browser window where you'll need to sign in and grant permission for the scopes you configured. This creates the initial Application Default Credentials file.

    ```bash
    cd shells
    bash setaccount.sh
    ```

2.  **Enable Workspace APIs**: If this is a new GCP project, you need to enable the necessary APIs (Drive, Sheets, Docs, etc.). The `enable.sh` script does this for you.

    ```bash
    bash enable.sh
    ```

## Step 5: Configure Your Project Files

`gas-fakes` reads local project files to understand your script's configuration.

1.  **Manifest (`appsscript.json`)**: If you are syncing with a real Apps Script project via `clasp`, you will already have this file. If not, create one in your project root. `gas-fakes` reads the `oauthScopes` from this file to request the correct permissions.

2.  **Settings (`gasfakes.json`)**: This optional file tells `gas-fakes` where to find things. If you don't provide one, it will be created with sensible defaults. For a detailed explanation of each property, see the Settings section in the main [readme](README.md)

    Here is an example with common settings:
    ```json
    {
      "manifest": "./appsscript.json",
      "clasp": "./.clasp.json",
      "documentId": null,
      "cache": "/tmp/gas-fakes/cache",
      "properties": "/tmp/gas-fakes/properties",
      "scriptId": "a-unique-id-for-your-local-project"
    }
    ```
    *   `scriptId`: It's recommended to set a unique but static value here. This ensures that local data stores for `PropertiesService` and `CacheService` are persistent between runs.

---

## Step 6: (Optional) Using a Shared Data Store with Upstash

By default, `gas-fakes` emulates `PropertiesService` and `CacheService` using local files. For advanced use cases, such as sharing data between your local Node.js environment and a live Apps Script project, you can configure `gas-fakes` to use Upstash Redis as a backend.

This is especially useful for integration testing, where you can write data in a local test and verify it in the live environment, or vice-versa.

### 1. Configure `gas-fakes` (Local Environment)

*   **Get Upstash Credentials**: Sign up for a free Upstash Redis database and get your REST URL and Token.
*   **Update your `.env` file**: Set `STORE_TYPE` to `UPSTASH` and add your credentials. You can do this by re-running the interactive `setup.sh` script or by editing the file manually.

    ```env
    # ... other settings
    STORE_TYPE="UPSTASH"
    UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
    UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
    ```
*   **Match Script ID**: Ensure the `scriptId` in your `gasfakes.json` file matches the Script ID of your live Apps Script project. This is crucial for partitioning the data correctly. `gas-fakes` will automatically use the ID from `.clasp.json` if available.

### 2. Configure Live Apps Script Project

To allow your live script to access the same Upstash database, you'll use the `gas-flex-cache` library.

*   **Add the Library**: Add the `bmGasFlexCache` library to your `appsscript.json` manifest.

    ```json
    "dependencies": {
      "libraries": [
        {
          "userSymbol": "bmGasFlexCache",
          "libraryId": "1R_r9n4EGctvA8lWBZVeuT66mgaKBRV5IxfIsD_And-ra2H16iNXVWva0",
          "version": "...whatever the latest version is.."
        }
      ]
    }
    ```

*   **Store Credentials in Live Script**: Securely store your Upstash credentials in the live script's native `PropertiesService`.

    ```javascript
    function setLiveCredentials() {
      const creds = {
        type: "upstash",
        url: "YOUR_UPSTASH_URL",
        token: "YOUR_UPSTASH_TOKEN"
      };
      PropertiesService.getScriptProperties()
        .setProperty("dropin_upstash_credentials", JSON.stringify(creds));
    }
    ```

*   **Instantiate the Drop-in Service**: In your live script, you can now create a drop-in replacement for `CacheService` or `PropertiesService` that connects to your Upstash database, allowing you to read data written by `gas-fakes`. gas-fakes uses the openid as a stable userid which will be the same on both apps script and gas-fakes.

    ```javascript
    // Example: Reading a user property set by a gas-fakes test
    const creds = JSON.parse(PropertiesService.getScriptProperties().getProperty("dropin_upstash_credentials"));
    creds.userId = getUserIdFromToken(ScriptApp.getOAuthToken())
    creds.scriptId = ScriptApp.getScriptId();
    creds.kind = 'property';

    const sharedUserProps = bmGasFlexCache.newCacheDropin({ creds });
    const valueFromFake = sharedUserProps.getProperty('some-key-written-by-fake');
    console.log(valueFromFake);
    ```
### A note on userId if you are planning to share user orientated cache or property stores 
To generate a unique, stable `userId` that'll be the same on both gas-fakes and Apps Script we could have used Session.getEffectiveUser().getEmail(). However, to avoid inserting email addresses into the redis database, it would be better to use an openid. An openid will be unique to an authenticated user across platforms. This is what gas-fakes uses when emulating a service.

On gas-fakes, the default scopes include openid, but to be able to get the same value for a user on Apps Script, your appsscript.json manifest needs the scope "openid". gas-flex-cache has a handy convenience method to deduce your openid from and accesstoken. If you do not include the openid scope, we will be able to retrieve your unique openid to use as a userId.

You would need at least these scopes in your app
```json
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "openid"
  ]
```

We import the getUserIdFromToken on gas-fakes
```javascript
  import { newCacheDropin , getUserIdFromToken } from '@mcpher/gas-flex-cache'
``` 

And on apps script
```javascript
var getUserIdFromToken = bmGasFlexCache.getUserIdFromToken;
```


Now you can use this stable userId instead of writing an email to redis.
```javaScript
const userId = getUserIdFromToken(ScriptApp.getOAuthToken())
const userCacheCreds = {
  ...upstashCreds, 
  scriptId: ScriptApp.getScriptId(),
  userId,
  defaultExpirationSeconds: 360 
}
const userCache = newCacheDropin({creds:userCacheCreds});

---


```

## You're Ready to Code!

Your environment is now configured. You can start writing Apps Script code in your local `.js` files and run them with Node.js. Remember to import `gas-fakes` at the top of your main script file:

```javascript
// The main entry point for gas-fakes
import '@mcpher/gas-fakes';

// Your Apps Script code here...
function myFunction() {
  const doc = DocumentApp.create('Hello from Node!');
  Logger.log('Created file with ID: ' + doc.getId());
}

// Run your function
if (ScriptApp.isFake) {
  myFunction();
}
```

---

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini-observations.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [gas fakes cli](gas-fakes-cli.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)