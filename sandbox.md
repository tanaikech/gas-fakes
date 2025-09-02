# Sandbox mode

Gas-fakes has a sandbox mode which allows you to specifiy which files (and even services and methods) it is allowed to access. This gives much better control than you can achieve with oauth scopes only. First we'll look at the overall sandbox mode.

## How it works

In sandbox mode, you can only access files you've created in the same session. This will be an emulation of the effect of the drive.file scope. In addition it also provides a handy clean up opportunity for writing tests, as you can specify that any files you create get trashed on completion. 

In summary, you just do this at the beginning of your script to enable the default behavior. There are more options documented later.
````
ScriptApp.__behavior.sandboxMode = true;
````


# `ScriptApp.__behavior` Object

The `ScriptApp.__behavior` object is a special feature within the `gas-fakes` environment designed to control file access and manage test artifacts. Its primary purpose is to protect against the accidental access of Drive file and to provide a robust cleanup mechanism for automated tests.

## Sandbox Mode

The core concept of the `__behavior` object is **Sandbox Mode**. When enabled, it restricts all file operations to only those files and folders that have been created during the current execution session. This closely mimics how the `drive.file` scope works in a real Apps Script environment, where a script can only access files it has created.

This is particularly useful for:
1.  **Testing with `drive.file` scope:** It allows you to test your script's logic under similar constraints as the `drive.file` scope without needing to change your local development credentials from the more permissive `drive` scope, which is required for `gas-fakes` to initialize.
2.  **Test Isolation:** It ensures that tests do not accidentally access or modify files outside of their intended scope, leading to more reliable and predictable test runs.
3. **Whitelisting Files:** Individual files can be marked as 'ok' for access, even in sandbox mode, and the type of access limited to, for example readonly
3. **Disabling/enabling specific services:** Individual services can be disabled to ensure your script does not accidentally require services you don't want to use.
4. **Automatic cleanup:** To avoid a build up of temporary files during testing phases, optionally the sandbox can remove all the files it created while operational. By default, the tests included with `gas-fakes` have sandbox mode enabled to automatically dispose of files created in test mode


## Properties

You can configure the behavior of the sandbox through these properties on the `ScriptApp.__behavior` object.

| Property          | Type      | Default | Description                                                                                                                                                           |
| ----------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandboxMode`     | `boolean` | `false` | When set to `true`, file access is restricted to files created within the current session.                                                                                |
| `cleanup`         | `boolean` | `true`  | If `true`, calling the `trash()` method will move all files created during the session to the Google Drive trash. Set to `false` to leave test artifacts for inspection. |
| `strictSandbox`   | `boolean` | `true`  | When `true` and `sandboxMode` is active, any attempt to access a file not created in the session will throw an error. If `false`, it allows access, which can be useful for debugging but does not strictly emulate the `drive.file` scope. |
| `idWhitelist`   | `array` | null  | an array of `IdWhitelistItem` to allow access to, even when strictSandbox is turned on. |

### Example Usage:

```javascript
// Enable sandbox mode for a test
ScriptApp.__behavior.sandboxMode = true;


// Your test code here...
const myFile = DriveApp.createFile('test.txt', 'hello');

// This will succeed because the file was created in the session
const retrievedFile = DriveApp.getFileById(myFile.getId());

// This would fail (if the file wasn't created in this session)
// const otherFile = DriveApp.getFileById('some-other-id');

// Clean up created files at the end of a test run
ScriptApp.__behavior.trash();
```
## Whitelisting specific files

The `idWhitelist` property is an array of `IdWhiteListItems` that can be accessed, along with what access is allowed - even when sandboxStrict is true. By default the accesses below are applied.

```javascript
[{
  id: "xxx",
  read: true,
  write: false,
  trash: false
}] 
``` 

A white list item ican be created and configured from the behavior object - for example:

```javascript
const behavior = ScriptApp.__behavior;
behavior.idWhitelist = [
  behavior.newIdWhitelistItem('someid').setRead(true),
  behavior.newIdWhitelistItem('someotherid').setWrite(true).setTrash(true),
];
````


# Granular Sandbox Controls with `sandboxService`

While the global `sandboxMode` provides a powerful way to isolate tests, `gas-fakes` offers even more fine-grained control through the `sandboxService` object. This feature allows you to define specific sandbox behaviors for individual Google Workspace services like `DriveApp`, `SpreadsheetApp`, `DocumentApp`, and `SlidesApp`. The related advanced services such as Drive, Sheets etc share the same controls as their counterparts. 

## How it works

