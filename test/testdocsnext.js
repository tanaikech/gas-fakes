import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance, maketdoc } from './testassist.js';

export const testDocsNext = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  const getChildren = (body) => {
    const children = [];
    for (let i = 0; i < body.getNumChildren(); i++) {
      children.push(body.getChild(i));
    }
    return children;
  }

  unit.section("Body.appendParagraph method", t => {

    const { doc, docName } = maketdoc(toTrash, fixes)
    const body = doc.getBody();

    // On a new doc, the body is empty.
    t.is(body.getText(), "", "New document body should be empty.");

    // Test 1: Appending a string.
    const p1Text = "This is the first paragraph.";
    const p1 = body.appendParagraph(p1Text);

    const expectedText1 = "\n" + p1Text;
    t.is(body.getText(), expectedText1, "Body text after first append (string)");
    t.is(p1.getText(), p1Text, "Returned paragraph object should have correct text");
    t.is(p1.toString(), 'Paragraph', 'appendParagraph(string) should return a Paragraph object');

    // Test 2: Appending a Paragraph object (the overload).

    // In Apps Script, you cannot append an element that is already part of the document.
    // You must create a detached copy of it first.
    body.appendParagraph(p1.copy());
    const expectedText2 = expectedText1 + "\n" + p1Text;
    t.is(body.getText(), expectedText2, "Body text after second append (Paragraph object)");

    // Test 3: Ensure that attempting to append an already attached paragraph throws an error
    const attemptAttachedAppend = () => {
      body.appendParagraph(p1);
    };


    t.rxMatch(t.threw(attemptAttachedAppend)?.message || 'no error thrown',
      /Element must be detached/,
      "Appending an already attached paragraph should throw an \"Element must be detached\" error"
    )
    // Test 4: Ensure that the fake throws the correct exception.
    const attemptAttachedAppend2 = () => {
      body.appendParagraph(p1);
    };

    t.rxMatch(t.threw(attemptAttachedAppend2)?.message || 'no error thrown',
      /Element must be detached/,
      "Appending an already attached paragraph should throw an \"Element must be detached\" error"
    )


    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Document empty document validation", t => {
    const { doc, docName } = maketdoc(toTrash, fixes)

    // an empty doc
    const body = doc.getBody();
    t.is(doc.getName(), docName, "Document should have the correct name")

    // even though it actually has 2, See issue https://issuetracker.google.com/issues/432432968
    t.is(body.getNumChildren(), 1, "an empty docs should have 1 child")

    const adoc = Docs.Documents.get(doc.getId());
    t.is(adoc.body.content.length, 2, "in reality - an empty doc has 2 children")

    // document app will skip the section break
    const children = getChildren(body);
    t.is(children.length, 1, "an empty docs should have 1 child")

    // only a paragraph in a blank document
    const paragraph = children[0];
    t.is(paragraph.getType(), DocumentApp.ElementType.PARAGRAPH, 'paragraph should be a paragraph')
    t.is(paragraph.getText(), '', 'paragraph should be empty')

    // append a paragraph
    const pt = "p1"
    const p1 = body.appendParagraph(pt);
    const c2 = getChildren(body);
    t.is(c2.length, 2, "added a para - now there should be 2")
    const p1c = c2[1];
    t.is(p1c.getText(), p1.getText())
    t.is(p1c.getText(), pt)
    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  })


  unit.section("newRange and builders", t => {

    const { doc } = maketdoc(toTrash, fixes)
    const rangeBuilder = doc.newRange();
    t.is(rangeBuilder.toString(), 'RangeBuilder', 'newRange should return a RangeBuilder');

    // Test with no elements
    const emptyRange = rangeBuilder.build();
    t.is(emptyRange.toString(), 'Range', 'build() on empty builder returns a Range');
    t.is(emptyRange.getRangeElements().length, 0, 'empty range has 0 range elements');

    // Create some elements to add to the range using the public API
    const body = doc.getBody();
    const el1 = body.appendParagraph("p1");
    const el2 = body.appendParagraph("p2");
    const el3 = body.appendParagraph("p3");

    // Test addElement, chaining, and build
    rangeBuilder.addElement(el1).addElement(el2);
    const builtRange = rangeBuilder.build();
    t.is(builtRange.getRangeElements().length, 2, 'built range should have 2 range elements');
    t.deepEqual(builtRange.getRangeElements().map(re => re.getElement().getText()), ["p1", "p2"], 'getText() should return correct text for elements in order');

    // Test addRange
    const anotherRange = doc.newRange().addElement(el3).build();
    rangeBuilder.addRange(anotherRange);
    const finalRange = rangeBuilder.build();
    t.is(finalRange.getRangeElements().length, 3, 'addRange should add elements from another range');
    t.deepEqual(finalRange.getRangeElements().map(re => re.getElement().getText()), ["p1", "p2", "p3"], 'final range should contain all elements');
    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });
  // Helper to extract text from a raw Docs API document resource, mimicking Document.getBody().getText()
  const getTextFromDocResource = (docResource) => {
    return docResource?.body?.content?.map(structuralElement => structuralElement.paragraph?.elements?.map(element => element.textRun?.content || '').join('') || '').join('').replace(/\n$/, '');
  }
  unit.section("Document.clear method", t => {

    const { doc, docName } = maketdoc(toTrash, fixes)

    // Use the advanced service to insert text, making the test independent of appendParagraph implementation.
    const text = 'Hello World.\nThis is the second line.'
    const requests = [{
      insertText: {
        location: { index: 1 }, // Insert at the beginning of the body
        text
      }
    }];
    Docs.Documents.batchUpdate({ requests }, doc.getId());

    // this is required on live apps script, because we've already opened this document with DocumentApp
    // and it is unaware of things that happen via advanced services
    doc.saveAndClose();

    // Re-fetch the document using the advanced Docs service to ensure the changes are applied.
    const fetchedDoc = Docs.Documents.get(doc.getId());
    t.is(getTextFromDocResource(fetchedDoc), text, 'checking that adv applied the change')

    // Re-fetch the DocumentApp object to ensure its internal __doc is updated.
    const updatedDoc = DocumentApp.openById(doc.getId());
    t.is(updatedDoc.getBody().getText(), text, "Content should be present before clearing.");

    // Test the clear() method
    updatedDoc.clear();
    t.is(updatedDoc.getBody().getText(), "", "Content should be empty after calling clear().");

    // Test that appendParagraph works after clearing
    const text2 = "A new paragraph."
    updatedDoc.getBody().appendParagraph(text2);

    const text3 = "\n" + text2;
    t.is(updatedDoc.getBody().getText(), text3, "Appending a paragraph after clearing should work.")

    // Re-fetch the document to ensure its internal __doc is updated.
    const updatedDoc2 = DocumentApp.openById(updatedDoc.getId());
    t.is(updatedDoc2.getBody().getText(), text3, "Content should be present after appending.");

    // Test that appendParagraph works after clearing
    updatedDoc.getBody().appendParagraph("A new paragraph2.");
    updatedDoc.clear();
    t.is(updatedDoc.getBody().getText(), "", "Clearing after appending should work.");

    // Test clearing an already-cleared document
    updatedDoc.clear(); // Should not throw an error
    t.is(updatedDoc.getBody().getText(), "", "Content should remain empty after clearing again.");

    // Test clearing a brand new, empty document
    const newDoc = DocumentApp.create(fixes.PREFIX + "new-clear-doc");
    toTrash.push(DriveApp.getFileById(newDoc.getId()));
    t.is(newDoc.getBody().getText(), "", "A new document body should be empty.");
    newDoc.clear(); // Should not throw an error
    t.is(newDoc.getBody().getText(), "", "Clearing a new document should result in an empty body.");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });



  unit.section("Document tabs", t => {

    const { doc, docName } = maketdoc(toTrash, fixes)


    const tabs = doc.getTabs();
    t.true(is.array(tabs), 'getTabs() should return an array');
    t.is(tabs.length, 1, 'A new document should have one default tab');
    const tab = tabs[0];

    t.is(tab.toString(), 'Tab', 'Tab object should have correct string representation');

    t.is(tab.getIndex(), 0, 'Default tab should have index 0');
    t.is(tab.getType().toString(), 'DOCUMENT_TAB', 'Tab type should be DOCUMENT');


    t.is(tab.getChildTabs().length, 0, 'getChildTabs should return an empty array');

    const docTab = tab.asDocumentTab();
    t.is(docTab.getBody().getText(), doc.getBody().getText(), 'getBody() on DocumentTab should return a valid body object');

    // Test getTab()
    const foundTab = doc.getTab(tab.getId());
    t.truthy(foundTab, 'getTab() should find a tab by its ID');
    t.is(foundTab.getId(), tab.getId(), 'Found tab should have the same ID as the one from getTabs()');
    const notFoundTab = doc.getTab('a-non-existent-id');
    t.is(notFoundTab, null, 'getTab() with a non-existent ID should return null');


    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });








  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsNext();
  console.log('...cumulative docs cache performance', getDocsPerformance())
}
