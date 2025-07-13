import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { trasher } from './testassist.js';

export const testDocs = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("DocumentApp create", t => {
    const docName = fixes.PREFIX + "created-doc";
    const doc = DocumentApp.create(docName);

    t.is(doc.getName(), docName, "Document should have the correct name");
    t.true(is.nonEmptyString(doc.getId()), "Document should have an ID");

    const openedDoc = DocumentApp.openById(doc.getId());
    t.is(openedDoc.getName(), docName, "Opened document should have the correct name");
    t.is(openedDoc.getId(), doc.getId(), "Opened document should have the correct ID");

    const openedByUrl = DocumentApp.openByUrl(doc.getUrl());
    t.is(openedByUrl.getId(), doc.getId(), "Opened by URL should have correct ID");

    if (fixes.CLEAN) {
      toTrash.push(DriveApp.getFileById(doc.getId()));
    }
  });
  unit.section("Document methods", t => {
    const docName = fixes.PREFIX + "doc-methods";
    const doc = DocumentApp.create(docName);
    toTrash.push(DriveApp.getFileById(doc.getId()));

    // test setName
    const newDocName = docName + "-renamed";
    doc.setName(newDocName);
    t.is(doc.getName(), newDocName, "setName should update the document name");
    const openedDoc = DocumentApp.openById(doc.getId());
    t.is(openedDoc.getName(), newDocName, "setName should be persistent");

    // test getBody
    const body = doc.getBody();
    // the fake returns 'Body' but the real GAS returns 'DocumentBodySection'
    const expectedBodyString = ScriptApp.isFake ? 'Body' : 'DocumentBodySection';
    t.is(body.toString(), expectedBodyString, "getBody should return a Body object");

    // test getOwner
    // Document doesn't have getOwner(), but the underlying file does
    const owner = DriveApp.getFileById(doc.getId()).getOwner();
    t.is(owner.getEmail(), fixes.EMAIL, "getOwner should return the correct user");

    // test permissions
    const editorEmail = "editor@example.com";
    const viewerEmail = "viewer@example.com";

    doc.addEditor(editorEmail).addViewer(viewerEmail);
    t.true(doc.getEditors().map(u => u.getEmail()).includes(editorEmail), "addEditor should add an editor");
    t.true(doc.getViewers().map(u => u.getEmail()).includes(viewerEmail), "addViewer should add a viewer");

    doc.removeEditor(editorEmail).removeViewer(viewerEmail);
    t.false(doc.getEditors().map(u => u.getEmail()).includes(editorEmail), "removeEditor should remove an editor");
    t.false(doc.getViewers().map(u => u.getEmail()).includes(viewerEmail), "removeViewer should remove a viewer");

    t.is(doc.toString(), 'Document', "toString should return 'Document'");
  });
  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocs();
}