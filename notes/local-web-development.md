# Local Web Development with gas-fakes

As of `gas-fakes` v2.4.0, you can develop and test Google Apps Script Web Apps and UI Add-ons entirely on your local machine using the built-in local web server.

## Starting the Server

To launch the emulator and test an HTML service script, use the `serve` command:

```bash
gas-fakes serve -i ./main.js -p 8080
```

By default, the server will load `./main.js` and execute the `doGet(e)` function whenever you visit `http://localhost:8080`.

## Testing Web Apps (`doGet` / `doPost`)

If you are building a standard Web App, simply export your `doGet` and `doPost` functions in your entry file. `gas-fakes` automatically injects the `e.parameter`, `e.parameters`, and `e.queryString` event properties based on the URL you hit in your browser.

```javascript
// main.js
export const doGet = (e) => {
  return HtmlService.createHtmlOutput(`Hello, you searched for: ${e.parameter.query}`);
};

export const doPost = (e) => {
  return ContentService.createTextOutput(`Received POST: ${e.postData.getDataAsString()}`);
};
```

## Testing Add-on Dialogs and Sidebars

When you build Google Workspace Add-ons (e.g. for Google Sheets), your HTML isn't served as a full webpage—it's usually constrained inside a Sidebar or a Modal Dialog.

`gas-fakes` provides visual emulation for this framing!

### 1. Using a Custom Entry Point
You don't need a `doGet` function to test a menu UI. You can tell `gas-fakes serve` to execute a specific function on load using the `-f` or `--function` flag:

```bash
gas-fakes serve -i ./addon.js -f showMySidebar
```

### 2. UI Framing Methods
Inside your script, call the UI methods exactly as you would in Apps Script. 

```javascript
// addon.js
export function showMySidebar() {
  const html = HtmlService.createHtmlOutput('<b>My Sidebar Content</b>');
  
  // This tells gas-fakes to frame the output visually as a 300px sidebar
  SpreadsheetApp.getUi().showSidebar(html);
  
  // You must return the HTML so the local server can render it to your browser
  return html; 
}

export function showMyModal() {
  const html = HtmlService.createHtmlOutput('<b>My Modal Content</b>');
  html.setWidth(600).setHeight(400);
  
  // Frames it as a floating modal with a backdrop and title bar
  SpreadsheetApp.getUi().showModalDialog(html, 'My Custom Modal');
  
  return html;
}
```

When you visit `localhost`, `gas-fakes` will wrap your HTML in an `iframe` stylized exactly like the Google Workspace UI, complete with the standard `add-ons1.css` stylesheet automatically injected!

## Client-Side RPC (`google.script.run`)

`gas-fakes` fully supports the `google.script.run` asynchronous RPC API. 

The server automatically injects a polyfill into your `<head>` when it serves the HTML. You can call any top-level function exported by your script directly from your client-side JavaScript, and it will securely execute inside the Node.js sandbox environment!

### Example HTML
```html
<script>
  function fetchSpreadsheetData() {
    google.script.run
      .withSuccessHandler((data) => {
        console.log("Got data from Node.js server!", data);
      })
      .withFailureHandler((err) => {
        console.error("Server threw an error:", err.message);
      })
      .getServerData();
  }
</script>
```

### Server Side
```javascript
export function getServerData() {
  // Use native Apps Script calls locally
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  return sheet.getDataRange().getValues();
}
```

## Closing Dialogs

Modern browsers block scripts from executing `window.close()` on tabs that users opened manually. To work around this during local development, `gas-fakes` polyfills `google.script.host.close()`. 

When your client-side code calls `google.script.host.close()`, it intercepts it and visually closes the emulated dialog window, replacing the screen with a "Dialog Closed" message—so your close button logic is fully testable!

## Template Evaluation and Includes

`gas-fakes` fully emulates `HtmlTemplate`. It securely evaluates scriptlets using a Node.js Virtual Machine.

You can modularize your front-end code using standard includes:

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <?!= include('stylesheet.html') ?>
  </head>
  <body>
    <h1>Hello <?= username ?>!</h1>
  </body>
</html>
```

```javascript
// server.js
globalThis.username = "Bruce";

export function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

export function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}
```

## Debugging

### 1. Named Modules in Chrome Debugger
When debugging client-side JavaScript in Chrome DevTools, it can be difficult to locate your scripts if they are served as anonymous blocks. To give them a recognizable name in the "Sources" tab, add a `sourceURL` comment to the end of your script:

```javascript
// At the bottom of your script or .html file
//# sourceURL=gas-fakes:///my_script_name.gs
```
This tells Chrome to map the script to the specified virtual path, making it much easier to set breakpoints and step through code.

### 2. Debugging the Node.js Side (VS Code)
To debug the `gas-fakes` server itself or your server-side Apps Script logic running in Node, you can use a VS Code launch configuration.

#### Recommended Configuration
If you experience missing output in the "Debug Console", it is recommended to use `console: "integratedTerminal"`. This ensures all output from both `gas-fakes` and your scripts is visible in the terminal tab.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug gas-fakes",
      "program": "${workspaceFolder}/gas-fakes.js",
      "args": ["serve", "index.js", "-m", "doGet"],
      "cwd": "${workspaceFolder}/your/project/path",
      "console": "integratedTerminal"
    }
  ]
}
```

#### Why is there no output in the Debug Console?
If you use the default `internalConsole` and see no output, it is often due to `outputCapture` settings or conflicts with manual `--inspect` flags. 

- **Avoid `runtimeArgs: ["--inspect"]`**: VS Code's `node` debugger automatically handles inspector attachment. Manually adding this flag can cause port conflicts or prevent VS Code from correctly capturing the debug protocol events.
- **Avoid `outputCapture: "std"`**: While this flag is intended to capture stdout/stderr, it can sometimes interfere with the standard `console.log` interception used by the VS Code debug protocol. If you don't see logs, remove this flag or switch to `integratedTerminal`.