The `sandboxService` object, accessible via `ScriptApp.__behavior.sandboxService`, contains a separate configuration object for each supported service. By modifying the properties of these service-specific objects, you can override the global sandbox settings. If a per-service setting is not explicitly set, it will automatically fall back to the global setting defined on `ScriptApp.__behavior`.

This is ideal for complex testing scenarios, such as:
-   Disabling `SpreadsheetApp` while allowing `DriveApp` to function normally.
-   Restricting `DriveApp` to only allow the `createFile` method.


## Accessing Service Settings

You can access the settings for a specific service by using its name as a property on the `sandboxService` object:

```javascript
// Access the settings for SpreadsheetApp
const sheetServiceSettings = ScriptApp.__behavior.sandboxService.SpreadsheetApp;

// Disable the SpreadsheetApp service
sheetServiceSettings.enabled = false;

// Allow only the 'getFileById' method for DriveApp
ScriptApp.__behavior.sandboxService.SpreadsheetApp.methods = ['getFileById'];
```

## Configuration Properties

Each service object within `sandboxService` has the following properties. By default, all properties are `null`, which means they inherit their behavior from the global `ScriptApp.__behavior` settings.

| Property          | Type      | Default (Effective) | Description                                                                                                                                                           |
| ----------------- | --------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | `boolean` | `true`                | Set to `false` to completely disable all methods of this service. An error will be thrown if any method is called.                                                      |
| `sandboxMode`     | `boolean` | Global `sandboxMode`  | Overrides the global `sandboxMode` setting for this service only.                                                                                                     |
| `sandboxStrict`   | `boolean` | Global `strictSandbox`| Overrides the global `strictSandbox` setting for this service only.                                                                                                   |
| `methodWhitelist`   | `array` | null (all methods available) | Provide a list of methods can be accessed in the given service. Only the final method name is relevant - so DriveApp.File.getById would be 'getById'. |


    ```

## Example Scenarios

### Disabling a Service

Note that the DriveApp service is generally required by any other service to work. For example, the SpreasheetApp service delegates many operations to the DriveApp service. Effectively then, if any other service is enabled, disabling the DriveApp service will be ignored.

```javascript
// Disable DocumentApp, but allow other services to work
ScriptApp.__behavior.sandboxService.DocumentApp.enabled = false;

// This will throw an error
try {
  DocumentApp.openById('abc');
} catch (e) {
  console.log(e.message); // "DocumentApp service is disabled by sandbox settings."
}

// This will still work (assuming SpreadsheetApp is enabled)
const ss = SpreadsheetApp.create("My Sheet");
```

### Restricting Methods

Note that some methods are required for the service to work at all (for example getFileById) and will always be allowed whenever the service is enabled.

```javascript
// Only allow creating files and folders in DriveApp
ScriptApp.__behavior.sandboxService.DriveApp.methodWhitelist = ['createFile', 'createFolder'];

// This will succeed
const newFolder = DriveApp.createFolder("My Test Folder");

// This will throw an error
try {
  const root = DriveApp.openById('some-other-id');
} catch (e) {
  console.log(e.message); // "Method DriveApp.getRootFolder is not allowed by sandbox settings."
}
```

### Allowing Access to Specific External Files

This is useful for tests that need to read from a known template file without disabling the sandbox entirely.

```javascript
const behavior = ScriptApp.__behavior;

// Enable sandbox mode globally
behavior.sandboxMode = true;

// allow granular access type to specific files, ignoring the setting of strictSandbox for these

behavior.idWhitelist = [
  behavior.newIdWhitelistItem('input_id'),
  behavior.newIdWhitelistItem('update-id').setWrite(true),
];

// These will all succeed because the ID is whitelisted, and read access is allowed
const input = DriveApp.getFileById('input-id');
const ss = SpreadsheetApp.openById("sheet-id");
input.getName();
const sheet = ss.getSheets()[0]

// this will fail because only read access is allowed
input.setContent('foo');

// this will succeed because read/write is allowed
sheet.getRange("a1:b1").setValues([['foo','bar']]);

// these will fail because trash access is not allowed
input.setTrashed(true);
DriveApp.getFileById(output.getId()).setTrashed(true);


// This will fail because it's not whitelisted and not created in the session, and sandboxStrict is true by default
try {
  const otherFile = DriveApp.getFileById('some-other-id');
} catch (e) {
  console.log(e.message); // 'Access to file "some-other-id" is denied by sandbox rules.'
}


## How it works

The `sandboxService` object, accessible via `ScriptApp.__behavior.sandboxService`, contains a separate configuration object for each supported service. By modifying the properties of these service-specific objects, you can override the global sandbox settings. If a per-service setting is not explicitly set, it will automatically fall back to the global setting defined on `ScriptApp.__behavior`.

