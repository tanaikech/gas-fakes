import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance, maketdoc } from './testassist.js';

export const testDocsListItems = (pack) => {
  const { unit, fixes } = pack || initTests();
  const toTrash = [];

  const getChildren = (body) => {
    const children = [];
    for (let i = 0; i < body.getNumChildren(); i++) {
      children.push(body.getChild(i));
    }
    return children;
  };

  unit.section("ListItem methods", t => {
    const { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    const li1 = body.appendListItem("Item 1");
    const li2 = body.appendListItem("Item 2");
    li1.setIndentStart(36);
    li1.setIndentFirstLine(-18);

    // this is not necessary for Node, but if we want to mix advanced service and Apps Script API, we need to ensure the document is saved
    // and reloaded to get the latest state.
    // This is because the advanced service does not reflect changes made by the Apps Script API 
    doc.saveAndClose();
    const reloadedDoc = DocumentApp.openById(doc.getId());
    const reloadedBody = reloadedDoc.getBody();
    const li1_reloaded = reloadedBody.getChild(1);

    t.is(li1_reloaded.getListId(), li2.getListId(), "getListId should return the correct list ID");
    t.is(li1_reloaded.getNestingLevel(), 0, "getNestingLevel should return 0 for a top-level item");
    t.is(li1_reloaded.getGlyphType(), DocumentApp.GlyphType.NUMBER, "getGlyphType should return the correct type for a default list");

    // Test the paragraph styles by checking the underlying API resource
    const docResource = Docs.Documents.get(doc.getId());
    const para1 = docResource.body.content.find(p => p.paragraph?.elements?.[0]?.textRun?.content === 'Item 1\n').paragraph;
    t.is(para1.paragraphStyle.indentStart.magnitude, 36, "setIndentStart should set the correct indentation");
    t.is(para1.paragraphStyle.indentFirstLine.magnitude, -18, "setIndentFirstLine should set the correct indentation");


    // Test the not-implemented methods
    // for now skip these on live apps script
    // TODO see if we can find a workaround to emulate these methhods that dont have an api equivalent
    if (DocumentApp.isFake) {
      t.rxMatch(
        t.threw(() => li1_reloaded.setNestingLevel(1))?.message || 'no error thrown', /not yet implemented/, "setNestingLevel should throw notYetImplemented"
      )
      t.rxMatch(
        t.threw(() => li1_reloaded.setGlyphType(DocumentApp.GlyphType.SQUARE_BULLET))?.message || 'no error thrown', /not yet implemented/, "setGlyphType should throw notYetImplemented");
    }

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });

  unit.section("Body.appendListItem", t => {
    const { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();

    // 1. Append list item with text
    const li1 = body.appendListItem("Item 1");
    t.is(li1.getType(), DocumentApp.ElementType.LIST_ITEM, "appendListItem(text) should return a ListItem");
    t.is(li1.getText(), "Item 1", "ListItem should have correct text");
    t.truthy(li1.getParent(), "Appended list item should have a parent");

    const children1 = getChildren(body);
    t.is(children1.length, 2, "Body should have 2 children (empty para, item 1)");
    t.is(children1[1].getType(), DocumentApp.ElementType.LIST_ITEM, "Second child should be a ListItem");

    // 2. Append another list item, should continue the same list
    const li2 = body.appendListItem("Item 2");
    const children2 = getChildren(body);
    t.is(children2.length, 3, "Body should have 3 children after second append");
    t.is(children2[2].getType(), DocumentApp.ElementType.LIST_ITEM, "Third child should be a ListItem");
    t.is(children2[2].getText(), "Item 2", "Second list item text is correct");

    // Check with advanced service that they are in the same list
    doc.saveAndClose();
    const docResource = Docs.Documents.get(doc.getId());
    const content = docResource.body.content;
    const listItems = content.filter(c => c.paragraph && c.paragraph.bullet);

    t.is(listItems.length, 2, "Advanced service should see two list items");
    if (listItems.length === 2) {
      const listId1 = listItems[0].paragraph.bullet.listId;
      const listId2 = listItems[1].paragraph.bullet.listId;
      t.is(listId1, listId2, "Appended list items should be in the same list");
    }

    // 3. Append a copied list item
    body = DocumentApp.openById(doc.getId()).getBody();
    const li3_copy = li1.copy();
    const li3 = body.appendListItem(li3_copy);
    t.is(li3.getText(), "Item 1", "Copied list item should have correct text");
    const children3 = getChildren(body);
    t.is(children3.length, 4, "Body should have 4 children after appending copy");
    t.is(children3[3].getType(), DocumentApp.ElementType.LIST_ITEM, "Appended copy should be a ListItem");
    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });

  unit.section("Body.insertListItem", t => {
    const { doc } = maketdoc(toTrash, fixes);
    let body = doc.getBody();
    body.appendParagraph("p1");
    body.appendParagraph("p3");

    // 1. Insert list item with text
    const li2 = body.insertListItem(2, "Item 2"); // Insert between p1 and p3
    t.is(li2.getType(), DocumentApp.ElementType.LIST_ITEM, "insertListItem(text) should return a ListItem");
    t.is(li2.getText(), "Item 2", "Inserted list item text is correct");

    const children1 = getChildren(body);
    t.is(children1.length, 4, "Body should have 4 children after insert");
    t.is(children1[2].getType(), DocumentApp.ElementType.LIST_ITEM, "Inserted element should be a ListItem");
    t.is(body.getText(), "\np1\nItem 2\np3", "Body text should be correct after insert");

    // 2. Insert a copied list item
    const li1_copy = body.appendListItem("Item 1").copy();
    body.insertListItem(1, li1_copy); // Insert after initial empty paragraph
    const children2 = getChildren(body);
    t.is(children2.length, 6, "Body should have 6 children after inserting copy");
    t.is(children2[1].getType(), DocumentApp.ElementType.LIST_ITEM, "Inserted copy should be a ListItem");
    t.is(children2[1].getText(), "Item 1", "Inserted copy text should be correct");
    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance())
  });



  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsListItems();
  console.log('...cumulative docs cache performance', getDocsPerformance());
}
