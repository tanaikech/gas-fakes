
import '@mcpher/gas-fakes'
import { wrapupTest } from './testassist.js';
import is from '@sindresorhus/is';
import { initTests } from './testinit.js'

export const testDriveNew = (pack) => {
  const toTrash = []
  const { unit, fixes } = pack || initTests()

  unit.section('DriveApp new methods: storage and trashed', t => {
    const limit = DriveApp.getStorageLimit()
    const used = DriveApp.getStorageUsed()
    t.true(is.number(limit))
    t.true(is.number(used))
    t.true(limit >= used)

    const trashedFiles = DriveApp.getTrashedFiles()
    t.true(Reflect.has(trashedFiles, 'hasNext'))
    
    const trashedFolders = DriveApp.getTrashedFolders()
    t.true(Reflect.has(trashedFolders, 'hasNext'))
  })

  unit.section('DriveApp new methods: shortcut', t => {
    const root = DriveApp.getRootFolder()
    const file = DriveApp.createFile('target-for-shortcut.txt', 'target content')
    toTrash.push(file)

    const shortcut = root.createShortcut(file.getId())
    t.is(shortcut.getName(), file.getName())
    t.is(shortcut.getMimeType(), 'application/vnd.google-apps.shortcut')
    t.is(shortcut.getTargetId(), file.getId())
    toTrash.push(shortcut)

    const folder = DriveApp.createFolder('folder-for-shortcut')
    toTrash.push(folder)
    const folderShortcut = DriveApp.createShortcut(folder.getId())
    t.is(folderShortcut.getName(), folder.getName())
    t.is(folderShortcut.getTargetId(), folder.getId())
    toTrash.push(folderShortcut)
  })

  unit.section('DriveApp new methods: continuation tokens', t => {
    const it = DriveApp.getFiles()
    if (it.hasNext()) {
      it.next()
      const token = it.getContinuationToken()
      t.true(is.nonEmptyString(token))

      const it2 = DriveApp.continueFileIterator(token)
      t.true(Reflect.has(it2, 'hasNext'))
      // We can't easily verify the exact next item without knowing the order, 
      // but we can check it works
    }
  })

  unit.section('File new methods: commenters', t => {
    const file = DriveApp.createFile('perm-test.txt', 'content')
    toTrash.push(file)

    const commenterEmail = fixes.SCRATCH_VIEWER
    file.addCommenter(commenterEmail)
    
    // Check if commenter is added. Viewers often include commenters in GAS
    const viewers = file.getViewers().map(u => u.getEmail())
    t.true(viewers.includes(commenterEmail))

    file.removeCommenter(commenterEmail)
    const viewersAfter = file.getViewers().map(u => u.getEmail())
    t.false(viewersAfter.includes(commenterEmail))
  })

  unit.section('File new methods: getAs', t => {
    // For reliable PDF conversion on Live GAS, we use a Google Doc
    const doc = DocumentApp.create('getAs-test-doc')
    doc.getBody().appendParagraph('some content')
    doc.saveAndClose()
    
    const file = DriveApp.getFileById(doc.getId())
    toTrash.push(file)
    
    // Test conversion - this is natively supported for Docs on both platforms
    const blob = file.getAs('application/pdf')
    t.is(blob.getContentType(), 'application/pdf', "Blob content type should be application/pdf")
    t.true(blob.getBytes().length > 0, "Blob should have content")
  })

  if (!pack) {
    unit.report()
  }
  return { unit, fixes }
}

wrapupTest(testDriveNew);
