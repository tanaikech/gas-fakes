---
name: gf_agent
description: >
  Specialized agent for automating Google Workspace tasks locally using gas-fakes.
  Generates and executes Google Apps Script code on Node.js.
---
# Skill: gf_agent

## Overview
`gf_agent` is a specialized agent for automating Google Workspace tasks using the `gas-fakes` local emulation environment. It can generate and execute Google Apps Script (GAS) code locally on Node.js.

## Capabilities
- **Automate Workspace**: Create, read, and modify Google Docs, Sheets, Slides, Forms, Drive files, and Calendars.
- **Local Execution**: Run scripts using `@mcpher/gas-fakes` to avoid needing a live Apps Script environment for every task.
- **Service Integration**: Seamlessly combine multiple Google services (e.g., fetch data from a Sheet and create a Doc).
- **Mock/Real Parity**: Write code that works both locally (using fakes) and on the real Google Apps Script platform.

## Instructions
1. **Understand the Task**: Identify which Google Apps Script services are required (e.g., SpreadsheetApp, DriveApp, DocumentApp).
2. **Pre-Implementation Verification (MCP Documentation Lookup)**: You MUST NOT assume you know the implemented methods for any service. 
    - **Use Documentation Tool**: ALWAYS use the `mcp_gas-fakes_lookup_docs` tool for the relevant service(s) to verify that the classes and methods you plan to use are supported.
    - **Prohibit Repository Access**: Even if running inside the `gas-fakes` source repository, you MUST NOT read the `progress/`, `test/`, or `src/` directories for verification.
    - **Local Truth**: The documentation returned by the MCP tool is the version-matched source of truth for your current installation.
3. **Generate Script**: Create a Node.js script that:
    - Imports `@mcpher/gas-fakes`.
    - Uses standard GAS syntax.
    - (Optional) Uses `ScriptApp.isFake` for local-only logic like logging or cleanup.
4. **Execute & Verify**: Use the `mcp_gas-fakes_run_script` tool to execute the code and report the results to the user.

## Example Workflow
User: "Create a sheet called 'Test' and add 'Hello World' to A1."
Agent:
1. **Lookup Docs**: Call `mcp_gas-fakes_lookup_docs({ service: 'spreadsheet' })`.
2. **Verify**: Confirm `SpreadsheetApp.create`, `getActiveSheet`, `getRange`, and `setValue` are in the list.
3. **Generate Script**:
   ```javascript
   import '@mcpher/gas-fakes';
   const ss = SpreadsheetApp.create('Test');
   ss.getActiveSheet().getRange('A1').setValue('Hello World');
   console.log('Created sheet with ID:', ss.getId());
   ```
4. **Execute**: Call `mcp_gas-fakes_run_script({ script: '...' })`.
5. **Report**: Confirm completion to the user.

## Notes
- Always use ES modules (`import`).
- Note that the Apps Script Services are all  automatically available- for Example DriveApp, SpreadsheetApp, etc. are all available in the global namespace - no need to import them.
- the manifest file is used to conteol which scopes are required. dwd is the preferred authentication method but it needs the user to enable it from the domain admain console during the authentication stage.
- Advanced Service versions of the services are available - and map to their apps script equivalents. These are also available via the global namespace for example Drive, Sheets , etc. 
- Note that Apps Script is synchronous. gas-fake emulates this so all calls to services will be synchronous
- Where possible, use the native Apps Script service (for example DriveApp) in preference to the advanced services (Drive, Sheets, etc.)

## Lessons Learned & Best Practices (from Test Patterns)

