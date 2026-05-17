import '@mcpher/gas-fakes';
import { initTests } from "./testinit.js";
import { wrapupTest } from './testassist.js';

// We import the pure test file dynamically during the test
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * gas-fakes specific tests for HtmlService complex features.
 * We override process.argv[1] here to trick the gas-fakes Worker
 * into parsing `testhtmlserviceasync-source.js` as the "main" script,
 * since the test runner itself isn't a pure Apps Script file.
 */
export const testHtmlServiceAsync = (pack) => {
  const { unit, fixes } = pack || initTests();

  if (!ScriptApp.isFake) {
      return { unit, fixes };
  }

  unit.section("gas-fakes: Web App doGet/doPost from Pure Script", async t => {
      // 1. Trick the worker into reading the pure source file instead of this test runner
      const scriptPath = path.join(__dirname, 'localtesthtmlserviceasync-source.js');
      const originalArgv = process.argv[1];
      process.argv[1] = scriptPath;

      // 2. Start the web app server
      const port = 3006;
      const server = HtmlService.__startWebApp(port, scriptPath);

      try {
          // Wait for server to start listening
          await new Promise(r => setTimeout(r, 500));

          // 3. Test GET (Template Evaluation & Variable Resolution)
          const getRes = await fetch(`http://localhost:${port}/`);
          const getText = await getRes.text();
          
          t.true(getText.includes("Hello from pure server variables!"), { 
            description: 'doGet template evaluation should resolve local variable' 
          });
          t.true(getText.includes("window.google.script.run ="), {
            description: 'Polyfill should be injected'
          });

          // 4. Test POST (doPost)
          const postRes = await fetch(`http://localhost:${port}/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value: 'Test Data' })
          });
          const postText = await postRes.text();
          t.is(postText, "<b>Posted: Test Data</b>");

          // 5. Test RPC (google.script.run & server-side imports)
          const rpcRes = await fetch(`http://localhost:${port}/__gas_rpc`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ funcName: 'getServerData', args: [] })
          });
          const rpcData = await rpcRes.json();
          t.is(rpcData.result.message, "Data from pure function");
          t.is(rpcData.result.pathTest, "foo/bar"); // Proves `path` import worked!

      } finally {
          server.close();
          // Restore argv
          process.argv[1] = originalArgv;
      }
  });

  if (!pack) {
    setTimeout(() => unit.report(), 100);
  }

  return { unit, fixes };
};

if (typeof ScriptApp !== 'undefined' && ScriptApp.isFake) {
    wrapupTest(testHtmlServiceAsync);
}
