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
1. **Understand the Task**: Identify which Google Apps Script services are required (e.g., `SpreadsheetApp`, `DriveApp`).
2. **Pre-Implementation Verification**: Before generating code, you MUST verify that the intended methods are supported:
    - **Consult Local Index**: Check the `gf_agent/index.md` and the corresponding files in the `gf_agent/skills/` directory. These files contain a portable, comprehensive list of all implemented services, classes, and methods.
    - **Use Service Discovery**: If still unsure, or if a method is not listed but you suspect it exists, run a short `workspace_agent` script (e.g., `console.log(Object.keys(SpreadsheetApp))`) to dynamically inspect the available methods.
    - **Iterative Execution**: `gas-fakes` uses proxies that throw clear "not yet implemented" errors. You can execute a draft script, and if a method fails, automatically find an alternative approach.
    - **Advanced Service Fallback**: While standard services (e.g., `DriveApp`) are STRONGLY preferred, you may use Advanced Service equivalents (e.g., `Drive`, `Docs`, `Sheets`) if a standard capability is missing. Advanced Services map directly to Google REST APIs and are extensively supported.
3. **Generate Script**: Create a Node.js script that:
    - Imports `@mcpher/gas-fakes`.
    - Uses standard GAS syntax.
    - (Optional) Uses `ScriptApp.isFake` for local-only logic like logging or cleanup.
4. **Execute & Verify**: Run the script and report the results to the user.

## Example Workflow
User: "Create a sheet called 'Test' and add 'Hello World' to A1."
Agent:
1. Generate `temp_task.js`:
   ```javascript
   import '@mcpher/gas-fakes';
   const ss = SpreadsheetApp.create('Test');
   ss.getActiveSheet().getRange('A1').setValue('Hello World');
   console.log('Created sheet with ID:', ss.getId());
   ```
2. Execute: `node temp_task.js`
3. Confirm completion to the user.

## Notes
- Always use ES modules (`import`).
- Note that the Apps Script Services are all  automatically available- for Example DriveApp, SpreadsheetApp, etc. are all available in the global namespace - no need to import them.
- the manifest file is used to conteol which scopes are required. dwd is the preferred authentication method but it needs the user to enable it from the domain admain console during the authentication stage.
- Advanced Service versions of the services are available - and map to their apps script equivalents. These are also available via the global namespace for example Drive, Sheets , etc. 
- Note that Apps Script is synchronous. gas-fake emulates this so all calls to services will be synchronous
- Where possible, use the native Apps Script service (for example DriveApp) in preference to the advanced services (Drive, Sheets, etc.)

## Lessons Learned & Best Practices (from Test Patterns)

### Efficient Drive Searching (Best Practice)
- **Prefer `searchFiles()` over manual iteration**: When looking for specific files (e.g., by name, date, or parent), always use `DriveApp.searchFiles(query)` instead of `DriveApp.getFiles()` with manual filtering. Searching happens on the server and is significantly faster.
- **Date Formatting for Queries**: When searching by date (e.g., `modifiedTime` or `createdTime`), you MUST use the RFC3339 format (e.g., `YYYY-MM-DDThh:mm:ss`). 
  - **Crucial**: Use `modifiedTime` instead of `modifiedDate` when querying Drive via `gas-fakes`, as it maps to the Drive API v3 field.
  - *Example*: `DriveApp.searchFiles("modifiedTime >= '2024-04-24T00:00:00'")`.

### Advanced Service Versioning (v3 Preference)
- **Drive API**: `gas-fakes` follows the **Drive API v3** naming convention. 
  - Use `Drive.Files.create()` instead of `insert()`.
  - Use `name` instead of `title` in resource objects.
  - If a method from a live Apps Script snippet fails, check for its v3 equivalent before assuming it is missing.
- **Service Discovery**: If unsure about available methods, run a short `workspace_agent` script to log `Object.keys(Service.SubService)` to confirm implemented endpoints.

### Authentication & Troubleshooting
- **Permission Denied/Auth Failures**: Most authentication errors stem from a mismatch between the script's required scopes and the authorized environment.
  - **Manifest & Scopes**: `gas-fakes` reads `appsscript.json` to discover required scopes. If these scopes weren't authorized during `gas-fakes auth`, the script will fail.
  - **Advice for User**: 
    - Check if `appsscript.json` contains the required `oauthScopes`.
    - Run `gas-fakes auth` to ensure the environment has the latest credentials.
    - If using **DWD (Domain Wide Delegation)**: Remind the user that the Service Account must be explicitly authorized in the Google Workspace Admin Console (Security > API Controls > Domain-wide Delegation) for the specific scopes being used.
  - **Initialization**: Ensure the project has been initialized using `gas-fakes init`. The `.env` file must contain the correct `GF_PLATFORM_AUTH` and associated credentials.

