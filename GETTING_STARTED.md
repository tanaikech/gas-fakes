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

2.  **Create `.env` File**: Copy the `.env.template` from the `shells` directory into your project's root and rename it to `.env`.

3.  **Configure Initial `.env`**: Open your new `.env` file and set your GCP Project ID.

    ```
    # must set this
    GCP_PROJECT_ID="your-gcp-project-id-goes-here"
    
    # optional reference if you want to run a test after setting up
    DRIVE_TEST_FILE_ID="add the id of some test file you have access to here"
    ```

## Step 3: Configure OAuth for Restricted Scopes

Recent Google security policies require extra steps to access certain APIs (like Drive, Sheets, etc.) with ADC. You will create an OAuth client and mark it for "internal" use.

1.  **Go to OAuth Consent Screen**: In the Google Cloud Console, navigate to **APIs & Services -> OAuth consent screen** for your project.

2.  **Configure Consent**:
    *   Choose **Internal** for the User Type and click **Create**.
    *   Give your app a name (e.g., "gas-fakes local dev"), provide a user support email, and add your own email as the developer contact. Click **Save and Continue**.

3.  **Add Scopes**: On the "Scopes" page, click **Add or Remove Scopes**.
    *   Scroll to the bottom and paste the full list of scopes your project will need into the text box under "Manually add scopes". A good starting list is:
    ```
    https://www.googleapis.com/auth/userinfo.email,openid,https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/drive,https://www.googleapis.com/auth/spreadsheets,https://www.googleapis.com/auth/documents,https://www.googleapis.com/auth/gmail.labels
    ```
    *   Click **Add to Table**, then **Update**, and finally **Save and Continue**.

4.  **Create OAuth Client ID**:
    *   Navigate to **APIs & Services -> Credentials**.
    *   Click **+ Create Credentials** and select **OAuth client ID**.
    *   Set the Application type to **Desktop app**.
    *   Give it a name (e.g., "gas-fakes desktop client").
    *   Click **Create**. A popup will show your Client ID and Secret. Click **Download JSON** and save the file to a secure location in your project (e.g., a `private/` folder that is included in your `.gitignore`).

5.  **Update `.env` with Credentials Path**: Add a new line to your `.env` file pointing to the JSON file you just downloaded.

    ```
    CLIENT_CREDENTIAL_FILE="private/your-downloaded-credentials-file.json"
    ```

## Step 4: Authorize Your Application

Now, run the provided shell scripts to use your new configuration to log in and authorize the application.

1.  **Login with ADC**: This script initiates the Google login flow. It will open a browser window where you'll need to sign in and grant permission for the scopes you configured. This creates the initial Application Default Credentials file.

    ```bash
    cd shells
    bash setaccounts.sh
    ```

2.  **Set Enhanced Credentials**: This script injects your OAuth client details into the ADC flow, replacing the standard credentials with your "internal" app credentials to allow access to restricted scopes.

    ```bash
    bash setenhanced.sh
    ```

3.  **Enable Workspace APIs**: If this is a new GCP project, you need to enable the necessary APIs (Drive, Sheets, Docs, etc.). The `enable.sh` script does this for you.

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
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [named range identity](named-range-identity.md)
- [restricted scopes](restricted_scopes.md) - how to handle authentication for restricted scopes.