# Sandbox mode

It's quite tricky to emulate this scope using the Node Auth library, so while this is being worked on, we can use the sandbox mode which is available in gas-fakes

## How it works

In sandbox mode, you can only access files you've created in the same session. This will be an emulation of the effect of the drive.file scope. In addition it also provides a handy clean up opportunity for writing tests, as you can specify that any files you create get trashed on completion. 

In summary, you just do this at the beginning of your script to enable the default behavior. There are more options documented later.
````
ScriptApp.__behavior.sandboxMode = true;
````

### tests

All the tests already have sandbox enabled, and will clean up by default on exit.


# `ScriptApp.__behavior` Object

The `ScriptApp.__behavior` object is a special feature within the `gas-fakes` environment designed to control file access and manage test artifacts. Its primary purpose is to emulate the behavior of the restrictive `drive.file` OAuth scope and to provide a robust cleanup mechanism for automated tests.

## Sandbox Mode

The core concept of the `__behavior` object is **Sandbox Mode**. When enabled, it restricts all file operations to only those files and folders that have been created during the current execution session. This closely mimics how the `drive.file` scope works in a real Apps Script environment, where a script can only access files it has created.

This is particularly useful for:
1.  **Testing with `drive.file` scope:** It allows you to test your script's logic under the same constraints as the `drive.file` scope without needing to change your local development credentials from the more permissive `drive` scope, which is required for `gas-fakes` to initialize.
2.  **Test Isolation:** It ensures that tests do not accidentally access or modify files outside of their intended scope, leading to more reliable and predictable test runs.

By default, the tests included with `gas-fakes` have sandbox mode enabled to ensure proper cleanup and isolation.

## Properties

You can configure the behavior of the sandbox through these properties on the `ScriptApp.__behavior` object.

| Property          | Type      | Default | Description                                                                                                                                                           |
| ----------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandboxMode`     | `boolean` | `false` | When set to `true`, file access is restricted to files created within the current session.                                                                                |
| `cleanup`         | `boolean` | `true`  | If `true`, calling the `trash()` method will move all files created during the session to the Google Drive trash. Set to `false` to leave test artifacts for inspection. |
| `strictSandbox`   | `boolean` | `true`  | When `true` and `sandboxMode` is active, any attempt to access a file not created in the session will throw an error. If `false`, it allows access, which can be useful for debugging but does not strictly emulate the `drive.file` scope. |

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

## Methods

The following methods are available on the `ScriptApp.__behavior` object.

### `addFile(id)`

*   **Description:** Registers a file ID as having been created during the current session. This method is called internally by `gas-fakes` whenever a file is created (e.g., via `DriveApp.createFile()`) and is generally not needed for direct use in tests.
*   **Parameters:**
    *   `id` (string): The ID of the file to register.

### `isAccessible(id)`

*   **Description:** Checks if a given file ID is accessible based on the current sandbox settings. This is used internally by methods like `DriveApp.getFileById()` to enforce sandbox rules.
*   **Parameters:**
    *   `id` (string): The file ID to check.
*   **Returns:** `boolean` - `true` if the file is accessible, `false` otherwise.

### `trash()`

*   **Description:** Moves all files created and registered during the session to the Google Drive trash. This is the primary method for cleaning up test artifacts. The operation is skipped if the `cleanup` property is `false`.
*   **Returns:** `string[]` - An array of the file IDs that were trashed.

### `isKnown(id)`

*   **Description:** Checks if a file ID has been registered as created within the current session.
*   **Parameters:**
    *   `id` (string): The file ID to check.
*   **Returns:** `boolean` - `true` if the file was created in this session, `false` otherwise.

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

