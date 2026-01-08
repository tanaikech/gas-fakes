
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, compareValue } from './testassist.js';

export const testSlidesAutoText = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('AutoText class methods', (t) => {
    const presName = `gas-fakes-test-autotext-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);
    const textRange = shape.getText();

    // Verify it returns an array of AutoTexts
    const autoTexts = textRange.getAutoTexts();
    t.true(Array.isArray(autoTexts), 'getAutoTexts should return an array');

    // To test AutoText methods we'd need a slide with existing auto-text.
    // Since we can't create them via Apps Script, this test is limited to verifying
    // that the API surface is correct and returns without error.

  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesAutoText);
