import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesTextParity = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slides Text & Style Parity', (t) => {
    const presName = `gas-fakes-test-text-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 10, 10, 200, 100);
    const textRange = shape.getText();

    textRange.setText('Line 1\nLine 2');
    t.is(textRange.asString().trim(), 'Line 1\nLine 2', 'setText should work');

    // Test TextStyle
    const style = textRange.getTextStyle();
    t.is(style.toString(), 'TextStyle', 'getTextStyle should return TextStyle');
    t.is(typeof style.getFontSize(), 'number', 'getFontSize should return a number');
    style.setBold(true);
    t.true(style.isBold(), 'isBold should be true after setBold(true)');

    // Test ParagraphStyle
    const pStyle = textRange.getParagraphStyle();
    t.is(pStyle.toString(), 'ParagraphStyle', 'getParagraphStyle should return ParagraphStyle');
    pStyle.setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    t.is(pStyle.getParagraphAlignment().toString(), 'CENTER', 'getParagraphAlignment should be CENTER');

    // Test ListStyle
    const listStyle = textRange.getListStyle();
    t.is(listStyle.toString(), 'ListStyle', 'getListStyle should return ListStyle');
    t.false(listStyle.isInList(), 'Initial text should not be in list');
    
    // Test append/insert
    textRange.appendParagraph('Line 3');
    t.true(textRange.asString().includes('Line 3'), 'appendParagraph should work');
    
    const paragraphs = textRange.getParagraphs();
    t.is(paragraphs.length, 3, 'Should have 3 paragraphs');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesTextParity);
