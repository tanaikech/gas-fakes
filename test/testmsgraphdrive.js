import '@mcpher/gas-fakes'
import { initTests } from './testinit.js'
import { wrapupTest, trasher } from './testassist.js'
import is from '@sindresorhus/is'

export const testMsGraphDrive = (pack) => {
  
  // Set platform explicitly to Microsoft Graph
  if (ScriptApp.isFake) {
    ScriptApp.__platform = 'msgraph'
  }

  const { unit, fixes: originalFixes } = pack || initTests()

  // Only run this test in fake mode
  if (!ScriptApp.isFake) {
    console.log('...skipping MS Graph Drive tests as not in fake mode')
    return { unit, fixes: originalFixes }
  }

  const toTrash = []

  unit.section('MS Graph Identity', t => {
    const user = Session.getActiveUser();
    console.log(`...running as MS Graph user: ${user.getEmail()}`);
    t.true(user.getEmail().includes('@'), 'Should have a valid email');
  });

  unit.section('OneDrive Basic Operations', t => {
    const root = DriveApp.getRootFolder();
    console.log(`...OneDrive Root: ${root.getName()}`);
    t.true(is.nonEmptyString(root.getId()));

    // Create a folder
    const folderName = `gas-fakes-test-${Date.now()}`;
    const folder = root.createFolder(folderName);
    t.is(folder.getName(), folderName);
    toTrash.push(folder);

    // Create a file in that folder
    const fileName = 'hello-msgraph.txt';
    const content = 'Hello from gas-fakes via MS Graph!';
    const file = folder.createFile(fileName, content);
    t.is(file.getName(), fileName);
    t.is(file.getBlob().getDataAsString(), content);
    
    // Rename
    const newName = 'renamed-msgraph.txt';
    file.setName(newName);
    t.is(file.getName(), newName);

    // List files by name with retry for propagation delay
    // Using getFilesByName is more reliable on OneDrive as it uses $filter
    let files;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      files = folder.getFilesByName(newName);
      if (files.hasNext()) break;
      
      attempts++;
      console.log(`...waiting for propagation of ${newName} (attempt ${attempts}/${maxAttempts})...`);
      Utilities.sleep(2000); 
    }

    t.true(files.hasNext(), `File ${newName} should be found in folder after propagation`);
    if (files.hasNext()) {
      const foundFile = files.next();
      t.is(foundFile.getName(), newName);
      t.is(foundFile.getBlob().getDataAsString(), content, 'Content should match after propagation');
    }
  });

  unit.section('Switching Platforms', t => {
    // Switch to Google
    ScriptApp.__platform = 'workspace';
    const googleRoot = DriveApp.getRootFolder();
    t.is(googleRoot.getName(), 'My Drive');

    // Switch back to MS Graph
    ScriptApp.__platform = 'msgraph';
    const msRoot = DriveApp.getRootFolder();
    t.not(msRoot.getName(), 'My Drive');
  });

  if (!pack) {
    unit.report()
  }
  
  // Cleanup
  if (originalFixes.CLEAN) {
    unit.section('MS Graph Cleanup', t => {
      trasher(toTrash);
    });
  }

  return { unit, fixes: originalFixes }
}

wrapupTest(testMsGraphDrive);
