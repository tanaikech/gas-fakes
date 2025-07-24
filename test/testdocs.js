import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance, maketdoc } from './testassist.js';

export const testDocs = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];



  unit.section("DocumentApp create", t => {

    const { doc, docName } = maketdoc(toTrash, fixes )
    t.is(doc.getName(), docName, "Document should have the correct name");
    t.true(is.nonEmptyString(doc.getId()), "Document should have an ID");

    const openedDoc = DocumentApp.openById(doc.getId());
    t.is(openedDoc.getName(), docName, "Opened document should have the correct name");
    t.is(openedDoc.getId(), doc.getId(), "Opened document should have the correct ID");

    const openedByUrl = DocumentApp.openByUrl(doc.getUrl());
    t.is(openedByUrl.getId(), doc.getId(), "Opened by URL should have correct ID");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });

  unit.section("document children", t => {
    const { doc, docName } = maketdoc(toTrash, fixes)

    const body = doc.getBody()
    const bchild = body.getChild(0)
    const bchildIndex = body.getChildIndex(bchild)
    t.is(body.getType(), DocumentApp.ElementType.BODY_SECTION, "body should be a body")
    t.is(body.getNumChildren(), 1, "body should have 1 child")
    t.true(is.object(bchild))
    t.is(bchildIndex, 0)
    t.deepEqual(bchild, body.getChild(bchildIndex), {
      neverUndefined: false
    })
    t.is(bchild.getType(), DocumentApp.ElementType.PARAGRAPH)

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())

  })

  unit.cancel()
  unit.section("Document basic methods", t => {

    const { doc, docName } = maketdoc(toTrash, fixes)

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
    const editorEmails = ["editor2@example.com", "editor3@example.com"];
    const viewerEmails = ["viewer2@example.com", "viewer3@example.com"];

    doc.addEditor(editorEmail).addViewer(viewerEmail);
    t.true(doc.getEditors().map(u => u.getEmail()).includes(editorEmail), "addEditor should add an editor");
    t.true(doc.getViewers().map(u => u.getEmail()).includes(viewerEmail), "addViewer should add a viewer");

    doc.addEditors(editorEmails);
    let currentEditors = doc.getEditors().map(u => u.getEmail());
    t.true(editorEmails.every(e => currentEditors.includes(e)), "addEditors should add multiple editors");

    doc.addViewers(viewerEmails);
    let currentViewers = doc.getViewers().map(u => u.getEmail());
    t.true(viewerEmails.every(v => currentViewers.includes(v)), "addViewers should add multiple viewers");

    doc.removeEditor(editorEmail).removeViewer(viewerEmail);
    editorEmails.forEach(e => doc.removeEditor(e));
    viewerEmails.forEach(v => doc.removeViewer(v));
    t.false(doc.getEditors().map(u => u.getEmail()).includes(editorEmail), "removeEditor should remove an editor");
    t.false(doc.getViewers().map(u => u.getEmail()).includes(viewerEmail), "removeViewer should remove a viewer");
    t.is(doc.getEditors().length, 1, "all editors should be removed except owner");
    t.is(doc.getViewers().length, 1, "all viewers should be removed except owner, who is also a viewer");

    t.is(doc.toString(), 'Document', "toString should return 'Document'");
    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });




  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocs();
  console.log('...cumulative docs cache performance', getDocsPerformance())
}
