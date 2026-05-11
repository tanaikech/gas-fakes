// This file simulates a pure Google Apps Script project.
// No globalThis, no module exports. Pure local declarations.

import '@mcpher/gas-fakes';
import path from 'path'; // Test server-side imports

// Local variable accessible by template
const serverGreeting = "Hello from pure server variables!";

// Function accessible by google.script.run
function getServerData() {
    return {
        message: "Data from pure function",
        timestamp: new Date().getTime(),
        pathTest: path.join('foo', 'bar')
    };
}

// Global doGet function
function doGet(e) {
    const template = HtmlService.createTemplate(`
        <html>
            <head><title>Pure App</title></head>
            <body>
                <h1 id="greeting"><?= serverGreeting ?></h1>
                <div id="data"></div>
                <script>
                   function loadData() {
                       google.script.run.withSuccessHandler(function(res) {
                           document.getElementById('data').innerText = res.message + " - " + res.pathTest;
                       }).getServerData();
                   }
                   // Auto-run on load
                   window.onload = loadData;
                </script>
            </body>
        </html>
    `);
    return template.evaluate();
}

// Global doPost function
function doPost(e) {
    const data = JSON.parse(e.postData.contents);
    return HtmlService.createHtmlOutput(`<b>Posted: ${data.value}</b>`);
}