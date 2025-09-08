
import "../main.js";
import { initTests } from "./testinit.js";
import { wrapupTest, getDocsPerformance, maketdoc, docReport, getChildren, trasher } from "./testassist.js";
;
export const testDocsStyles = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("Document initial documentStyle validation", t => {
    let { doc, docName } = maketdoc(toTrash, fixes);

    // Re-fetch the document using the advanced Docs service to get the full document structure
    // including documentStyle.
    const docResource = Docs.Documents.get(doc.getId());
    const documentStyle = docResource.documentStyle;

    t.truthy(documentStyle, "Document should have a documentStyle property");

    // Validate margin properties
    t.deepEqual(documentStyle.marginTop, { magnitude: 72, unit: 'PT' }, "marginTop should be 72 PT");
    t.deepEqual(documentStyle.marginBottom, { magnitude: 72, unit: 'PT' }, "marginBottom should be 72 PT");
    t.deepEqual(documentStyle.marginLeft, { magnitude: 72, unit: 'PT' }, "marginLeft should be 72 PT");
    t.deepEqual(documentStyle.marginRight, { magnitude: 72, unit: 'PT' }, "marginRight should be 72 PT");
    t.deepEqual(documentStyle.marginHeader, { magnitude: 36, unit: 'PT' }, "marginHeader should be 36 PT");
    t.deepEqual(documentStyle.marginFooter, { magnitude: 36, unit: 'PT' }, "marginFooter should be 36 PT");

    // Validate header/footer margin usage
    t.is(documentStyle.useCustomHeaderFooterMargins, true, "useCustomHeaderFooterMargins should be true");

    // Validate background and page number start
    t.deepEqual(documentStyle.background, { color: {} }, "background should be an empty color object");
    t.is(documentStyle.pageNumberStart, 1, "pageNumberStart should be 1");

    // Validate pageSize (check for existence and structure, specific values might vary by locale/API default)
    t.truthy(documentStyle.pageSize, "pageSize should exist");
    t.truthy(documentStyle.pageSize.height, "pageSize should have a height");
    t.truthy(documentStyle.pageSize.width, "pageSize should have a width");
    t.is(documentStyle.pageSize.height.unit, 'PT', "pageSize height unit should be PT");
    t.is(documentStyle.pageSize.width.unit, 'PT', "pageSize width unit should be PT");

    // Optional: You could add assertions for specific page sizes (e.g., A4 or Letter) if they are fixed.
    // For example: t.is(documentStyle.pageSize.height.magnitude, 792, "pageSize height should be 792 PT (Letter)");
    // t.is(documentStyle.pageSize.width.magnitude, 612, "pageSize width should be 612 PT (Letter)");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });
  unit.section("Document initial documentStyle validation", t => {
    let { doc, docName } = maketdoc(toTrash, fixes);

    // Re-fetch the document using the advanced Docs service to get the full document structure
    // including documentStyle.
    const docResource = Docs.Documents.get(doc.getId());
    const documentStyle = docResource.documentStyle;

    t.truthy(documentStyle, "Document should have a documentStyle property");

    // Validate margin properties
    t.deepEqual(documentStyle.marginTop, { magnitude: 72, unit: 'PT' }, "marginTop should be 72 PT");
    t.deepEqual(documentStyle.marginBottom, { magnitude: 72, unit: 'PT' }, "marginBottom should be 72 PT");
    t.deepEqual(documentStyle.marginLeft, { magnitude: 72, unit: 'PT' }, "marginLeft should be 72 PT");
    t.deepEqual(documentStyle.marginRight, { magnitude: 72, unit: 'PT' }, "marginRight should be 72 PT");
    t.deepEqual(documentStyle.marginHeader, { magnitude: 36, unit: 'PT' }, "marginHeader should be 36 PT");
    t.deepEqual(documentStyle.marginFooter, { magnitude: 36, unit: 'PT' }, "marginFooter should be 36 PT");

    // Validate header/footer margin usage
    t.is(documentStyle.useCustomHeaderFooterMargins, true, "useCustomHeaderFooterMargins should be true");

    // Validate background and page number start
    t.deepEqual(documentStyle.background, { color: {} }, "background should be an empty color object");
    t.is(documentStyle.pageNumberStart, 1, "pageNumberStart should be 1");

    // Validate pageSize (check for existence and structure, specific values might vary by locale/API default)
    t.truthy(documentStyle.pageSize, "pageSize should exist");
    t.truthy(documentStyle.pageSize.height, "pageSize should have a height");
    t.truthy(documentStyle.pageSize.width, "pageSize should have a width");
    t.is(documentStyle.pageSize.height.unit, 'PT', "pageSize height unit should be PT");
    t.is(documentStyle.pageSize.width.unit, 'PT', "pageSize width unit should be PT");

    // Optional: You could add assertions for specific page sizes (e.g., A4 or Letter) if they are fixed.
    // For example: t.is(documentStyle.pageSize.height.magnitude, 792, "pageSize height should be 792 PT (Letter)");
    // t.is(documentStyle.pageSize.width.magnitude, 612, "pageSize width should be 612 PT (Letter)");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });
  unit.section("Appended paragraph style validation", t => {
    let { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const paraText = "p1";

    // This call should now use the new logic in elementoptions.js
    body.appendParagraph(paraText);

    // Use the advanced service to get the true underlying structure
    const docResource = Docs.Documents.get(doc.getId());
    const content = docResource.body.content;

    // The appended paragraph should be the third element, after the section break and initial empty paragraph.
    t.is(content.length, 3, "Body should have 3 structural elements after one append");
    const appendedPara = content[2];
    t.truthy(appendedPara.paragraph, "Third element should be a paragraph");

    const style = appendedPara.paragraph.paragraphStyle;

    // The key validation: In the live environment, a new paragraph gets `avoidWidowAndOrphan`
    // set to `false`, which overrides the `NORMAL_TEXT` named style's value of `true`.
    t.is(style.avoidWidowAndOrphan, false, "Appended paragraph should have avoidWidowAndOrphan set to false");

    // Also check a few other properties to ensure the style is fully resolved.
    t.is(style.namedStyleType, 'NORMAL_TEXT', "Named style type should be NORMAL_TEXT");
    t.is(style.direction, 'LEFT_TO_RIGHT', "Direction should be LEFT_TO_RIGHT");
    t.is(style.alignment, 'START', "Alignment should be START");
    t.is(style.lineSpacing, 115, "Line spacing should be 115");

    // Check that an empty border object is present, as seen in the live response
    t.truthy(style.borderBottom, "borderBottom property should exist");
    t.deepEqual(style.borderBottom.color, {}, "borderBottom color should be an empty object");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Appending a detached styled paragraph", t => {
    let { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    // 1. Create a source paragraph and a detached copy with a specific style
    const sourcePara = body.appendParagraph("Source Paragraph");
    sourcePara.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const detachedPara = sourcePara.copy();

    // 2. Append another paragraph to ensure we're not just inserting at the end of the source
    body.appendParagraph("Middle Paragraph");

    // 3. Append the detached copy
    const appendedPara = body.appendParagraph(detachedPara);

    t.is(appendedPara.getText(), "Source Paragraph", "Appended detached paragraph should have correct text");
    t.is(appendedPara.getHeading(), DocumentApp.ParagraphHeading.HEADING1, "Appended detached paragraph should have copied style");

    // 4. Verify the document structure
    const children = getChildren(body);
    // [initial empty, "Source Paragraph", "Middle Paragraph", "Source Paragraph" (appended)]
    t.is(children.length, 4, "Body should have 4 children after appending detached paragraph");
    t.is(children[3].getText(), "Source Paragraph", "The last child should be the appended paragraph");

    // 5. Verify the original paragraph is untouched
    t.truthy(sourcePara.getParent(), "Original paragraph should still be attached");
    t.is(children[1], sourcePara, "The second child should be the original paragraph");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });
  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsStyles);