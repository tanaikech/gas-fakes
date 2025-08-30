import '../main.js';
import { maketdoc, getDocsPerformance } from './testassist.js';

/**
 * A generic test suite for Document sections (HeaderSection, FooterSection).
 * @param {object} pack The test pack from initTests().
 * @param {object} options The configuration for the section type.
 * @param {string} options.sectionType The type of section ('Header' or 'Footer').
 * @param {string} options.addMethod The name of the method to add the section (e.g., 'addHeader').
 * @param {string} options.getMethod The name of the method to get the section (e.g., 'getHeader').
 * @param {string} options.dataPrefix A prefix for test data strings (e.g., 'h' or 'f').
 * @returns {{toTrash: object[]}} An object containing items to be trashed.
 */
export const testDocsSection = (pack, { sectionType, addMethod, getMethod, dataPrefix }) => {
  const { unit } = pack;
  const toTrash = [];
  const sectionClassName = `${sectionType}Section`;
  const lcSectionType = sectionType.toLowerCase();

  unit.section(`Document.${addMethod} and ${getMethod}`, t => {
    const { doc } = maketdoc(toTrash, pack.fixes);

    // 1. Get section on a new doc (should be null)
    let section = doc[getMethod]();
    t.is(section, null, `New document should not have a ${lcSectionType}`);

    // 2. Add a section
    const newSection = doc[addMethod]();
    t.truthy(newSection, `${addMethod} should return a ${sectionClassName} object`);
    t.is(newSection.toString(), sectionClassName, `Returned object should be a ${sectionClassName}`);

    // 3. Get the section again
    section = doc[getMethod]();
    t.truthy(section, `${getMethod} should now return the created ${lcSectionType}`);
    t.is(section.getNumChildren(), 1, `New ${lcSectionType} should contain one empty paragraph`);
    t.is(section.getChild(0).getType(), DocumentApp.ElementType.PARAGRAPH, `${sectionType}'s child should be a paragraph`);
    t.is(section.getText(), "", `New ${lcSectionType} text should be empty`);

    // 4. Add content to the section and get it again
    section.appendParagraph(`This is the ${lcSectionType} text.`);
    const sameSection = doc[getMethod]();
    t.is(sameSection.getText(), `\nThis is the ${lcSectionType} text.`, `The ${lcSectionType} should contain the appended text`);
    t.rxMatch(t.threw(() => doc[addMethod]())?.message, new RegExp(`Document tab already contains a ${lcSectionType}.`), `Calling ${addMethod} again should throw an error`);

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section(`${sectionClassName} append/insert methods`, t => {
    const { doc } = maketdoc(toTrash, pack.fixes);
    const section = doc[addMethod]();

    // Test appendTable
    const tableData = [[`${dataPrefix}_t1c1`, `${dataPrefix}_t1c2`]];
    const table1 = section.appendTable(tableData);
    t.is(table1.getType(), DocumentApp.ElementType.TABLE, `${lcSectionType}.appendTable should return a Table`);
    t.is(table1.getCell(0, 0).getText(), `${dataPrefix}_t1c1`, `${lcSectionType}.appendTable should create table with correct content`);

    let numChildren = section.getNumChildren();
    t.is(numChildren, 3, `${sectionType} should have 3 children after appendTable`);
    t.is(section.getChild(1).getType(), DocumentApp.ElementType.TABLE, `${lcSectionType}.appendTable should add a table to the ${lcSectionType}`);
    t.is(section.getChild(2).getType(), DocumentApp.ElementType.PARAGRAPH, `${lcSectionType}.appendTable should be followed by a paragraph`);

    // Test insertTable
    const tableData2 = [[`${dataPrefix}_t0c1`]];
    const table2_copy = doc.getBody().appendTable(tableData2).copy();
    section.insertTable(1, table2_copy);
    const insertedTable = section.getChild(1);
    t.is(insertedTable.getType(), DocumentApp.ElementType.TABLE, `${lcSectionType}.insertTable should insert a Table`);
    t.is(insertedTable.getCell(0, 0).getText(), `${dataPrefix}_t0c1`, `${lcSectionType}.insertTable should have correct content`);

    // Test appendListItem
    const li1 = section.appendListItem(`${dataPrefix}_li1`);
    t.is(li1.getType(), DocumentApp.ElementType.LIST_ITEM, `${lcSectionType}.appendListItem should return a ListItem`);
    t.is(section.getChild(section.getNumChildren() - 1).getType(), DocumentApp.ElementType.LIST_ITEM, `${lcSectionType}.appendListItem should add a list item`);

    // Test insertListItem
    const li0_copy = doc.getBody().appendListItem(`${dataPrefix}_li0`).copy();
    section.insertListItem(1, li0_copy);
    t.is(section.getChild(1).getType(), DocumentApp.ElementType.LIST_ITEM, `${lcSectionType}.insertListItem should insert a list item`);
    t.is(section.getChild(1).getText(), `${dataPrefix}_li0`, `${lcSectionType}.insertListItem should have correct text`);

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  return { toTrash };
};
