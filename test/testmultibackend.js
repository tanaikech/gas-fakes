/**
 * Test multi-backend switching and data transfer
 */
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, checkBackend, createTrashCollector } from './testassist.js';
import is from '@sindresorhus/is';

export const testMultiBackend = (pack) => {
  

  if (!checkBackend('google') || !checkBackend('ksuite') || !checkBackend('msgraph')) return pack
  ScriptApp.__platformAuth = ['google', 'ksuite', 'msgraph'];

  const { unit, fixes } = pack || initTests();
  const toTrash = createTrashCollector();

  // sandbox check
  const behavior = ScriptApp.__behavior;
  if (behavior) {
    behavior.sandboxMode = false; // Disable sandbox for discovery
  }

  unit.section('Google to KSuite data transfer', t => {
    // Start with Google
    ScriptApp.__platform = 'google';
    const gRoot = DriveApp.getRootFolder();
    
    t.is(gRoot.toString(), "My Drive", "Should start in Google Drive");
    const content = "Hello from Google Drive! Time: " + Date.now();
    const gFile = DriveApp.createFile("transfer-test-google.txt", content);
    toTrash.push(gFile);
    
    t.is(gFile.getBlob().getDataAsString(), content, "File created in Google correctly");
    const gId = gFile.getId();

    // Switch to KSuite
    ScriptApp.__platform = 'ksuite';
    const kRoot = DriveApp.getRootFolder();
    // In our implementation, KSuite root is "Private"
    t.is(kRoot.toString(), "Private", "Should have switched to KSuite (Infomaniak)");

    // Create file in KSuite with content from Google
    const kFile = DriveApp.createFile("transferred-from-google.txt", content);
    toTrash.push(kFile);

    t.is(kFile.getBlob().getDataAsString(), content, "Content transferred to KSuite correctly");
    t.not(kFile.getId(), gId, "File IDs should be different across platforms");
    
    const kId = kFile.getId();

    // Switch back to Google
    ScriptApp.__platform = 'google';
    t.is(DriveApp.getRootFolder().toString(), "My Drive", "Should be back in Google Drive");

    // Create a "receipt" in Google referencing the KSuite file
    const receiptContent = `Successfully transferred content to KSuite.
KSuite File ID: ${kId}
Source Google ID: ${gId}`;
    const receiptFile = DriveApp.createFile("transfer-receipt.txt", receiptContent);
    toTrash.push(receiptFile);

    t.true(receiptFile.getBlob().getDataAsString().includes(kId), "Receipt should contain KSuite ID");
  });

  unit.section('MS Graph to KSuite data transfer', t => {
    // Switch to MS Graph
    ScriptApp.__platform = 'msgraph';
    const msRoot = DriveApp.getRootFolder();
    t.is(msRoot.getName(), "root", "Should be in MS Graph (OneDrive)");

    const content = "Hello from MS Graph! Time: " + Date.now();
    const msFile = DriveApp.createFile("transfer-test-msgraph.txt", content);
    toTrash.push(msFile);
    const msId = msFile.getId();

    // Switch to KSuite
    ScriptApp.__platform = 'ksuite';
    const kFile = DriveApp.createFile("transferred-from-msgraph.txt", content);
    toTrash.push(kFile);
    const kId = kFile.getId();

    t.is(kFile.getBlob().getDataAsString(), content, "Content transferred from MS Graph to KSuite correctly");
    t.not(kId, msId, "File IDs should be different across platforms");
  });

  unit.section('Advanced Drive cross-platform check', t => {
    // Advanced Drive 'Drive' also follows ScriptApp.__platform
    
    // Check Google
    ScriptApp.__platform = 'google';
    const gFiles = Drive.Files.list({pageSize: 1});
    t.true(Array.isArray(gFiles.files), "Should be able to list Google files via Advanced service");

    // Check KSuite
    ScriptApp.__platform = 'ksuite';
    const kFiles = Drive.Files.list({pageSize: 1});
    t.true(Array.isArray(kFiles.files), "Should be able to list KSuite files via Advanced service");

    // Check MS Graph
    ScriptApp.__platform = 'msgraph';
    const msFiles = Drive.Files.list({pageSize: 1});
    t.true(Array.isArray(msFiles.files), "Should be able to list MS Graph files via Advanced service");
  });

  if (!pack) {
    unit.report();
  }

  // Cleanup
  unit.section('Multi-backend Cleanup', t => {
    trasher(toTrash);
  });

  return { unit, fixes };
}

// Support running as a standalone test
wrapupTest(testMultiBackend);

