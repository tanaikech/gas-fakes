import "../main.js";
import { initTests } from "./testinit.js";
import { getDrivePerformance, getSheetsPerformance } from "./testassist.js";

export const testSandbox = (pack) => {
  const { unit, fixes } = pack || initTests();

  if (!ScriptApp.isFake) {
    console.log("Running in live apps script - skipping sandbox tests");
    return { unit, fixes };
  }

  // Helper to reset sandbox to the default state defined in testinit.js for each section
  const resetSandbox = () => {
    const behavior = ScriptApp.__behavior;
    // Reset global properties to test defaults
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    behavior.cleanup = fixes.CLEAN;
    behavior.idWhitelist = null;

    // Reset per-service properties
    if (behavior.sandboxService) {
      Object.keys(behavior.sandboxService).forEach((serviceName) => {
        const service = behavior.sandboxService[serviceName];
        if (service && service.clear) {
          service.clear();
        }
      });
    }
  };

  unit.section("Sandbox Mode Basics", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // 1. Test strict sandbox mode (default)
    const fileName = fixes.PREFIX + "sandbox-session-file.txt";
    const file = DriveApp.createFile(fileName, "content");

    t.is(
      DriveApp.getFileById(file.getId()).getName(),
      fileName,
      "Should be able to access file created in session"
    );

    const err = t.threw(() => DriveApp.getFileById(fixes.TEXT_FILE_ID));
    t.rxMatch(
      err?.message,
      /Access to file .* is denied by sandbox rules/,
      "Should deny access to external file in strict mode"
    );

    // 2. Test non-strict sandbox mode
    behavior.strictSandbox = false;
    const externalFile = DriveApp.getFileById(fixes.TEXT_FILE_ID);
    t.is(
      externalFile.getId(),
      fixes.TEXT_FILE_ID,
      "Should allow access to external file in non-strict mode"
    );
  });

  unit.section("Sandbox Whitelisting", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // 1. Whitelist a file for reading only (default)
    behavior.idWhitelist = [behavior.newIdWhitelistItem(fixes.TEXT_FILE_ID)];

    const readFile = DriveApp.getFileById(fixes.TEXT_FILE_ID);
    t.is(
      readFile.getName(),
      fixes.TEXT_FILE_NAME,
      "Should be able to read whitelisted file"
    );

    const writeErr = t.threw(() => readFile.setContent("new content"));
    t.rxMatch(
      writeErr?.message,
      /Write access to file .* is denied by sandbox rules/,
      "Should deny write access to read-only whitelisted file"
    );

    // 2. Whitelist a spreadsheet for writing
    const sheetId = fixes.TEST_SHEET_ID;
    behavior.idWhitelist = [
      behavior.newIdWhitelistItem(sheetId).setRead(true).setWrite(true),
    ];

    const ss = SpreadsheetApp.openById(sheetId);
    t.is(ss.getId(), sheetId, "Should be able to open whitelisted spreadsheet");
    const sheet = ss.getSheets()[0];
    sheet.getRange("A1").setValue("sandbox test"); // should not throw
    t.is(
      sheet.getRange("A1").getValue(),
      "sandbox test",
      "Should be able to write to whitelisted spreadsheet"
    );
  });

  unit.section("Per-Service Sandbox Controls", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;

    // 1. Disable a service
    behavior.sandboxService.SlidesApp.enabled = false;
    const err = t.threw(() => SlidesApp.create("wont work"));
    t.rxMatch(
      err?.message,
      /SlidesApp service is disabled by sandbox settings/,
      "Should deny access to disabled service"
    );
    const ss = SpreadsheetApp.create("will work"); // Other services should still work
    t.is(ss.getName(), "will work", "Other services should remain enabled");

    // 2. Method Whitelist
    behavior.sandboxService.DriveApp.methodWhitelist = ["createFolder"];
    const folder = DriveApp.createFolder(fixes.PREFIX + "whitelist-folder");
    t.is(
      folder.getName(),
      fixes.PREFIX + "whitelist-folder",
      "createFolder should be allowed by methodWhitelist"
    );

    const fileErr = t.threw(() => DriveApp.createFile("wont-work.txt", ""));
    t.rxMatch(
      fileErr?.message,
      /Method DriveApp.createFile is not allowed by sandbox settings/,
      "createFile should be denied by methodWhitelist"
    );
  });

  if (!pack) {
    unit.report();
  }

  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testSandbox();
  ScriptApp.__behavior.trash();
  if (Drive.isFake)
    console.log("...cumulative drive cache performance", getDrivePerformance());
  if (SpreadsheetApp.isFake) {
    console.log(
      "...cumulative sheets cache performance",
      getSheetsPerformance()
    );
  }
}