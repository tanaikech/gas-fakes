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