This is ideal for complex testing scenarios, such as:
-   Disabling `SpreadsheetApp` whilst allowing `DriveApp` to function normally.
-   Restricting `DriveApp` to only allow the `createFile` method.
-   Allowing access to a specific, known spreadsheet by its ID while keeping the rest of the environment in strict sandbox mode.


## Accessing Service Settings

You can access the settings for a specific service by using its name as a property on the `sandboxService` object:

```javascript
// Access the settings for SpreadsheetApp
const sheetServiceSettings = ScriptApp.__behavior.sandboxService.SpreadsheetApp;

// Disable the SpreadsheetApp service
sheetServiceSettings.enabled = false;

// Allow only the 'getFileById' method for DriveApp
ScriptApp.__behavior.sandboxService.SpreadsheetApp.methods = ['getFileById'];
```

## Configuration Properties

Each service object within `sandboxService` has the following properties. By default, all properties are `null`, which means they inherit their behavior from the global `ScriptApp.__behavior` settings.

| Property          | Type      | Default (Effective) | Description                                                                                                                                                           |
| ----------------- | --------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`         | `boolean` | `true`                | Set to `false` to completely disable all methods of this service. An error will be thrown if any method is called.                                                      |
| `sandboxMode`     | `boolean` | Global `sandboxMode`  | Overrides the global `sandboxMode` setting for this service only.                                                                                                     |
| `sandboxStrict`   | `boolean` | Global `strictSandbox`| Overrides the global `strictSandbox` setting for this service only.|
| `methodWhitelist`         | `string[]`| `null` (all allowed)  | A whitelist of method names that are permitted for this service. If set, any call to a method not in this array will throw an error.                                     |


## Configuration Methods

### `clear()`

*   **Description:** Resets all per-service settings for a specific service back to their default state. This effectively removes any overrides and makes the service fall back to the global `ScriptApp.__behavior` settings.
*   **Example:**
    ```javascript
    const driveSettings = ScriptApp.__behavior.sandboxService.DriveApp;
    driveSettings.enabled = false; // Disable DriveApp
    driveSettings.clear(); // Re-enable DriveApp by clearing the override
    ```

## Example Scenarios

### Disabling a Service

```javascript
// Disable DocumentApp, but allow other services to work
ScriptApp.__behavior.sandboxService.DocumentApp.enabled = false;

// This will throw an error
try {
  DocumentApp.openById('abc');
} catch (e) {
  console.log(e.message); // "DocumentApp service is disabled by sandbox settings."
}

// This will still work (assuming SpreadsheetApp is enabled)
const ss = SpreadsheetApp.create("My Sheet");
```

### Restricting Methods

```javascript
// Only allow creating files and folders in DriveApp
ScriptApp.__behavior.sandboxService.DriveApp.methodWhitelist = ['createFile', 'createFolder'];

// This will succeed
const newFolder = DriveApp.createFolder("My Test Folder");

// This will throw an error
try {
  const root = DriveApp.getRootFolder();
} catch (e) {
  console.log(e.message); // "Method DriveApp.getRootFolder is not allowed by sandbox settings."
}
```

### Allowing Access to Specific External Files

This is useful for tests that need to read from a known template file without disabling the sandbox entirely.

```javascript
// Enable sandbox mode globally
ScriptApp.__behavior.sandboxMode = true;

// Make the sandbox non-strict for DriveApp
ScriptApp.__behavior.sandboxService.DriveApp.sandboxStrict = false;

// Whitelist a specific template file ID
const TEMPLATE_FILE_ID = 'your-template-file-id-here';
ScriptApp.__behavior.sandboxService.DriveApp.ids = [TEMPLATE_FILE_ID];

// This will succeed because the ID is whitelisted
const templateFile = DriveApp.getFileById(TEMPLATE_FILE_ID);

// This will fail because it's not whitelisted and not created in the session
try {
  const otherFile = DriveApp.getFileById('some-other-id');
} catch (e) {
  console.log(e.message); // 'Access to file "some-other-id" is denied by sandbox rules.'
}
```

## Translations and writeups

- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [Russian version](README.RU.md) ([credit Alex Ivanov](https://github.com/oshliaer)) - needs updating
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [gemini](gemini.md) - some reflections and experiences on using gemini to help code large projects
- [named colors](named-colors.md) - colors supported by Apps Script
- [setup env](setup-env.md) - ([credit Eric Shapiro] - additional info on contents of .env file
- [this file](README.md)
- [named colors](named-colors.md)
- [sandbox](sandbox.md)

