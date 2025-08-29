
import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance, maketdoc } from './testassist.js';

export const testDocsFooters = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  unit.section("Document.addFooter and getFooter", t => {
    const { doc } = maketdoc(toTrash, fixes);

    // 1. Get footer on a new doc (should be null)
    let footer = doc.getFooter();
    t.is(footer, null, "New document should not have a footer");

    // 2. Add a footer
    const newFooter = doc.addFooter();
    t.truthy(newFooter, "addFooter should return a FooterSection object");
    t.is(newFooter.toString(), 'FooterSection', "Returned object should be a FooterSection");

    // 3. Get the footer again
    footer = doc.getFooter();
    t.truthy(footer, "getFooter should now return the created footer");
    t.is(footer.getNumChildren(), 1, "New footer should contain one empty paragraph");
    t.is(footer.getChild(0).getType(), DocumentApp.ElementType.PARAGRAPH, "Footer's child should be a paragraph");
    t.is(footer.getText(), "", "New footer text should be empty");

    // 4. Add content to the footer and get it again
    footer.appendParagraph("This is the footer text.");
    const sameFooter = doc.getFooter();
    t.is(sameFooter.getText(), "\nThis is the footer text.", "The footer should contain the appended text");
    t.rxMatch(t.threw(() => doc.addFooter())?.message, /Document tab already contains a footer./, "Calling addFooter again should throw an error");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("FooterSection append/insert methods", t => {
    const { doc } = maketdoc(toTrash, fixes);
    const footer = doc.addFooter();
    // A new footer has one empty paragraph.

    // Test appendTable
    const tableData = [['f_t1c1', 'f_t1c2']];
    const table1 = footer.appendTable(tableData);
    t.is(table1.getType(), DocumentApp.ElementType.TABLE, "footer.appendTable should return a Table");
    t.is(table1.getCell(0, 0).getText(), 'f_t1c1', "footer.appendTable should create table with correct content");

    // Appending a table adds an empty paragraph after it.
    // Footer starts with 1 child (empty para). appendTable adds table + para. So 3 children.
    let numChildren = footer.getNumChildren();
    t.is(numChildren, 3, "Footer should have 3 children after appendTable");
    t.is(footer.getChild(1).getType(), DocumentApp.ElementType.TABLE, "footer.appendTable should add a table to the footer");
    t.is(footer.getChild(2).getType(), DocumentApp.ElementType.PARAGRAPH, "footer.appendTable should be followed by a paragraph");

    // Test insertTable
    const tableData2 = [['f_t0c1']];
    // Create a detached table. It's easier to create it in the body and copy it.
    const table2_copy = doc.getBody().appendTable(tableData2).copy();
    footer.insertTable(1, table2_copy); // Insert after the initial empty paragraph
    const insertedTable = footer.getChild(1);
    t.is(insertedTable.getType(), DocumentApp.ElementType.TABLE, "footer.insertTable should insert a Table");
    t.is(insertedTable.getCell(0, 0).getText(), 'f_t0c1', "footer.insertTable should have correct content");

    // Test appendListItem
    const li1 = footer.appendListItem("f_li1");
    t.is(li1.getType(), DocumentApp.ElementType.LIST_ITEM, "footer.appendListItem should return a ListItem");
    t.is(footer.getChild(footer.getNumChildren() - 1).getType(), DocumentApp.ElementType.LIST_ITEM, "footer.appendListItem should add a list item to the footer");

    // Test insertListItem
    const li0_copy = doc.getBody().appendListItem("f_li0").copy();
    footer.insertListItem(1, li0_copy); // Insert after initial empty paragraph
    t.is(footer.getChild(1).getType(), DocumentApp.ElementType.LIST_ITEM, "footer.insertListItem should insert a list item");
    t.is(footer.getChild(1).getText(), "f_li0", "footer.insertListItem should have correct text");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsFooters();
  ScriptApp.__behavior.trash()
  console.log('...cumulative docs cache performance', getDocsPerformance())
}

