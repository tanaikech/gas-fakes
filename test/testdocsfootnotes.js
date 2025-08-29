import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance, maketdoc, getChildren } from './testassist.js';

export const testDocsFootnotes = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("Document.appendFootnote and getFootnotes", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    // 1. Test on a new doc
    t.is(doc.getFootnotes().length, 0, "New document should have no footnotes");

    // 2. Append a footnote
    const footnoteText = "This is the first footnote.";
    const fn1 = body.appendFootnote(footnoteText);

    t.is(fn1.toString(), 'Footnote', "appendFootnote should return a Footnote object");
    t.is(fn1.getText(), footnoteText, "Footnote should have the correct text");

    // 3. Verify footnote and reference exist
    const footnotes = doc.getFootnotes();
    t.is(footnotes.length, 1, "Document should now have one footnote");
    t.is(footnotes[0].getText(), footnoteText, "The retrieved footnote should have the correct text");

    // The footnote reference is a paragraph element.
    const bodyChildren = getChildren(body);
    // Body has initial empty para, then the footnote reference.
    t.is(bodyChildren.length, 2, "Body should have 2 children (initial para, footnote ref)");
    const paraWithRef = bodyChildren[1];
    t.is(paraWithRef.getType(), DocumentApp.ElementType.PARAGRAPH, "The element containing the ref should be a Paragraph");
    t.is(paraWithRef.getNumChildren(), 1, "The paragraph should have one child (the footnote ref)");
    const refElement = paraWithRef.getChild(0);
    t.is(refElement.getType(), DocumentApp.ElementType.FOOTNOTE_REFERENCE, "The child element should be a FootnoteReference");

    // 4. Append another footnote
    const fn2 = body.appendFootnote("Second footnote.");
    t.is(doc.getFootnotes().length, 2, "Document should have two footnotes after second append");
    t.is(doc.getFootnote(fn1.getId()).getText(), footnoteText, "Can retrieve first footnote by ID");
    t.is(doc.getFootnote(fn2.getId()).getText(), "Second footnote.", "Can retrieve second footnote by ID");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Footnote methods", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const fn = body.appendFootnote("Initial text.");

    // Test getFootnoteContents()
    const contents = fn.getFootnoteContents();
    t.is(contents.toString(), 'Footnote', "getFootnoteContents should return the footnote itself (as a container)");
    t.is(contents.getText(), "Initial text.", "Contents should have the correct text");

    // Test editing methods
    contents.clear();
    t.is(fn.getText(), "", "clear() should remove content");

    fn.setText("New text.");
    t.is(fn.getText(), "New text.", "setText() should set the content");

    const p1 = fn.appendParagraph("A new paragraph.");
    t.is(fn.getText(), "New text.\nA new paragraph.", "appendParagraph should add text");
    t.is(p1.getParent().toString(), 'Footnote', "Paragraph parent should be the footnote");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsFootnotes();
  ScriptApp.__behavior.trash();
  console.log('...cumulative docs cache performance', getDocsPerformance());
}
