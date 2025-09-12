import "../main.js";
import { initTests } from "./testinit.js";
import { wrapupTest, getDocsPerformance, maketdoc, docReport, getChildren, trasher, unpackedDoc } from "./testassist.js";
;
export const testDocsStyles = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();


  unit.section("Body style and attribute methods", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    let docId = doc.getId();

    // Test margin setters
    body.setMarginLeft(90);
    body.setMarginTop(100);
    doc.saveAndClose();
    let docResource = unpackedDoc(docId)
    t.is(docResource.documentStyle.marginLeft.magnitude, 90, "setMarginLeft should update document style");
    t.is(docResource.documentStyle.marginTop.magnitude, 100, "setMarginTop should update document style");
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    // Test page size setters
    body.setPageWidth(500);
    body.setPageHeight(700);
    doc.saveAndClose();
    docResource = unpackedDoc(docId)
    t.is(docResource.documentStyle.pageSize.width.magnitude, 500, "setPageWidth should update page size");
    t.is(docResource.documentStyle.pageSize.height.magnitude, 700, "setPageHeight should update page size");
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    // Test setText
    body.setText("Initial paragraph.");
    doc.saveAndClose(); // Synchronize state for live environment
    doc = DocumentApp.openById(docId);
    body = doc.getBody();
    t.is(body.getText(), "Initial paragraph.", "setText should replace body content");

    const p1 = body.getChild(0);
    const p1InitialAttrs = p1.getAttributes();
    // Live GAS returns null for inherited paragraph attributes on existing paragraphs.
    t.is(p1InitialAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "Initial paragraph should have null alignment (inherited)");
    t.is(p1InitialAttrs[DocumentApp.Attribute.ITALIC], null, "Initial paragraph should not be italic (returns null)");

    const attributesToSet = {
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER,
      [DocumentApp.Attribute.ITALIC]: true,
      [DocumentApp.Attribute.FONT_FAMILY]: 'Comic Sans MS'
    };
    body.setAttributes(attributesToSet);
    doc.saveAndClose(); // Synchronize state for live environment
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    const p1_reloaded = body.getChild(0);
    const p1AfterSetAttrs = p1_reloaded.getAttributes();

    // Verify changes to the EXISTING paragraph
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "setAttributes should NOT affect alignment of existing paragraphs (remains null)");
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.ITALIC], true, "setAttributes SHOULD affect italic of existing paragraphs");
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.FONT_FAMILY], 'Comic Sans MS', "setAttributes SHOULD affect font family of existing paragraphs");

    // Verify changes to a NEWLY appended paragraph
    const p2 = body.appendParagraph("A new paragraph");
    const p2Attrs = p2.getAttributes();
    // Live GAS returns the computed alignment for newly appended paragraphs.
    t.is(p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "setAttributes should NOT affect alignment of new paragraphs (remains LEFT)");
    t.is(p2Attrs[DocumentApp.Attribute.ITALIC], true, "setAttributes SHOULD affect italic of new paragraphs");
    t.is(p2Attrs[DocumentApp.Attribute.FONT_FAMILY], 'Comic Sans MS', "setAttributes SHOULD affect font family of new paragraphs");


    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Heading style and attribute methods", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    let docId = doc.getId();

    // 1. Create a paragraph and set it to HEADING1 to provide an anchor for style updates.
    const p1 = body.appendParagraph("This is a heading");
    p1.setHeading(DocumentApp.ParagraphHeading.HEADING1);

    // Synchronize to ensure the heading is set before we modify its style definition.
    doc.saveAndClose();
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    // 2. Define and set attributes for the HEADING1 named style.
    const heading1Attributes = {
      [DocumentApp.Attribute.ITALIC]: true, // This will be ignored by the live API
      [DocumentApp.Attribute.FONT_FAMILY]: 'Georgia', // This will be ignored by the live API
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER, // This should be applied
      [DocumentApp.Attribute.SPACING_BEFORE]: 18, // This should be applied
    };
    body.setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING1, heading1Attributes);

    // Synchronize to ensure the named style definition is updated.
    doc.saveAndClose();
    doc = DocumentApp.openById(docId);
    body = doc.getBody();

    // 3. Verify the attributes of the EXISTING HEADING1 paragraph have NOT changed.
    const p1_reloaded = body.getChild(1);
    const p1Attrs = p1_reloaded.getAttributes();
    t.is(p1Attrs[DocumentApp.Attribute.ITALIC], null, "setHeadingAttributes should NOT affect italic of existing paragraphs");
    t.is(p1Attrs[DocumentApp.Attribute.FONT_FAMILY], null, "setHeadingAttributes should NOT affect font family of existing paragraphs");
    t.is(p1Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "setHeadingAttributes should NOT affect alignment of existing paragraphs");
    t.is(p1Attrs[DocumentApp.Attribute.SPACING_BEFORE], null, "setHeadingAttributes should NOT affect spacing of existing paragraphs");

    // 4. Append a NEW paragraph and set it to HEADING1 to verify inheritance.
    const p2 = body.appendParagraph("Another heading");
    p2.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    doc.saveAndClose(); // Save to apply the heading change
    doc = DocumentApp.openById(docId);
    body = doc.getBody();
    const p2_reloaded = body.getChild(2);
    const p2Attrs = p2_reloaded.getAttributes();

    // Live API: getAttributes() returns null for inherited styles, but computed for newly appended ones.
    // After a save/close/reload, it should behave like an existing paragraph and return null.
    t.is(p2Attrs[DocumentApp.Attribute.ITALIC], null, "New HEADING1 should have null italic (inherited, not set)");
    t.is(p2Attrs[DocumentApp.Attribute.FONT_FAMILY], null, "New HEADING1 should have null font family (inherited, not set)");
    t.is(p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "New HEADING1 should have null alignment (inherited)");
    t.is(p2Attrs[DocumentApp.Attribute.SPACING_BEFORE], null, "New HEADING1 should have null spacing (inherited)");

    // 5. Verify that NORMAL_TEXT was not affected.
    const p3 = body.appendParagraph("This is normal text.");
    const p3Attrs = p3.getAttributes();
    t.is(p3Attrs[DocumentApp.Attribute.ITALIC], null, "NORMAL_TEXT should not be italic");
    t.is(p3Attrs[DocumentApp.Attribute.FONT_FAMILY], null, "NORMAL_TEXT font should be null (inherited)");
    t.is(p3Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "NORMAL_TEXT alignment should be computed LEFT");

    // 6. Verify the underlying named style definition was changed using the advanced service.
    const finalDocResource = unpackedDoc(docId);
    const namedStyles = finalDocResource.namedStyles.styles;
    const heading1Style = namedStyles.find(s => s.namedStyleType === 'HEADING_1');
    t.is(heading1Style.textStyle.italic, undefined, {
      neverUndefined: false,
      description: "ADVANCED: HEADING_1 textStyle.italic should be undefined (text styles are ignored)"
    });
    t.is(heading1Style.textStyle.weightedFontFamily, undefined, {
      neverUndefined: false,
      description: "ADVANCED: HEADING_1 textStyle.weightedFontFamily should be undefined (text styles are ignored)"
    });
    t.is(heading1Style.paragraphStyle.alignment, 'CENTER', "ADVANCED: HEADING_1 definition alignment should be CENTER");
    t.is(heading1Style.paragraphStyle.spaceAbove.magnitude, 18, "ADVANCED: HEADING_1 definition spacing should be 18");

    const normalTextStyle = namedStyles.find(s => s.namedStyleType === 'NORMAL_TEXT');
    t.is(normalTextStyle.textStyle.weightedFontFamily.fontFamily, 'Arial', "ADVANCED: NORMAL_TEXT font should still be Arial");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Appended paragraph style validation", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const body = doc.getBody();
    const paraText = "p1";

    body.appendParagraph(paraText);
    doc.saveAndClose();
    doc = DocumentApp.openById(doc.getId());

    t.is(doc.getBody().getNumChildren(), 2, "Body should have 2 children after first append to new doc");

    const paraToTest = doc.getBody().getChild(1);
    t.is(paraToTest.getText(), paraText, "Appended paragraph has correct text");

    const attributes = paraToTest.getAttributes();
    t.is(attributes[DocumentApp.Attribute.HEADING], DocumentApp.ParagraphHeading.NORMAL, "Named style type should be NORMAL_TEXT");
    // Live GAS returns computed values for newly appended paragraphs, but null for reloaded ones.
    // After save/close, it's a reloaded paragraph.
    t.is(attributes[DocumentApp.Attribute.LEFT_TO_RIGHT], null, "Direction should be null (inherited)");
    t.is(attributes[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "Alignment should be null (inherited)");
    t.is(attributes[DocumentApp.Attribute.LINE_SPACING], null, "Line spacing should be null (inherited)");

    // Verify with advanced service
    const docResource = unpackedDoc(doc.getId());
    const paraElement = docResource.body.content.find(c => c.paragraph && c.paragraph.elements[0].textRun.content.startsWith(paraText));
    t.is(paraElement.paragraph.paragraphStyle.direction, 'LEFT_TO_RIGHT', "ADVANCED: Direction should be LEFT_TO_RIGHT");
    t.is(paraElement.paragraph.paragraphStyle.alignment, 'START', "ADVANCED: Alignment should be START/LEFT");
    t.is(paraElement.paragraph.paragraphStyle.lineSpacing, 115, "ADVANCED: Line spacing should be 115");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Document.clear() style persistence validation", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    const docId = doc.getId();

    body.setMarginTop(144);
    doc.saveAndClose();
    let docResource = unpackedDoc(docId);
    t.is(docResource.documentStyle.marginTop.magnitude, 144, "Pre-clear: marginTop should be 144");

    doc = DocumentApp.openById(docId);
    doc.clear();

    doc.saveAndClose();
    docResource = unpackedDoc(docId)
    t.is(docResource.documentStyle.marginTop.magnitude, 144, "Post-clear: marginTop should NOT be reset and remain 144");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Document initial documentStyle validation", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const docId = doc.getId();
    doc.saveAndClose();

    const docResource = unpackedDoc(docId)
    const documentStyle = docResource.documentStyle;

    t.truthy(documentStyle, "Document should have a documentStyle property");
    t.deepEqual(documentStyle.marginTop, { magnitude: 72, unit: 'PT' }, "marginTop should be 72 PT");
    t.deepEqual(documentStyle.marginBottom, { magnitude: 72, unit: 'PT' }, "marginBottom should be 72 PT");
    t.deepEqual(documentStyle.marginLeft, { magnitude: 72, unit: 'PT' }, "marginLeft should be 72 PT");
    t.deepEqual(documentStyle.marginRight, { magnitude: 72, unit: 'PT' }, "marginRight should be 72 PT");
    t.deepEqual(documentStyle.marginHeader, { magnitude: 36, unit: 'PT' }, "marginHeader should be 36 PT");
    t.deepEqual(documentStyle.marginFooter, { magnitude: 36, unit: 'PT' }, "marginFooter should be 36 PT");
    t.is(documentStyle.useCustomHeaderFooterMargins, true, "useCustomHeaderFooterMargins should be true");
    t.deepEqual(documentStyle.background, { color: {} }, "background should be an empty color object");
    t.is(documentStyle.pageNumberStart, 1, "pageNumberStart should be 1");
    t.truthy(documentStyle.pageSize, "pageSize should exist");
    t.truthy(documentStyle.pageSize.height, "pageSize should have a height");
    t.truthy(documentStyle.pageSize.width, "pageSize should have a width");
    t.is(documentStyle.pageSize.height.unit, 'PT', "pageSize height unit should be PT");
    t.is(documentStyle.pageSize.width.unit, 'PT', "pageSize width unit should be PT");

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

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsStyles);
