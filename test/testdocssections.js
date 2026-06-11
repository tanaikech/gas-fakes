import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import {
  wrapupTest,
  getDocsPerformance, maketdoc, trasher, createTrashCollector
} from './testassist.js';

export const testDocsSections = (pack) => {
  const toTrash = createTrashCollector();
  const { unit, fixes } = pack || initTests();

  unit.section("Header and Footer section methods", t => {
    // maketdoc ensures we have a clean document
    const { doc } = maketdoc(toTrash, fixes);
    
    // We need an image blob for testing
    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
    imageBlob.setName('test_image.png');

    // 1. Add Sections
    let header = doc.addHeader();
    let footer = doc.addFooter();
    
    t.truthy(header, "Should successfully add a header section");
    t.truthy(footer, "Should successfully add a footer section");

    // 2. Test appendParagraph and insertParagraph
    const p1 = header.appendParagraph("Appended Para");
    t.truthy(p1, "Should return a paragraph element");
    
    const p2 = header.insertParagraph(header.getNumChildren(), "Inserted Para");
    t.is(header.getChild(header.getNumChildren() - 1).getText(), "Inserted Para", "Should insert paragraph at the end");
    
    // 3. Test setText and getText
    header.setText("New Header Text");
    t.is(header.getText(), "New Header Text", "Header text should be updated via setText");

    // 4. Test clear
    footer.setText("Some Footer Text");
    footer.clear();
    t.is(footer.getText(), "", "Footer content should be cleared (leaves one empty paragraph)");

    // 5. Test appendTable and insertTable
    const tableData = [["A", "B"]];
    const table = header.appendTable(tableData);
    t.is(header.getTables().length, 1, "Header should contain the appended table");

    const table2 = header.insertTable(header.getNumChildren(), tableData);
    t.is(header.getTables().length, 2, "Header should contain the inserted table");

    // 6. Test appendListItem and insertListItem
    header.appendListItem("Appended List");
    header.insertListItem(header.getNumChildren(), "Inserted List");
    t.is(header.getListItems().length, 2, "Header should contain the list items");

    // 7. Test appendImage and insertImage
    const img1 = header.appendImage(imageBlob);
    t.truthy(img1, "Should return appended image");
    const img2 = header.insertImage(header.getNumChildren(), imageBlob);
    t.truthy(img2, "Should return inserted image");
    
    // 8. Test remove child prep
    const p3 = header.appendParagraph('some stuff to be deleted');
    t.truthy(p3, "Should return appended paragraph");
    const p4 = header.insertParagraph(header.getNumChildren(), 'some more stuff to be deleted');
    t.truthy(p4, "Should return inserted paragraph");
    
    // 9. Test removeChild
    const initialChildren = header.getNumChildren();
    header.removeChild(p3);
    t.is(header.getNumChildren(), initialChildren - 1, "Child should be removed from the header");

    // 10. Test removeFromParent on the sections themselves
    t.truthy(doc.getHeader(), "Document should have a header");
    header.removeFromParent();
    t.is(doc.getHeader(), null, "Header should be removed from the document");

    t.truthy(doc.getFooter(), "Document should have a footer");
    footer.removeFromParent();
    t.is(doc.getFooter(), null, "Footer should be removed from the document");
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsSections);