### Parity & Platform Logic
- **`ScriptApp.isFake`**: Use this boolean to detect the `gas-fakes` environment.
  - **Best Practice**: Guard **only** infrastructure logic (logging, cache checks, special backends) with this flag. 
  - **Warning**: Do **not** use it to change the core business logic of a script, as this defeats the purpose of parity.
- **Backend Selection**: `ScriptApp.__platform` can be dynamically switched to target `google`, `ksuite`, or `msgraph`. 
  - **Self-Correcting**: `gas-fakes` resources (Files, Sheets) "remember" their platform at creation. Subsequent calls on that object will automatically use the correct backend even if `ScriptApp.__platform` has changed globally.

### Advanced Service Usage & Interop
- **Metadata Access**: If a standard service object (e.g., `Spreadsheet`) doesn't expose a specific property, use `Service.__getMetaProps(fields)` or `Service.__getMeta()` to fetch the underlying JSON resource from the Google API.
- **Batching and Flush**:
  - **Spreadsheets**: Use `SpreadsheetApp.flush()` to force calculation and commitment of values.
  - **Documents**: Use `doc.saveAndClose()` followed by `DocumentApp.openById(id)` to synchronize the "Shadow Document" state with the Google servers.
- **Advanced Drive (v3)**:
  - **List Files**: `Drive.Files.list({ q: "...", fields: "files(id, name)" })` is the most efficient way to batch fetch file metadata.
  - **Permissions**: `Drive.Permissions.create({ role, type, emailAddress }, fileId)` is preferred for programmatic sharing.
- **Iterators**: `gas-fakes` iterators (like `FileIterator`) implement the native Apps Script `hasNext()` and `next()` methods, which differ from standard JavaScript iterators.

### Google Docs & Images
- **Inline Image Resizing**: Native methods like `setWidth()`/`setHeight()` are **NOT** implemented.
- **Conversion**: To create a Google Doc from HTML, use `Drive.Files.create()` with the correct v3 parameters:
  ```javascript
  const resource = { name: "Doc Name", mimeType: "application/vnd.google-apps.document" };
  Drive.Files.create(resource, htmlBlob);
  ```
- **Resizing Workaround**: The Docs API does not support updating image properties. You must **delete and re-insert** the image with the new dimensions.
  - **Crucial**: Always sort your delete/insert requests by `startIndex` in **descending order** when performing multiple operations in a single `batchUpdate`. This prevents index shifting from invalidating subsequent operations in the same batch.
- **Shadow Document & Named Ranges**: `gas-fakes` uses a "Shadow Document" approach. Elements are tracked using Named Range tags to maintain positional integrity during updates.
- **Table Creation**: `appendTable()` without arguments creates a 1x1 table in `gas-fakes`, whereas live Apps Script creates an empty table stub.
- **Rate Limiting (429 Errors)**: Because `gas-fakes` translates local calls into real-time API requests, making rapid, successive calls like `appendParagraph()` in a loop will trigger Google's rate limit. 
  - **Best Practice**: Concatenate strings locally and make a single `appendParagraph()` call, rather than appending multiple short lines separately.
  - **Real-time Feedback**: If you see retryable 429 errors in the console output during script execution, you MUST inform the user that the process is experiencing rate limiting but that `gas-fakes` is automatically handling retries.

### Google Sheets (SpreadsheetApp)
- **Chart Creation & Ranges**: When using `EmbeddedChartBuilder.addRange()`, the Sheets API requires `ChartSourceRange` domains and series to have a length of 1 for either rows or columns.
  - **Crucial**: Do **not** pass a multi-column range to `addRange()`. Add domains and series as separate single-column ranges.
- **Values vs. Display Values**: 
  - `getValues()` returns unformatted data.
  - `getDisplayValues()` returns formatted strings.
  - `setValues()` uses "USER_ENTERED" mode.
- **Bulk Operations (RangeList)**: Use `sheet.getRangeList(['A1', 'C1', 'E1'])` for multi-range formatting.

### Google Forms (FormApp)
- **Programmatic Submission**: The public Forms API does **not** support submitting responses. `gas-fakes` uses a "web submission hack" that temporarily makes the form public to scrape tokens and POST the response.
- **Choice IDs**: The Forms API uses hex string IDs, while Apps Script uses numbers. `gas-fakes` handles this conversion automatically.

### JDBC
- **MySQL 8+ Authentication**: You must downgrade users to `mysql_native_password` on the server for successful connection.
- **BigDecimal**: Always wrap `getBigDecimal()` result in `Number()` or `parseFloat()` for cross-platform compatibility.

