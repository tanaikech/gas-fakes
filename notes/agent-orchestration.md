# Agent Orchestration with `gf_agent`

`gf_agent` is a specialized AI agent designed to automate Google Workspace tasks by emulating Google Apps Script (GAS) behavior locally using the `gas-fakes` environment. To handle complex, multi-service requests reliably, it employs a sophisticated **Orchestrator Pattern**.

## How Orchestration Works

The agent doesn't just "guess" code. It follows a structured workflow to ensure accuracy and efficiency:

### 1. The Orchestrator Phase
When you give a command like *"Summarize my last 5 emails in a Doc"*, the agent first acts as an **Orchestrator**:
- **Decomposition**: It breaks the request into logical steps.
- **Service Identification**: It identifies which GAS services are needed (e.g., `GmailApp` and `DocumentApp`).
- **Plan Formulation**: It creates a sequence of actions, ensuring dependencies (like creating a Doc before writing to it) are respected.

### 2. The Service Agent Phase (Research)
To ensure it uses the correct method signatures and handles platform-specific nuances (like `gas-fakes`' v3 Drive API mapping), the agent performs "Surgical Research":
- It queries the `gas-fakes` documentation (local `skills/` or remote `progress/` files) for the exact classes and methods it needs.
- This phase isolates service knowledge, preventing "context bloat" and ensuring high-signal code generation.

### 3. Execution & Validation
The agent synthesizes a parity-compliant script and executes it using the `mcp_gas-fakes-mcp_workspace_agent` tool. It then validates the outcome and reports success or handles any errors dynamically.

## The Architecture of Efficiency

The technical design of `gf_agent` is optimized for high-speed, low-cost AI interaction. Unlike traditional automation tools that might use complex JSON schemas or scrape live websites, `gf_agent` uses a **Two-Tier Documentation Pattern**:

### Tier 1: The Local Index (Compressed Knowledge)
The local `gf_agent/skills/` directory contains small Markdown files that simply list every supported method. 
- **Token Efficiency**: By using Markdown bulleted lists instead of JSON, we reduce "structural noise" (brackets, quotes, commas) by 30-50%. This keeps the agent's context window lean and focused.
- **Instant Verification**: The agent can instantly verify if a method like `GmailApp.createLabel()` exists without making a single external request.

### Tier 2: The Remote Deep Dive (On-Demand Research)
If the agent needs a specific method signature or return type it doesn't already know, it performs a "surgical fetch" of the remote `progress/*.md` files from the `gas-fakes` repository.
- **Zero-Scrape Design**: Scraping the official Google Apps Script documentation brings in thousands of tokens of HTML boilerplate and navigation menus. The `progress/*.md` files are clean, pre-parsed Markdown tables that provide the same information at a fraction of the cost.
- **Context Compression**: The agent only pays the "token tax" for deep documentation when it absolutely needs to, ensuring that long-running sessions remain fast and responsive.

---

## Orchestration Examples

Here are examples of how `gf_agent` handles complex orchestration, as seen in `@test/agent-tests.md`.

### Example 1: Cross-Service Summarization
**Prompt:** *“Find latest 5 emails from ‘Martin Hawksey’ and summarize them in a Google Doc”*

*   **Orchestration Logic:**
    1.  **Gmail Service**: Call `GmailApp.search('from:"Martin Hawksey"')` and retrieve the first 5 threads.
    2.  **Document Service**: Call `DocumentApp.create('Martin Hawksey Summaries')`.
    3.  **Synthesis**: Iterate through threads, extract snippets, and append them to the Doc body.
*   **Execution Result:**
    > "I've searched your Gmail for threads from Martin Hawksey, summarized the latest 5, and saved them to a new document titled 'Martin Hawksey Summaries' (ID: `1A2B3C...`)."

### Example 2: Drive Inventory & Spreadsheet Management
**Prompt:** *“Create a sheet called ‘Todays drive files’ and add any files on Drive modified today to it”*

*   **Orchestration Logic:**
    1.  **Drive Service**: Generate a query for files modified after today's midnight (RFC3339 format) using `DriveApp.searchFiles()`.
    2.  **Spreadsheet Service**: Create a new spreadsheet and populate the first sheet with file names, IDs, and modification times.
*   **Execution Result:**
    > "Successfully scanned Google Drive for files modified today. Found 8 files and added their details to the new spreadsheet 'Todays drive files' (ID: `spreadsheet_id_123`)."

### Example 3: Multiple Services & Image Manipulation
**Prompt:** *“Get the content of [URL] and create a Google document. Make a copy of that document and reduce all the images to 25% of their current size.”*

*   **Orchestration Logic:**
    1.  **UrlFetch Service**: Fetch HTML content from the provided URL.
    2.  **Document Service**: Convert HTML to a Google Doc (using `Drive.Files.create` with conversion).
    3.  **Drive Service**: Create a copy of the new document.
    4.  **Advanced Document Logic**: Iterate through `InlineImage` elements, calculate new dimensions, and apply the "Delete and Re-insert" workaround required by the Docs API for image resizing.
*   **Execution Result:**
    > "Successfully imported the article into 'Original Doc'. Created a copy 'Resized Version' where 4 images were scaled down to 25% using the Docs API batch update mechanism."

### Example 4: Advanced Spreadsheet Analysis
**Prompt:** *“Using my airports spreadsheet, find the sheet with the most data, find the highest 5 airports, convert elevation to metres, and show their distance from London.”*

*   **Orchestration Logic:**
    1.  **Drive Service**: Locate the 'airports' spreadsheet.
    2.  **Spreadsheet Service**: Iterate through all sheets, comparing `getLastRow()` to find the largest dataset.
    3.  **Data Processing**: Sort the data in-memory by elevation, take the top 5, and perform unit conversions.
    4.  **Geography Logic**: Calculate Great Circle distances using the Haversine formula within the script.
*   **Execution Result:**
    > "Analyzed the 'Global' sheet (5,000 rows). The highest 5 airports are: [List]. Conversions applied: Elevation (ft -> m). Distances from London (km) calculated and displayed in the console."

---

## Setting Up `gf_agent` as a User

If you are a user (not a developer of `gas-fakes`), follow these steps to enable agentic automation in your environment. For a more comprehensive overview of all setup options, please see the [Getting Started Guide](../GETTING_STARTED.md).

### 1. Installation
Ensure you have the `@mcpher/gas-fakes` package installed globally or in your project:
```bash
npm install -g @mcpher/gas-fakes
```

### 2. Initialization & Scopes (The Manifest)
You must initialize your working directory. This creates an `.env` file for credentials and an `appsscript.json` manifest file.
```bash
gas-fakes init
```
*Important: The `appsscript.json` file controls which Google APIs your scripts (and therefore the agent) are allowed to access. Ensure it contains the necessary `oauthScopes` for your tasks.*

### 3. Authentication (Crucial Step)
The agent needs permission to access your Google account based on the scopes defined in your manifest. Run the following command and follow the prompts:
```bash
gas-fakes auth
```
*Tip: For personal use, choose the **Desktop/OAuth** flow. For server automation, use a **Service Account**.*

### 4. Project Configuration (`gemini.md`)
Create or update a `gemini.md` file in your workspace. This tells the AI to automatically load the required skill, so you don't have to do it manually every session.

```markdown
# Gemini CLI Configuration

## Instructions
- Always activate the `gf_agent` skill at the start of a session.
```

## Why This Matters
By using this orchestration model, `gf_agent` avoids "hallucinating" methods and ensures that complex multi-step workflows—like fetching data from the web, processing it in a sheet, and emailing a summary—are executed exactly as they would be on the official Google Apps Script platform, but with the speed and flexibility of your local environment.

# <img src="../pngs/logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading



## Watch the gas-fakes intro video

[![Watch the intro video](../pngs/introvideo.png)](https://youtu.be/oEjpIrkYpEM)

## Watch the explainer about delegating work to local LLMs to save token costs

[![Use local LLMs to save tokens](../pngs/hybrid_LLM_Architecture_Overview.png)](https://youtu.be/tcvU2NLEaNE)

## Watch the gf_agent video on natural language automation

[![Use natural language with gf_agent](../pngs/gfagent.png)](https://youtu.be/lujByoX71HU)

## Watch the local webapps and addons development video

[![Local Apps Script Webapp and UI Emulation with gas-fakes](../pngs/srv.jpg)](https://youtu.be/vH9wl7QloZ4)

## Read more docs

- [release notes](../versionnotes/)
- [gas fakes intro video](https://youtu.be/oEjpIrkYpEM)
- [getting started](../GETTING_STARTED.md) - how to handle authentication for Workspace scopes.
- [readme](../README.md)
- [apps script parity](../notes/parity.md)
- [omlx setup](../notes/omlx-setup.md)
- [Natural Language Automation with Gemini Skills & MCP Server](../notes/gemini-skills-mcp.md) - new skills-based agent approach.
- [Add agent skills to gf_agent](https://ramblings.mcpher.com/add-skills-gf_agent/)
- [gf_agent documentation](../../gf_agent/README.md) - instructions for the Gemini CLI automation agent and MCP server.
- [gas fakes cli](../notes/gas-fakes-cli.md)
- [local add-on and webapp development with gas-fakes](../notes/local-web-development.md)
- [Bringing the webapp home](https://ramblings.mcpher.com/local-apps-script-webapp-and-ui-emulation/)
- [Local development example code](https://github.com/brucemcpherson/gf-serve)
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
- [initial idea and thoughts - how it all started](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
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

