
import "../main.js";
import { initTests } from "./testinit.js";
import { trasher, getDrivePerformance, getSheetsPerformance } from "./testassist.js";

export const testSandbox = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("sandbox behavior", t => {
    const behavior = ScriptApp.__behavior;

    // Test initial state from testinit.js
    t.is(behavior.sandboxMode, true, "Sandbox mode should be enabled by default for tests");
    t.is(behavior.sandBoxMode, true, "sandBoxMode synonym should work for get");
    t.is(behavior.strictSandbox, true, "Strict sandbox should be true by default for tests");
    t.is(behavior.cleanup, true, "Cleanup should be true by default for tests");

    // Test setters
    behavior.sandboxMode = false;
    t.is(behavior.sandboxMode, false, "sandboxMode should be settable to false");
    behavior.sandBoxMode = true;
    t.is(behavior.sandboxMode, true, "sandBoxMode synonym setter should work");

    behavior.strictSandbox = false;
    t.is(behavior.strictSandbox, false, "strictSandbox should be settable to false");
    behavior.strictSandbox = true;

    behavior.cleanup = false;
    t.is(behavior.cleanup, false, "cleanup should be settable to false");
    behavior.cleanup = true;
  });

  unit.section("sandbox service behavior", t => {
    const behavior = ScriptApp.__behavior;
    const services = ['DocumentApp', 'DriveApp', 'SheetsApp', 'SlidesApp'];

    // Check that sandBoxService exists and has the right services
    t.truthy(behavior.sandBoxService, "sandBoxService should exist");
    services.forEach(serviceName => {
      t.truthy(behavior.sandBoxService[serviceName], `Service ${serviceName} should exist in sandBoxService`);
    });

    // Test a single service (DriveApp)
    const driveService = behavior.sandBoxService.DriveApp;

    // Test defaults and fallbacks
    // Set global properties to known values
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    behavior.cleanup = true;

    // Clear any previous state on the service to test fallbacks
    driveService.clear();

    t.is(driveService.enabled, true, "Service should be enabled by default");
    t.is(driveService.sandboxMode, behavior.sandboxMode, "Service sandboxMode should fall back to global");
    t.is(driveService.sandboxStrict, behavior.strictSandbox, "Service sandboxStrict should fall back to global");
    t.is(driveService.cleanup, behavior.cleanup, "Service cleanup should fall back to global");
    t.is(driveService.methods, null, "Service methods should be null by default");
    t.is(driveService.ids, null, "Service ids should be null by default");

    // Test setters and getters for overriding global behavior
    driveService.enabled = false;
    t.is(driveService.enabled, false, "Service enabled should be settable to false");

    driveService.sandboxMode = false;
    t.is(driveService.sandboxMode, false, "Service sandboxMode should override global");

    driveService.sandboxStrict = false;
    t.is(driveService.sandboxStrict, false, "Service sandboxStrict should override global");

    driveService.cleanup = false;
    t.is(driveService.cleanup, false, "Service cleanup should override global");

    const testMethods = ['createFile', 'getFileById'];
    driveService.methods = testMethods;
    t.deepEqual(driveService.methods, testMethods, "Service methods should be settable");

    const testIds = ['id1', 'id2'];
    driveService.ids = testIds;
    t.deepEqual(driveService.ids, testIds, "Service ids should be settable");

    // Test clear()
    driveService.clear();
    t.is(driveService.enabled, true, "After clear, enabled should revert to default");
    t.is(driveService.sandboxMode, behavior.sandboxMode, "After clear, sandboxMode should fall back to global");
    t.is(driveService.methods, null, "After clear, methods should be null");
    t.is(driveService.ids, null, "After clear, ids should be null");

    // Test argument validation
    // -- turns out this was not a bug, so updating tests
    let err = t.threw(() => { driveService.enabled = 'not a boolean' });
    t.rxMatch(err.message, /DriveApp expected boolean but got not a boolean/, "Setting enabled to non-boolean should throw with correct message");

    err = t.threw(() => { driveService.methods = 'not an array' });
    t.rxMatch(err.message, /DriveApp expected array but got not an array/, "Setting methods to non-array should throw with correct message");

    err = t.threw(() => { driveService.ids = {} });
    t.rxMatch(err.message, /DriveApp expected array but got \[object Object\]/, "Setting ids to non-array should throw with correct message");
    if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  });

  unit.section("DriveApp sandbox restrictions", t => {
    const behavior = ScriptApp.__behavior;
    const driveService = behavior.sandBoxService.DriveApp;

    // Store initial state to restore at the end
    const initial = {
      sandboxMode: behavior.sandboxMode,
      strictSandbox: behavior.strictSandbox
    };

    // --- Test 1: File created in session should be accessible ---
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    driveService.clear(); // Ensure no leftover settings

    const newFile = DriveApp.createFile('sandbox-session-file.txt', 'content');
    toTrash.push(newFile);

    // This should succeed because the file was created in this session
    t.truthy(DriveApp.getFileById(newFile.getId()), "File created in session should be accessible in strict mode");

    // --- Test 2: Strict mode should deny access to external files ---
    let err = t.threw(() => DriveApp.getFileById(fixes.TEXT_FILE_ID));
    t.rxMatch(err.message, /Access to file ".*" is denied by sandbox rules./, "Strict mode should deny access to external files");

    // --- Test 3: Non-strict mode with an 'ids' whitelist ---
    behavior.strictSandbox = false;
    driveService.ids = [fixes.TEXT_FILE_ID];
    t.truthy(DriveApp.getFileById(fixes.TEXT_FILE_ID), "Non-strict with ID whitelist should allow access to whitelisted file");

    // --- Test 4: Non-strict mode should deny non-whitelisted files ---
    err = t.threw(() => DriveApp.getFileById(fixes.PDF_ID));
    t.rxMatch(err.message, /Access to file ".*" is denied by sandbox rules./, "Non-strict with ID whitelist should deny access to non-whitelisted file");

    // --- Cleanup ---
    driveService.clear();
    behavior.sandboxMode = initial.sandboxMode;
    behavior.strictSandbox = initial.strictSandbox;

  });

  unit.section("SpreadsheetApp sandbox restrictions", t => {
    const behavior = ScriptApp.__behavior;
    const sheetsService = behavior.sandBoxService.SheetsApp;

    // Store initial state to restore at the end
    const initial = {
      sandboxMode: behavior.sandboxMode,
      strictSandbox: behavior.strictSandbox
    };

    // --- Test 1: 'enabled' property ---
    sheetsService.enabled = false;
    let err = t.threw(() => SpreadsheetApp.create("disabled-test"));
    t.rxMatch(err.message, /SpreadsheetApp service is disabled by sandbox settings./, "Should throw when service is disabled");

    sheetsService.enabled = true;
    const ssEnabled = SpreadsheetApp.create("enabled-test");
    toTrash.push(DriveApp.getFileById(ssEnabled.getId()));
    t.truthy(ssEnabled);
    t.truthy(ssEnabled, "Should succeed when service is enabled");

    // --- Test 2: 'methods' property ---
    sheetsService.methods = ['create'];
    const ssMethods = SpreadsheetApp.create("methods-test");
    toTrash.push(DriveApp.getFileById(ssMethods.getId()));
    t.truthy(ssMethods, "Should allow whitelisted method 'create'");

    err = t.threw(() => SpreadsheetApp.openById(fixes.TEST_SHEET_ID));
    t.rxMatch(err.message, /Method SpreadsheetApp.openById is not allowed by sandbox settings./, "Should throw for non-whitelisted method 'openById'");

    // --- Test 3: 'ids' property ---
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    sheetsService.clear(); // ensure no lingering 'ids' setting
    err = t.threw(() => SpreadsheetApp.openById(fixes.TEST_SHEET_ID));
    t.rxMatch(err.message, /Access to spreadsheet ".*" is denied by sandbox rules./, "Strict mode should deny access to external files");

    // --- Cleanup ---
    sheetsService.clear();
    behavior.sandboxMode = initial.sandboxMode;
    behavior.strictSandbox = initial.strictSandbox;
    if (SpreadsheetApp.isFake) {
      console.log(
        "...cumulative sheets cache performance",
        getSheetsPerformance()
      );
    }
  });

  unit.section("DocumentApp sandbox restrictions", t => {
    const behavior = ScriptApp.__behavior;
    const docService = behavior.sandBoxService.DocumentApp;

    // --- Create a temporary "external" document for testing ---
    // Turn off sandbox to create a file that is not "known" to the session
    // once we turn sandbox back on.
    const sbMode = behavior.sandboxMode;
    behavior.sandboxMode = false;
    const externalDoc = DocumentApp.create("sandbox-external-test-doc");
    const externalDocId = externalDoc.getId();
    // Turn sandbox back on for the tests
    behavior.sandboxMode = sbMode;

    // Store initial state to restore at the end
    const initial = {
      sandboxMode: behavior.sandboxMode,
      strictSandbox: behavior.strictSandbox
    };

    // --- Test 1: 'enabled' property ---
    docService.enabled = false;
    let err = t.threw(() => DocumentApp.create("disabled-test-doc"));
    t.rxMatch(err.message, /DocumentApp service is disabled by sandbox settings./, "Should throw when service is disabled");

    docService.enabled = true;
    const docEnabled = DocumentApp.create("enabled-test-doc");
    toTrash.push(DriveApp.getFileById(docEnabled.getId()));
    t.truthy(docEnabled, "Should succeed when service is enabled");

    // --- Test 2: 'methods' property ---
    docService.methods = ['create'];
    const docMethods = DocumentApp.create("methods-test-doc");
    toTrash.push(DriveApp.getFileById(docMethods.getId()));
    t.truthy(docMethods, "Should allow whitelisted method 'create'");

    err = t.threw(() => DocumentApp.openById(externalDocId));
    t.rxMatch(err.message, /Method DocumentApp.openById is not allowed by sandbox settings./, "Should throw for non-whitelisted method 'openById'");

    // --- Test 3: 'ids' property ---
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    docService.clear(); // ensure no lingering 'ids' setting
    err = t.threw(() => DocumentApp.openById(externalDocId));
    t.rxMatch(err.message, /Access to document ".*" is denied by sandbox rules./, "Strict mode should deny access to external files");

    // --- Cleanup ---
    docService.clear();
    behavior.sandboxMode = initial.sandboxMode;
    behavior.strictSandbox = initial.strictSandbox;

    // Manually trash the external doc since it wasn't created in sandbox mode
    behavior.sandboxMode = false;
    DriveApp.getFileById(externalDocId).setTrashed(true);
    behavior.sandboxMode = initial.sandboxMode; // restore
  });

  unit.section("SlidesApp sandbox restrictions", t => {
    const behavior = ScriptApp.__behavior;
    const slidesService = behavior.sandBoxService.SlidesApp;

    // --- Create a temporary "external" presentation for testing ---
    const sbMode = behavior.sandboxMode;
    behavior.sandboxMode = false;
    const externalPres = SlidesApp.create("sandbox-external-test-pres");
    const externalPresId = externalPres.getId();
    behavior.sandboxMode = sbMode;

    // Store initial state to restore at the end
    const initial = {
      sandboxMode: behavior.sandboxMode,
      strictSandbox: behavior.strictSandbox
    };

    // --- Test 1: 'enabled' property ---
    slidesService.enabled = false;
    let err = t.threw(() => SlidesApp.create("disabled-test-pres"));
    t.rxMatch(err.message, /SlidesApp service is disabled by sandbox settings./, "Should throw when service is disabled");

    slidesService.enabled = true;
    const presEnabled = SlidesApp.create("enabled-test-pres");
    toTrash.push(DriveApp.getFileById(presEnabled.getId()));
    t.truthy(presEnabled, "Should succeed when service is enabled");

    // --- Test 2: 'methods' property ---
    slidesService.methods = ['create'];
    const presMethods = SlidesApp.create("methods-test-pres");
    toTrash.push(DriveApp.getFileById(presMethods.getId()));
    t.truthy(presMethods, "Should allow whitelisted method 'create'");

    err = t.threw(() => SlidesApp.openById(externalPresId));
    t.rxMatch(err.message, /Method SlidesApp.openById is not allowed by sandbox settings./, "Should throw for non-whitelisted method 'openById'");

    // --- Test 3: 'ids' property ---
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    slidesService.clear(); // ensure no lingering 'ids' setting
    err = t.threw(() => SlidesApp.openById(externalPresId));
    t.rxMatch(err.message, /Access to presentation ".*" is denied by sandbox rules./, "Strict mode should deny access to external files");

    // --- Cleanup ---
    slidesService.clear();
    behavior.sandboxMode = initial.sandboxMode;
    behavior.strictSandbox = initial.strictSandbox;
    behavior.sandboxMode = false;
    DriveApp.getFileById(externalPresId).setTrashed(true);
    behavior.sandboxMode = initial.sandboxMode; // restore
  });

  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testSandbox();
  ScriptApp.__behavior.trash()
  if (Drive.isFake) console.log('...cumulative drive cache performance', getDrivePerformance())
  if (SpreadsheetApp.isFake) {
    console.log(
      "...cumulative sheets cache performance",
      getSheetsPerformance()
    );
  }
}
