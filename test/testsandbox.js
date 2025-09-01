
import "../main.js";
import { initTests } from "./testinit.js";
import { trasher } from "./testassist.js";

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
    const services = ['DriveApp', 'SheetsApp', 'SlidesApp', 'UrlFetchApp', "Drive", "Sheets", "Slides"];

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

}
