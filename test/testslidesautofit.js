
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, compareValue } from './testassist.js';

export const testSlidesAutofit = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Autofit class methods', (t) => {
    const presName = `gas-fakes-test-autofit-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);

    // Test getAutofit()
    const autofit = shape.getAutofit();
    t.is(autofit.toString(), 'Autofit', 'getAutofit() should return Autofit object');

    // Test getAutofitType()
    compareValue(t, autofit.getAutofitType(), SlidesApp.AutofitType.NONE, 'Initial autofit type should be NONE');

    // Test getFontScale()
    t.is(autofit.getFontScale(), 1, 'Initial font scale should be 1');

    // Test getLineSpacingReduction()
    t.is(autofit.getLineSpacingReduction(), 0, 'Initial line spacing reduction should be 0');

    // Test disableAutofit()
    // We can't easily check for non-NONE values without internal access, but we can verify it returns the object and leaves it as NONE.
    const result = autofit.disableAutofit();
    t.is(result.toString(), 'Autofit', 'disableAutofit() should return Autofit object');
    compareValue(t, autofit.getAutofitType(), SlidesApp.AutofitType.NONE, 'After disableAutofit, type should be NONE');

    // Test that setText() leaves it as NONE
    shape.getText().setText('Testing autofit state');
    compareValue(t, shape.getAutofit().getAutofitType(), SlidesApp.AutofitType.NONE, 'After setText, autofit type should still be NONE');

  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesAutofit);
