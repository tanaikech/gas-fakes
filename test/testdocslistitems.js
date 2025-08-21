
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

