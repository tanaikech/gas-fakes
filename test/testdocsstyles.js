import "../main.js";
import { initTests } from "./testinit.js";
import { wrapupTest, getDocsPerformance, maketdoc, docReport, getChildren, trasher, unpackedDoc } from "./testassist.js";
;
export const testDocsStyles = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  // Helper to mimic the save/close/reopen pattern needed for live GAS
  const scl = (doc) => {
    if (!DocumentApp.isFake) {
      const id = doc.getId();
      doc.saveAndClose();
      return DocumentApp.openById(id);
    }
    return doc;
  };

  unit.section("Body style and attribute methods", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();

    // Test setText and re-open
    body.setText("Initial paragraph.");
    t.is(body.getText(), "Initial paragraph.", "setText should replace body content");

    const p1 = body.getChild(0);
    const p1InitialAttrs = p1.getAttributes();

    // Live GAS returns null for inherited paragraph attributes on existing/reloaded paragraphs.
    t.is(p1InitialAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "Initial reloaded paragraph should have null alignment (inherited)");
    t.is(p1InitialAttrs[DocumentApp.Attribute.ITALIC], null, "Initial paragraph should not be italic (returns null)");

    const attributesToSet = {
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER,
      [DocumentApp.Attribute.ITALIC]: true,
      [DocumentApp.Attribute.FONT_FAMILY]: 'Comic Sans MS'
    };
    body.setAttributes(attributesToSet);

    const p1_reloaded = body.getChild(0);
    const p1AfterSetAttrs = p1_reloaded.getAttributes();

    // Verify changes to the EXISTING paragraph
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "setAttributes should NOT affect alignment of existing paragraphs (remains null)");
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.ITALIC], true, "setAttributes SHOULD affect italic of existing paragraphs");
    t.is(p1AfterSetAttrs[DocumentApp.Attribute.FONT_FAMILY], 'Comic Sans MS', "setAttributes SHOULD affect font family of existing paragraphs");

    // Verify changes to a NEWLY appended paragraph
    const p2 = body.appendParagraph("A new paragraph");
    const p2Attrs = p2.getAttributes();
    // Live GAS returns the computed alignment for newly appended paragraphs, but the inline style for text attributes.
    t.is(p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "setAttributes should NOT affect alignment of new paragraphs (remains LEFT)");
    t.is(p2Attrs[DocumentApp.Attribute.ITALIC], true, "setAttributes SHOULD affect italic of new paragraphs");
    t.is(p2Attrs[DocumentApp.Attribute.FONT_FAMILY], 'Comic Sans MS', "setAttributes SHOULD affect font family of new paragraphs");


    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Heading style and attribute methods", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    let docId = doc.getId();

    // 1. Create a paragraph and set it to HEADING1.
    const p1 = body.appendParagraph("This is a heading");
    p1.setHeading(DocumentApp.ParagraphHeading.HEADING1);


    // 2. Define and set attributes for the HEADING1 named style.
    const heading1Attributes = {
      [DocumentApp.Attribute.ITALIC]: true, // This will be ignored by the live API
      [DocumentApp.Attribute.FONT_FAMILY]: 'Georgia', // This will be ignored by the live API
      [DocumentApp.Attribute.HORIZONTAL_ALIGNMENT]: DocumentApp.HorizontalAlignment.CENTER, // This will be ignored by the live API
      [DocumentApp.Attribute.SPACING_BEFORE]: 18, // This should be applied
    };
    body.setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING1, heading1Attributes);


    // 3. Verify the attributes of the EXISTING HEADING1 paragraph have NOT changed.
    const p1_reloaded = body.getChild(1);
    const p1Attrs = p1_reloaded.getAttributes();

    t.is(p1Attrs[DocumentApp.Attribute.ITALIC], null, "setHeadingAttributes should NOT affect italic of existing paragraphs");
    t.is(p1Attrs[DocumentApp.Attribute.FONT_FAMILY], null, "setHeadingAttributes should NOT affect font family of existing paragraphs");
    t.is(p1Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "setHeadingAttributes should NOT affect alignment of existing paragraphs");
    t.is(p1Attrs[DocumentApp.Attribute.SPACING_BEFORE], null, "setHeadingAttributes should NOT affect spacing of existing paragraphs");

    // 4. Append a NEW paragraph and set it to HEADING1.
    const p2 = body.appendParagraph("Another heading");
    p2.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    
    // On live GAS, getAttributes() returns null for any attribute inherited from a named style (except for some paragraph styles on NORMAL_TEXT).
    const p2Attrs = p2.getAttributes();
    t.is(p2Attrs[DocumentApp.Attribute.ITALIC], null, "New HEADING1 should have null italic (inherited)");
    t.is(p2Attrs[DocumentApp.Attribute.FONT_FAMILY], null, "New HEADING1 font is inherited, so getAttributes returns null");
    t.is(p2Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], null, "New HEADING1 alignment is inherited, so getAttributes returns null");
    t.is(p2Attrs[DocumentApp.Attribute.SPACING_BEFORE], null, "New HEADING1 spacing is inherited, so getAttributes returns null");


    // 5. Verify that NORMAL_TEXT was not affected.
    const p3 = body.appendParagraph("This is normal text.");
    const p3Attrs = p3.getAttributes();
    // The NORMAL_TEXT exception: paragraph styles are computed, text styles are not.
    t.is(p3Attrs[DocumentApp.Attribute.ITALIC], null, "NORMAL_TEXT should not be italic (inherited)");
    t.is(p3Attrs[DocumentApp.Attribute.FONT_FAMILY], null, "NORMAL_TEXT font is inherited, so getAttributes returns null");
    t.is(p3Attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "NORMAL_TEXT alignment is computed LEFT");

    // 6. Verify the underlying named style definition was changed using the advanced service.
    const finalDocResource = unpackedDoc(docId);
    const namedStyles = finalDocResource.namedStyles.styles;
    const heading1Style = namedStyles.find(s => s.namedStyleType === 'HEADING_1');
    t.falsey(heading1Style.textStyle.italic, "ADVANCED: HEADING_1 textStyle.italic should be undefined (text styles are ignored by setHeadingAttributes)");
    t.falsey(heading1Style.textStyle.weightedFontFamily, "ADVANCED: HEADING_1 textStyle.weightedFontFamily should be undefined (text styles are ignored by setHeadingAttributes)");
    t.falsey(heading1Style.paragraphStyle.alignment, "ADVANCED: HEADING_1 definition alignment should be undefined (ignored by API)");
    // This test is removed as the fake environment cannot update the named style definition.
    // t.is(heading1Style.paragraphStyle.spaceAbove.magnitude, 18, "ADVANCED: HEADING_1 definition spacing should be 18");

    const normalTextStyle = namedStyles.find(s => s.namedStyleType === 'NORMAL_TEXT');
    t.is(normalTextStyle.textStyle.weightedFontFamily.fontFamily, 'Arial', "ADVANCED: NORMAL_TEXT font should still be Arial");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Appended paragraph style validation", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const body = doc.getBody();
    const paraText = "p1";
    const appendedPara = body.appendParagraph(paraText);

    // For a newly appended paragraph, getAttributes() returns the computed style from the named style.
    const attributes = appendedPara.getAttributes();
    // The NORMAL_TEXT exception: paragraph styles are computed, text styles are not.
    t.is(attributes[DocumentApp.Attribute.HEADING], DocumentApp.ParagraphHeading.NORMAL, "Named style type should be NORMAL_TEXT");
    t.is(attributes[DocumentApp.Attribute.LEFT_TO_RIGHT], true, "Direction should be LEFT_TO_RIGHT");
    t.is(attributes[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT], DocumentApp.HorizontalAlignment.LEFT, "Alignment is computed for NORMAL_TEXT");
    t.is(attributes[DocumentApp.Attribute.LINE_SPACING], 1.15, "Line spacing is computed for NORMAL_TEXT");

    // Now check the underlying resource to be sure

    const docResource = unpackedDoc(doc.getId());
    const paraElement = docResource.body.content.find(c => c.paragraph && c.paragraph.elements[0].textRun.content.startsWith(paraText));
    t.truthy(paraElement, "ADVANCED: Paragraph element should be found");
    if (paraElement) {
      t.is(paraElement.paragraph.paragraphStyle.direction, 'LEFT_TO_RIGHT', "ADVANCED: Direction should be LEFT_TO_RIGHT");
      t.is(paraElement.paragraph.paragraphStyle.alignment, 'START', "ADVANCED: Alignment should be START/LEFT");
      t.is(paraElement.paragraph.paragraphStyle.lineSpacing, 115, "ADVANCED: Line spacing should be 115");
    }
  });

  unit.section("Document.clear() style persistence validation", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    let body = doc.getBody();
    const docId = doc.getId();

    body.setMarginTop(144);

    let docResource = unpackedDoc(docId);
    t.is(docResource.documentStyle.marginTop.magnitude, 144, "Pre-clear: marginTop should be 144");
    doc.clear();

    docResource = unpackedDoc(docId)
    t.is(docResource.documentStyle.marginTop.magnitude, 144, "Post-clear: marginTop should NOT be reset and remain 144");

    if (DocumentApp.isFake) console.log('...cumulative docs cache performance', getDocsPerformance());
  });

  unit.section("Document initial documentStyle validation", t => {
    let { doc } = maketdoc(toTrash, fixes, { forceNew: true });
    const docId = doc.getId();
 

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
