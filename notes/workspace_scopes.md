# <img src="../logo.png" alt="gas-fakes logo" width="50" align="top"> Allowing Access to Workspace Scopes with Local Google Authentication

This guide summarizes how to overcome the "Google has blocked access" error when using local Google authentication (`authType: adc`) with regular Workspace scopes (e.g., `.../auth/drive`, `.../auth/spreadsheets`, `.../auth/gmail.compose`) during local development.

## Core Problem
When you run `gas-fakes auth` (which calls `gcloud auth application-default login`) without a `--client-id-file`, your local identity is minted using Google's generic, globally shared "Google Cloud CLI" OAuth Client ID. 

Recently, Google restricted this generic Client ID from requesting regular Workspace scopes to prevent phishing and unauthorized access via generic CLI tools.

> **Note on Domain-Wide Delegation (DWD):** This change **does not affect** users using `authType: dwd`. In DWD mode, `gas-fakes` uses your local identity only to sign tokens for the service account, which only requires basic scopes like `cloud-platform`. These basic scopes are not blocked for the generic gcloud client ID. The actual Workspace scopes are then minted via the service account, which bypasses the generic client's restrictions. Therefore, **DWD works without a custom client credential file.**

## Solution: Using a Custom OAuth Client ID (for `authType: adc`)

The solution for users of `authType: adc` is to create a custom OAuth Client ID within your own Google Cloud Project and instruct `gcloud` to use it for your local authorization. This bypasses the default restrictions while maintaining a secure, keyless chain of trust.

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
> "Do you want to use a custom OAuth2 client credentials file to support Workspace scopes?"

Provide the path to the JSON file you downloaded in Step 2.

### Completion
A browser window will open. As an internal user of your own project, you can now grant access to the application, including the Workspace scopes. Your local configuration will be updated with a refresh token linked to your custom, authorized Client ID, allowing both ADC and DWD modes to operate without restriction.

---
*Summary of article: [How to allow access to Workspace scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials)*

## <img src="../logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

## Watch the video

[![Watch the video](../introvideo.png)](https://youtu.be/oEjpIrkYpEM)

## Read more docs

- [gas fakes intro video](https://youtu.be/oEjpIrkYpEM)
- [getting started](../GETTING_STARTED.md) - how to handle authentication for Workspace scopes.
- [readme](../README.md)
- [Natural Language Automation with Gemini Skills & MCP Server](../gemini-skills-mcp.md) - new skills-based agent approach.
- [gf_agent documentation](../../gf_agent/README.md) - instructions for the Gemini CLI automation agent and MCP server.
- [gas fakes cli](../notes/gas-fakes-cli.md)
- [github actions using adc](https://github.com/brucemcpherson/gas-fakes-actions-adc)
- [github actions using dwd and wif](https://github.com/brucemcpherson/gas-fakes-actions-dwd)
- [ksuite as a back end](../notes/ksuite_poc.md)
- [msgraph as a back end](../notes/msgraph.md)
- [resurrecting scriptDb repo](https://github.com/brucemcpherson/scriptdb-redux)
- [Resurrecting ScriptDb – nosql database for Apps Script](https://ramblings.mcpher.com/resurrecting-scriptdb-nosql-database-for-apps-script/)
- [gas-fakes in serverless containers](https://docs.google.com/presentation/d/1JlXF9T--DD4ERHopyP3WyAMhjRCxxHblgCP5ynxaJ3k/edit?usp=sharing)
- [apps script - a lingua franca for workspace platforms](https://ramblings.mcpher.com/apps-script-a-lingua-franca/)
- [Apps Script: A ‘Lingua Franca’ for the Multi-Cloud Era](https://ramblings.mcpher.com/apps-script-with-ksuite/)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Azure ACA](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Github actions](https://github.com/brucemcpherson/gas-fakes-containers)
- [jdbc notes](../notes/jdbc-notes.md)
- [Yes – you can run native apps script code on Azure ACA as well!](https://ramblings.mcpher.com/yes-you-can-run-native-apps-script-code-on-azure-aca-as-well/)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](../collaborators.md) - additional information for collaborators
- [oddities](../notes/oddities.md) - a collection of oddities uncovered during this project
- [named colors](../notes/named-colors.md)
- [sandbox](../notes/sandbox.md)
- [senstive scopes](../notes/workspace_scopes.md)
- [using apps script libraries with gas-fakes](../notes/libraries.md)
- [how libhandler works](../libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](../notes/named-range-identity.md)
- [Workspace scopes with local authentication](../notes/workspace_scopes.md)
- [push test pull](../notes/pull-test-push.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to Workspace scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Power of Google Apps Script: Building MCP Server Tools for Gemini CLI and Google Antigravity in Google Workspace Automation](https://medium.com/google-cloud/power-of-google-apps-script-building-mcp-server-tools-for-gemini-cli-and-google-antigravity-in-71e754e4b740)
- [A New Era for Google Apps Script: Unlocking the Future of Google Workspace Automation with Natural Language](https://medium.com/google-cloud/a-new-era-for-google-apps-script-unlocking-the-future-of-google-workspace-automation-with-natural-a9cecf87b4c6)
- [Next-Generation Google Apps Script Development: Leveraging Antigravity and Gemini 3.0](https://medium.com/google-cloud/next-generation-google-apps-script-development-leveraging-antigravity-and-gemini-3-0-c4d5affbc1a8)
- [Modern Google Apps Script Workflow Building on the Cloud](https://medium.com/google-cloud/modern-google-apps-script-workflow-building-on-the-cloud-2255dbd32ac3)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)
