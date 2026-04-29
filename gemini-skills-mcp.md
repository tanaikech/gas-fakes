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

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

## Watch the video

[![Watch the video](introvideo.png)](https://youtu.be/oEjpIrkYpEM)

## Read more docs

- [gas fakes intro video](https://youtu.be/oEjpIrkYpEM)
- [getting started](GETTING_STARTED.md) - how to handle authentication for Workspace scopes.
- [readme](README.md)
- [Natural Language Automation with Gemini Skills & MCP Server](gemini-skills-mcp.md) - new skills-based agent approach.
- [gf_agent documentation](../gf_agent/README.md) - instructions for the Gemini CLI automation agent and MCP server.
- [gas fakes cli](notes/gas-fakes-cli.md)
- [github actions using adc](https://github.com/brucemcpherson/gas-fakes-actions-adc)
- [github actions using dwd and wif](https://github.com/brucemcpherson/gas-fakes-actions-dwd)
- [ksuite as a back end](notes/ksuite_poc.md)
- [msgraph as a back end](notes/msgraph.md)
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
- [jdbc notes](notes/jdbc-notes.md)
- [Yes – you can run native apps script code on Azure ACA as well!](https://ramblings.mcpher.com/yes-you-can-run-native-apps-script-code-on-azure-aca-as-well/)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](notes/oddities.md) - a collection of oddities uncovered during this project
- [named colors](notes/named-colors.md)
- [sandbox](notes/sandbox.md)
- [senstive scopes](notes/workspace_scopes.md)
- [using apps script libraries with gas-fakes](notes/libraries.md)
- [how libhandler works](libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](notes/named-range-identity.md)
- [Workspace scopes with local authentication](notes/workspace_scopes.md)
- [push test pull](notes/pull-test-push.md)
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
