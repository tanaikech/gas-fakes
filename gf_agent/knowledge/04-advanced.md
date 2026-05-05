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
- **Inline Image Resizing (DocumentApp)**: Native methods like `setWidth()` and `setHeight()` on `InlineImage` objects are **NOT** implemented in `gas-fakes`. If you call these, the script will crash with a "not yet implemented" error.
- **Conversion**: To create a Google Doc from HTML, use `Drive.Files.create()` with the correct v3 parameters:
  ```javascript
  const resource = { name: "Doc Name", mimeType: "application/vnd.google-apps.document" };
  Drive.Files.create(resource, htmlBlob);
  ```
- **Resizing Workaround (Advanced Docs Service)**: Because the Docs API does not support updating image properties directly, you must use the Advanced Docs Service (`Docs.Documents.batchUpdate`) to **delete and re-insert** the image with the new dimensions. 
  - To do this, fetch the document via `Docs.Documents.get()`, locate the inline image URIs and object IDs, and construct `deleteObject` and `insertInlineImage` requests.
  - **Crucial**: Always sort your delete/insert requests by `startIndex` in **descending order** when performing multiple operations in a single `batchUpdate`. This prevents index shifting from invalidating subsequent operations in the same batch.
- **Shadow Document & Named Ranges**: `gas-fakes` uses a "Shadow Document" approach. Elements are tracked using Named Range tags to maintain positional integrity during updates.
- **Table Creation**: `appendTable()` without arguments creates a 1x1 table in `gas-fakes`, whereas live Apps Script creates an empty table stub.
- **Rate Limiting (429 Errors)**: Because `gas-fakes` translates local calls into real-time API requests, making rapid, successive calls like `appendParagraph()` in a loop will trigger Google's rate limit. 
  - **Best Practice**: Concatenate strings locally and make a single `appendParagraph()` call, rather than appending multiple short lines separately.
  - **Real-time Feedback**: If you see retryable 429 errors in the console output during script execution, you MUST inform the user that the process is experiencing rate limiting but that `gas-fakes` is automatically handling retries.
