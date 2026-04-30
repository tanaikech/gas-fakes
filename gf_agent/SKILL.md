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
1. **Understand the Task**: Identify which Google Apps Script services are required.
2. **Pre-Implementation Verification (Strict Isolation)**: You MUST treat the `gf_agent/` directory as your ONLY source of truth for implemented capabilities. 
    - **Prohibit Repository Access**: Even if running inside the `gas-fakes` source repository, you MUST NOT read the `progress/`, `test/`, or `src/` directories for verification.
    - **Consult Portable Index**: ALWAYS read the `gf_agent/index.md` and the relevant files in `gf_agent/skills/` to confirm a method exists before using it.
    - **Use Service Discovery**: If a method is not in the index but you believe it should exist, run a `workspace_agent` script (e.g., `console.log(Object.keys(Service))`) to verify the *actual* environment.
    - **Iterative Execution**: Rely on the "not yet implemented" proxy errors for runtime correction.
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


### Common Apps Script Syntax Gotchas (First-Time Accuracy)
- **File Conversion (Exporting to PDF)**: While live Apps Script can seamlessly convert text files (`text/plain`) to PDF using `file.getAs('application/pdf')`, the underlying Google Drive API **only supports exporting Docs Editor files** (Docs, Sheets, Slides).
  - **Automated Workaround in gas-fakes**: `gas-fakes` handles this transparently! If you attempt to convert a non-editor file to PDF locally via `.getAs()`, it automatically performs a temporary two-step conversion (copying it to a Google Doc, exporting it, and trashing the temp file). This ensures parity with live Apps Script without manual intervention.
- **Google Docs Formatting**: You CANNOT apply formatting (bold, italic, etc.) directly to a `Paragraph` or `ListItem`. You MUST use `editAsText()` first.
  - *Incorrect*: `paragraph.setItalic(true)`
  - *Correct*: `paragraph.editAsText().setItalic(true)`
- **Google Docs Element Detachment**: To move or duplicate an element (like an image, paragraph, or table) within a document, you **cannot** just append it if it's already attached to the document tree. You must either detach it (`element.removeFromParent()`) or copy it (`element.copy()`) first, otherwise an "Element must be detached" error is thrown.
- **Google Docs Headers/Footers**: You can only add one header/footer to a document tab. Calling `doc.addHeader()` twice will throw an error.
- **Google Sheets Developer Metadata**: You **cannot** add `DeveloperMetadata` to an arbitrary range (e.g., `A1:B2`) or a partial row/column. It **only** works on full sheets, full rows (`9:9`), full columns (`J:J`), or the spreadsheet itself.
- **Google Sheets Filters**: A sheet can only have one filter at a time. Attempting to call `range.createFilter()` on a sheet that already has a filter will throw an error.
- **Google Drive Blob Naming**: When creating a file from a Blob (`DriveApp.createFile(blob)`), the Blob **must** have a name. `Utilities.newBlob("content")` does not set a name by default and will throw "Blob object must have non-null name". Always use `Utilities.newBlob("content", "text/plain", "filename.txt")`.
- **Flush Requirements**: If your script creates a resource and immediately tries to perform a complex search or metadata operation on it, call `SpreadsheetApp.flush()` or `doc.saveAndClose()` to ensure the state is synchronized.
- **Date Comparison**: When comparing dates from `getLastUpdated()` or `getDateCreated()`, remember they are JavaScript `Date` objects. Use `.getTime()` for reliable numerical comparison.


### Authentication & Troubleshooting
- **Permission Denied/Auth Failures**: Most authentication errors stem from a mismatch between the script's required scopes and the authorized environment.
  - **Manifest & Scopes**: `gas-fakes` reads `appsscript.json` to discover required scopes. If these scopes weren't authorized during `gas-fakes auth`, the script will fail.
  - **Advice for User (Auth Methods)**: When a user needs help setting up authentication for `gas-fakes`, advise them based on their specific situation:
    - **Service Account (Default)**: Recommend this for most automated tasks or server environments. They need a GCP project, a Service Account, and its JSON key file.
    - **DWD (Domain Wide Delegation)**: Recommend this if the script needs to act on behalf of other users in a Google Workspace domain. Remind the user that the Service Account must be explicitly authorized in the Google Workspace Admin Console (Security > API Controls > Domain-wide Delegation) for the specific scopes being used, and they must provide the `Subject` email address during the `gas-fakes auth` flow.
    - **Desktop/OAuth (CLI)**: Recommend this for personal scripting or if they cannot use a Service Account. It requires `OAuth Client ID` credentials from GCP (Application type: Desktop) and will prompt them to authenticate via a browser window.
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

### Chart Generation Parity (SpreadsheetApp.newChart)
When implementing Google Sheets Embedded Charts, be aware of the following Live Apps Script vs. REST API oddities:
- **Enum Strictness**: Live GAS actively rejects string literals for `Charts` Enums (e.g., passing `"SHOW_ALL"` instead of `Charts.ChartHiddenDimensionStrategy.SHOW_ALL` throws `The parameters (String) don't match the method signature`). Ensure your generated test scripts strictly use the Enum objects.
- **Method Availability**: Live GAS does not support visual formatting methods (`setTitle`, `setBackgroundColor`) on the generic `EmbeddedChartBuilder` returned by `sheet.newChart()`. They are only available *after* casting to a specific builder (e.g., `.asPieChart().setTitle(...)`). 
- **Hidden Dimensions Crash**: `setHiddenDimensionStrategy` will throw a backend `Unexpected error` if called before assigning a chart type, or if called on an incompatible type (like a Pie chart or Table chart). Only call it on compatible builders (like a Bar or Column chart).

### Environment-Agnostic Test Design
- When generating scripts or test assertions designed to run interoperably (both locally on Node.js and on Live Apps Script), **never assert against internal private properties** (e.g., properties prefixed with `__`, like `__apiChart`). These properties do not exist on the Live Apps Script Java classes and will cause the script to crash in the cloud environment. Only assert against public, documented getter/setter methods.


# gf_agent Knowledge Base

This directory contains modular markdown files representing the "Lessons Learned & Best Practices" for the `gf_agent` skill.

## Contributing

To prevent Git merge conflicts on the monolithic `gf_agent/SKILL.md` file, collaborators should **never edit `gf_agent/SKILL.md` directly**. 

Instead, to add new knowledge or instructions to the agent:
1. Create a new markdown file in this directory (e.g., `06-new-feature.md`).
2. Prefix it with a number to control the insertion order.
3. Write your instructions, tips, or parity warnings.
4. Commit ONLY your new markdown file and submit a Pull Request.

**Do not attempt to compile the SKILL.md file yourself.**
When your Pull Request is merged into the core `gas-fakes` repository, the maintainer will run the overarching `npm run docs` pipeline. The `builder.js` script will automatically read all files in this directory, sort them, and cleanly generate the final `gf_agent/SKILL.md` artifact for all users.

