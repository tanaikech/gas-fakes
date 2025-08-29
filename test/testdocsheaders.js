
import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance, maketdoc, docReport } from './testassist.js';

export const testDocsHeaders = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("Document.addHeader and getHeader", t => {
    const { doc } = maketdoc(toTrash, fixes);

    // 1. Get header on a new doc (should be null)
    let header = doc.getHeader();
    t.is(header, null, "New document should not have a header");

    // 2. Add a header
    const newHeader = doc.addHeader();
    t.truthy(newHeader, "addHeader should return a HeaderSection object");
    t.is(newHeader.toString(), 'HeaderSection', "Returned object should be a HeaderSection");

    // 3. Get the header again
    header = doc.getHeader();
    t.truthy(header, "getHeader should now return the created header");
    t.is(header.getNumChildren(), 1, "New header should contain one empty paragraph");
    t.is(header.getChild(0).getType(), DocumentApp.ElementType.PARAGRAPH, "Header's child should be a paragraph");
    t.is(header.getText(), "", "New header text should be empty");

    // 4. Add content to the header and get it again
    header.appendParagraph("This is the header text.");
    // Calling addHeader() again should throw an error in the live environment.
    // We get the header again to check the content.
    const sameHeader = doc.getHeader();
    t.is(sameHeader.getText(), "\nThis is the header text.", "The header should contain the appended text");
    t.rxMatch(t.threw(() => doc.addHeader())?.message, /Document tab already contains a header./, "Calling addHeader again should throw an error");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });


  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsHeaders();
  ScriptApp.__behavior.trash()
  console.log('...cumulative docs cache performance', getDocsPerformance())
}
