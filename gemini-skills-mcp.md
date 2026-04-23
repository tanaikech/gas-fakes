# Natural Language Workspace Automation: Gemini CLI Skills & MCP Server

The `gas-fakes` project has taken a major leap forward in enabling natural language automation for Google Workspace. We've introduced a specialized **Gemini CLI Skill** (`@gf_agent`) and a dedicated **MCP (Model Context Protocol) Server**, allowing users to automate complex Workspace tasks using plain English.

## Key Updates

### 1. The `gf_agent` Skill
We've packaged `gas-fakes` as a Gemini CLI skill. This allows the LLM to understand the full breadth of supported Google Apps Script services (Sheets, Docs, Drive, Gmail, Calendar, etc.) and generate/execute code locally without leaving the terminal.

### 2. Built-in MCP Server
`gas-fakes` now includes an MCP server. This exposes individual Workspace services as "tools" to the LLM. The server is intelligent enough to infer which service is required for a task or use a general `workspace_agent` for cross-service workflows.

### 3. Streamlined Setup
The `gas-fakes init` process now automatically handles the integration. It will ask if you want to install the Gemini skills and MCP server, and then execute the necessary commands to link and configure them for you.

> **Note:** To use these features, you still need a local `appsscript.json` defining your required scopes, and must run `gas-fakes auth` to generate valid access tokens.

---

## Examples in Action

Here are four real-world examples of tasks performed using only natural language prompts through the new integration.

### Example 1: Drive to Sheets
**Prompt:**
> "Create a sheet called 'Latest Drive Files' and add my recently created Drive files to it."

**Result:**
- Successfully created a new spreadsheet.
- Fetched metadata for the 20 most recent files.
- [Spreadsheet URL](https://docs.google.com/spreadsheets/d/1VpXErIyb2bIXDfcdTZPOy-GWRuTatcVwQ66eADEIRO0/edit)

### Example 2: Gmail to Docs
**Prompt:**
> "Find latest 5 emails from 'Martin Hawksey' and summarize them in a Google Doc."

**Result:**
- Searched Gmail for the 5 most recent threads from the specified sender.
- Extracted subjects and snippets.
- Created a formatted summary document.
- [Summary Document URL](https://docs.google.com/document/d/1lBIJd3PBanROWKeqUw2-ZkqEvsa_B8OlWV4cNAE6cv4/edit)

### Example 3: Calendar Automation
**Prompt:**
> "Add a meeting with Martin Hawksey to my calendar for tomorrow at 10am. Subject is gas-fakes agent"

**Result:**
- Calculated the date for "tomorrow".
- Created a calendar event from 10:00 AM to 11:00 AM.
- **Event ID:** `6fmk0p8daoga56oouksl208t8c@google.com`

### Example 4: Data Analysis (Spreadsheets)
**Prompt:**
> "Find my airports spreadsheet, and using the sheet with the most data, list to the console the 5 highest airports sorted by elevation high to low, and convert elevation to meters."

**Result:**
- Located the "--fsome airports" spreadsheet.
- Identified "airport list" as the largest sheet (557 rows).
- Sorted data and performed the unit conversion:
  - **Alejandro Velasco Astete International Airport**: 10,860 ft (3,310.13 m)
  - **Cotopaxi International Airport**: 9,205 ft (2805.68 m)
  - **El Dorado International Airport**: 8,361 ft (2548.43 m)
  - **Mariscal Sucre International Airport**: 7,841 ft (2389.94 m)
  - **Addis Ababa Bole International Airport**: 7,630 ft (2325.62 m)
