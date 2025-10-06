import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import {
  wrapupTest,
  getDocsPerformance, maketdoc, trasher

} from './testassist.js';

;
export const testDocs = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


  unit.section("Document level append/insert methods", t => {
    const { doc } = maketdoc(toTrash, fixes);

    // Test appendParagraph
    const p1 = doc.appendParagraph("p1");
    t.is(p1.getType(), DocumentApp.ElementType.PARAGRAPH, "doc.appendParagraph should return a Paragraph");
    t.is(doc.getBody().getText(), "\np1", "doc.appendParagraph should add the paragraph");

    // Test insertParagraph
    const p0 = doc.appendParagraph("p0").copy();
    doc.insertParagraph(1, p0); // after the initial empty paragraph
    t.is(doc.getBody().getText(), "\np0\np1\np0", "doc.insertParagraph should insert the paragraph");

    // Test appendListItem
    const li1 = doc.appendListItem("li1");
    t.is(li1.getType(), DocumentApp.ElementType.LIST_ITEM, "doc.appendListItem should return a ListItem");
    const children1 = doc.getBody().getNumChildren();
    t.is(doc.getBody().getChild(children1 - 1).getType(), DocumentApp.ElementType.LIST_ITEM, "doc.appendListItem should add a list item to the body");

    // Test insertListItem
    const li0 = doc.appendListItem("li0").copy();
    doc.insertListItem(1, li0);
    t.is(doc.getBody().getChild(1).getType(), DocumentApp.ElementType.LIST_ITEM, "doc.insertListItem should insert a list item");
    t.is(doc.getBody().getChild(1).getText(), "li0", "doc.insertListItem should have correct text");

    // Test appendTable
    const table1 = doc.appendTable([['t1c1', 't1c2']]);
    t.is(table1.getType(), DocumentApp.ElementType.TABLE, "doc.appendTable should return a Table");
    t.is(table1.getCell(0, 0).getText(), "t1c1", "doc.appendTable should create table with correct content");
    // Appending a table in Apps Script automatically adds an empty paragraph after it.
    // Therefore, the table is the second-to-last child.
    const numChildren = doc.getBody().getNumChildren();
    t.is(doc.getBody().getChild(numChildren - 2).getType(), DocumentApp.ElementType.TABLE, "doc.appendTable should add a table to the body");
    t.is(doc.getBody().getChild(numChildren - 1).getType(), DocumentApp.ElementType.PARAGRAPH, "doc.appendTable should be followed by a paragraph");

    // Test insertTable
    const table0 = doc.appendTable([['t0c1']]).copy();
    doc.insertTable(1, table0);
    const insertedTable = doc.getBody().getChild(1);
    t.is(insertedTable.getType(), DocumentApp.ElementType.TABLE, "doc.insertTable should insert a Table");
    t.is(insertedTable.getCell(0, 0).getText(), "t0c1", "doc.insertTable should have correct content");

    // Test appendPageBreak & insertPageBreak are delegated, which is covered by Body tests.
    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("DocumentApp create", t => {

    const { doc, docName } = maketdoc(toTrash, fixes)
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
    t.is(bchild.getType(), DocumentApp.ElementType.PARAGRAPH)

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())

  })


  unit.section("Document basic methods", t => {

    const { doc, docName } = maketdoc(toTrash, fixes)

    // test setName
    const newDocName = docName + "-renamed";
    doc.setName(newDocName);
    // There can be a delay in the name change being reflected in both apps script and fake environments.
    Utilities.sleep(1000); // wait for the name change to propagate
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
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocs);
