
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesParagraph = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Paragraph class methods', (t) => {
    const presName = `gas-fakes-test-paragraph-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);
    const textRange = shape.getText();

    // Set multi-paragraph text
    // "Line 1\nLine 2\nLine 3" -> 3 paragraphs
    // Note: setText might add a final newline if not present, depending on implementation.
    // Our implementation sets exactly what is passed.
    // Live Apps Script ensures a final newline usually.
    // Let's set text with explicit newlines.

    textRange.setText('Line 1\nLine 2\nLine 3\n');

    const paragraphs = textRange.getParagraphs();
    t.is(paragraphs.length, 3, 'Should have 3 paragraphs');

    // Check first paragraph
    const p0 = paragraphs[0];
    // "Line 1\n" length 7. End index 7. Paragraph index 6.
    t.is(p0.getIndex(), 6, 'Paragraph 0 index should be 6 (endIndex - 1)');
    // t.is(p0.getText(), 'Line 1\n', 'Paragraph 0 text should match'); // Paragraph does not have getText in Live API
    t.is(p0.getRange().asString(), 'Line 1\n', 'Paragraph 0 range text should match');

    // Check second paragraph
    const p1 = paragraphs[1];
    // "Line 2\n" length 7. Start 7. End 14. Paragraph index 13.
    t.is(p1.getIndex(), 13, 'Paragraph 1 index should be 13');
    t.is(p1.getRange().asString(), 'Line 2\n', 'Paragraph 1 text should match');

    // Check third paragraph
    const p2 = paragraphs[2];
    // "Line 3\n" length 7. Start 14. End 21. Paragraph index 20.
    t.is(p2.getIndex(), 20, 'Paragraph 2 index should be 20');
    t.is(p2.getRange().asString(), 'Line 3\n', 'Paragraph 2 text should match');

    // Check toString
    t.is(p0.toString(), 'Paragraph', 'toString should return Paragraph');

  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake) testSlidesParagraph();
