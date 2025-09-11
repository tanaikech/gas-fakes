
import "../main.js";
import { initTests } from "./testinit.js";
import { wrapupTest, getDocsPerformance, maketdoc, docReport, getChildren, trasher } from "./testassist.js";
;
export const testDocsStyles = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("Document.clear() style persistence validation", t => {
    // This test validates that doc.clear() does NOT reset document-level styles on the live environment.
    // It uses a fresh document to avoid pollution from previous tests.
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    const docId = doc.getId();

    // 1. Set a custom document-level style.
    body.setMarginTop(144); // Default is 72

    // Verify the style was set by checking the underlying document resource.
    doc.saveAndClose(); // Ensure changes are persisted
    let docResource = Docs.Documents.get(docId);
    t.is(docResource.documentStyle.marginTop.magnitude, 144, "Pre-clear: marginTop should be 144");

    // 2. Clear the document. This should NOT reset the document styles on the live environment.
    doc = DocumentApp.openById(docId); // Re-open to get a fresh handle
    doc.clear();

    // 3. Verify the style has NOT been reset.
    doc.saveAndClose();
    docResource = Docs.Documents.get(docId);
    t.is(docResource.documentStyle.marginTop.magnitude, 144, "Post-clear: marginTop should NOT be reset and remain 144");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Document initial documentStyle validation", t => {
    // Force a new document to ensure we are testing the initial styles of a
    // truly new document, not one that has been modified by a previous test.
    let { doc, docName } = maketdoc(toTrash, fixes, { forceNew: true });

    // Save and close to synchronize changes made by DocumentApp (like clear()) before using the advanced service.
    const docId = doc.getId();
    doc.saveAndClose();

    // Re-fetch the document using the advanced Docs service to get the full document structure
    // including documentStyle.
    const docResource = Docs.Documents.get(docId);
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


    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Appended paragraph style validation", t => {
    let { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();
    const paraText = "p1";

    const appendedPara = body.appendParagraph(paraText);

    // On a new doc, appendParagraph adds a new paragraph, making 2 children (initial empty + new one).
    t.is(body.getNumChildren(), 2, "Body should have 2 children after first append to new doc");

    const paraToTest = body.getChild(1);
    t.is(paraToTest.getText(), paraText, "Appended paragraph has correct text");

    const attributes = paraToTest.getAttributes();

    t.is(attributes[DocumentApp.Attribute.HEADING], DocumentApp.ParagraphHeading.NORMAL, "Named style type should be NORMAL_TEXT");
    t.is(attributes[DocumentApp.Attribute.LEFT_TO_RIGHT], true, "Direction should be LEFT_TO_RIGHT");
    t.is(attributes[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "Alignment should be START/LEFT");
    t.is(attributes[DocumentApp.Attribute.LINE_SPACING], 1.15, "Line spacing should be 1.15 (115%)");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Appending a detached styled paragraph", t => {
    let { doc } = maketdoc(toTrash, fixes);
    const body = doc.getBody();

    const sourcePara = body.appendParagraph("Source Paragraph");
    sourcePara.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const detachedPara = sourcePara.copy();

    body.appendParagraph("Middle Paragraph");

    const appendedPara = body.appendParagraph(detachedPara);

    t.is(appendedPara.getText(), "Source Paragraph", "Appended detached paragraph should have correct text");
    t.is(appendedPara.getHeading(), DocumentApp.ParagraphHeading.HEADING1, "Appended detached paragraph should have copied style");

    const children = getChildren(body);
    t.is(children.length, 4, "Body should have 4 children after appending detached paragraph");
    t.is(children[3].getText(), "Source Paragraph", "The last child should be the appended paragraph");

    t.truthy(sourcePara.getParent(), "Original paragraph should still be attached");
    t.is(children[1].getText(), "Source Paragraph", "The second child should be the original paragraph");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });



  unit.section("Body style and attribute methods", t => {
    // Force a new document to ensure no style pollution from previous tests,
    // as we've established that doc.clear() does not reset named styles.
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    const docId = doc.getId();

    // Test margin setters (requires advanced service to verify)
    body.setMarginLeft(90);
    body.setMarginTop(100);
    doc.saveAndClose();
    let docResource = Docs.Documents.get(docId);
    t.is(docResource.documentStyle.marginLeft.magnitude, 90, "setMarginLeft should update document style");
    t.is(docResource.documentStyle.marginTop.magnitude, 100, "setMarginTop should update document style");
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    // Test page size setters (requires advanced service to verify)
    body.setPageWidth(500);
    body.setPageHeight(700);
    doc.saveAndClose();
    docResource = Docs.Documents.get(docId);
    t.is(docResource.documentStyle.pageSize.width.magnitude, 500, "setPageWidth should update page size");
    t.is(docResource.documentStyle.pageSize.height.magnitude, 700, "setPageHeight should update page size");
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    // Test setText
    body.setText("Initial paragraph.");
    t.is(body.getText(), "Initial paragraph.", "setText should replace body content");

    // Test setAttributes on Body. Live behavior is strange:
    // It applies TEXT attributes (e.g. FONT_FAMILY, ITALIC) to all paragraphs (existing and new).
    // It does NOT apply PARAGRAPH attributes (e.g. HORIZONTAL_ALIGNMENT) to any paragraphs.
    const p1 = body.getChild(0); // The paragraph created by setText()
    const p1InitialAttrs = p1.getAttributes();
    t.is(p1InitialAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "Initial paragraph should have default LEFT alignment");
    // On live GAS, an unset boolean attribute like ITALIC returns null from getAttributes().
    t.is(p1InitialAttrs[DocumentApp.Attribute.ITALIC], null, "Initial paragraph should not be italic (returns null)");

    const attributesToSet = {
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER,
      [DocumentApp.Attribute.ITALIC]: true,
      [DocumentApp.Attribute.FONT_FAMILY]: 'Comic Sans MS'
    };
    body.setAttributes(attributesToSet);

    // Re-fetch attributes of the existing paragraph to confirm the mixed changes.
    const p1AfterSetAttrs = p1.getAttributes();

    // Verify changes to the EXISTING paragraph
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "setAttributes should NOT affect alignment of existing paragraphs");
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.ITALIC], true, "setAttributes SHOULD affect italic of existing paragraphs");
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.FONT_FAMILY], 'Comic Sans MS', "setAttributes SHOULD affect font family of existing paragraphs");

    // Verify changes to a NEWLY appended paragraph
    const p2 = body.appendParagraph("A new paragraph");
    const p2Attrs = p2.getAttributes();
    t.is(p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "setAttributes should NOT affect alignment of new paragraphs");
    t.is(p2Attrs[DocumentApp.Attribute.ITALIC], true, "setAttributes SHOULD affect italic of new paragraphs");
    t.is(p2Attrs[DocumentApp.Attribute.FONT_FAMILY], 'Comic Sans MS', "setAttributes SHOULD affect font family of new paragraphs");


    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsStyles);
