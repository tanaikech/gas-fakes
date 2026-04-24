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
2. **Consult Progress**: Refer to the `skills/` directory in this agent to see which methods are implemented in `gas-fakes`.
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

### Google Docs & Images
- **Inline Image Resizing**: Standard Apps Script methods like `InlineImage.setWidth()` or `setHeight()` are currently **NOT** implemented in `gas-fakes` (throwing "not yet implemented").
- **Docs API Limitations**: The Google Docs API does not support updating properties (like size) of existing inline objects. The `updateInlineObjectProperties` request is invalid and will be rejected by the API.
- **Workaround**: To resize an image, you must use the Advanced `Docs` service to read the document, find the image's `contentUri` and `size`, locate its index, and then execute a `batchUpdate` that deletes the original image and inserts a new one with the desired size.
  ```javascript
  const requests = [];
  // 1. Delete original image
  requests.push({
    deleteContentRange: {
      range: { startIndex: imageStartIndex, endIndex: imageEndIndex }
    }
  });
  // 2. Insert new image with resized dimensions
  requests.push({
    insertInlineImage: {
      location: { index: imageStartIndex },
      uri: imageContentUri,
      objectSize: {
        width: { magnitude: newWidth, unit: 'PT' },
        height: { magnitude: newHeight, unit: 'PT' }
      }
    }
  });
  Docs.Documents.batchUpdate({ requests }, docId);
  ```
- **Detached Elements**: When copying elements (like images or paragraphs), ensure they are detached before attempting to insert or append them elsewhere using `.copy()`.

### Google Slides
- **Dynamic Element Creation**: Always use specific insertion methods like `slide.insertTextBox(text, l, t, w, h)` or `slide.insertTable(r, c, l, t, w, h)` to ensure proper positioning and sizing at creation time.
- **Transformations**: Use `setLeft()`, `setTop()`, `setWidth()`, and `setHeight()` for precise manipulation of lines and shapes.

### General Patterns
- **Flush to Commit**: When performing multiple spreadsheet or doc operations in a tight loop, call `SpreadsheetApp.flush()` or `doc.saveAndClose()` to ensure data is committed and visible to subsequent operations.
- **Advanced Service Discovery**: If a method is missing in the standard service (e.g., `SpreadsheetApp`), check if the Advanced Service (e.g., `Sheets`) provides a way to achieve the same result via `batchUpdate`.
- **Iterators**: `gas-fakes` iterators (like `FileIterator`) implement the native Apps Script `hasNext()` and `next()` methods, which differ from standard JavaScript iterators.

### Unusual Patterns & Technical Constraints

#### Google Drive (DriveApp vs. Drive Advanced)
- **File Export**: When using `Drive.Files.export`, the Apps Script Advanced Service often requires an extra `{alt: 'media'}` parameter to successfully download content, even if not documented. `gas-fakes` handles this automatically using the API's `export` method.
- **Invalid Field Selection**: Some older files may trigger errors when requesting `createdTime` or `modifiedTime`. `gas-fakes` automatically retries these using v2 fields (`createdDate`/`modifiedDate`) if it detects this failure.

#### Google Sheets (SpreadsheetApp)
- **Values vs. Display Values**: 
  - `getValues()` returns unformatted data (e.g., `1` for a formatted cell).
  - `getDisplayValues()` returns formatted strings (e.g., `"1.00"`).
  - `setValues()` uses "USER_ENTERED" mode, meaning strings like `"=SUM(A1:A10)"` will be parsed as formulas.
- **Bulk Operations (RangeList)**: For applying the same formatting or value to multiple non-contiguous ranges, use `sheet.getRangeList(['A1', 'C1', 'E1'])`. This is significantly more efficient than individual `getRange` calls.
- **Data Validation**: Setting relative dates (e.g., `DATE_EQUAL_TO_RELATIVE`) via `withCriteria` is notoriously buggy in live Apps Script and is currently treated as an error-prone operation in `gas-fakes`.
- **Notes**: `setNote(25)` will store the value as `"25.0"` in some contexts due to an underlying Apps Script inconsistency.
- **Active Spreadsheet**: In local development, `getActiveSpreadsheet()` returns the sheet associated with the `GF_SCRIPT_ID` or `TEST_AIRPORTS_ID` found in `.env`.

#### Google Docs (DocumentApp)
- **Shadow Document & Named Ranges**: `gas-fakes` uses a "Shadow Document" approach. Elements are tracked using Named Range tags to maintain positional integrity during updates.
- **Horizontal Rules**: There is no direct API method to insert a Horizontal Rule element. This is a known limitation.
- **Table Creation**: `appendTable()` without arguments creates a 1x1 table in `gas-fakes`, whereas live Apps Script creates an empty table stub (which is impossible via the public API).
- **Element Indices**: Adding a table always inserts a preceding newline. Precise index management is required when inserting elements before or after tables.

#### Google Slides (SlidesApp)
- **Affine Transforms**: For advanced positioning, scaling, or shearing of elements, use `newAffineTransformBuilder()`. This allows for precise geometric manipulation beyond simple `setLeft`/`setTop`.
- **Autofit**: Text boxes default to `AutofitType.NONE`. Use the `Autofit` class to manage how text scales within shapes.

#### Google Drive (DriveApp vs. Drive Advanced)
- **Strict Sandbox Mode**: In some tests, the `strictSandbox` behavior is temporarily disabled to allow searching across the full Drive while still maintaining a localized worker context.
- **File Export**: When using `Drive.Files.export`, the Apps Script Advanced Service often requires an extra `{alt: 'media'}` parameter to successfully download content, even if not documented. `gas-fakes` handles this automatically using the API's `export` method.
- **Invalid Field Selection**: Some older files may trigger errors when requesting `createdTime` or `modifiedTime`. `gas-fakes` automatically retries these using v2 fields (`createdDate`/`modifiedDate`) if it detects this failure.

#### Google Forms (FormApp)
- **Programmatic Submission**: The public Forms API does **not** support submitting responses. `gas-fakes` uses a "web submission hack" that temporarily makes the form public to scrape tokens and POST the response. This is high-complexity and may have slight latency.
- **Title Discrepancy**: `FormApp.create(name)` sets the **Drive File Name** but leaves the internal Form Title blank. The API requires a title, so `gas-fakes` sets both to ensure consistency.
- **Choice IDs**: The Forms API uses hex string IDs, while Apps Script uses numbers. `gas-fakes` handles this conversion automatically.

#### JDBC
- **MySQL 8+ Authentication**: Live Apps Script drivers often fail with `caching_sha2_password`. You must downgrade users to `mysql_native_password` on the server for successful connection.
- **BigDecimal**: `getBigDecimal()` returns a Java proxy object. Always wrap the result in `Number()` or `parseFloat()` for cross-platform compatibility.
