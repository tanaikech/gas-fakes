import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, compareValue } from './testassist.js';

export const testSlidesFill = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Fill and SolidFill class methods', (t) => {
    const presName = `gas-fakes-test-fill-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);

    // Test getFill()
    const fill = shape.getFill();
    t.is(fill.toString(), 'Fill', 'getFill() should return Fill object');

    // Test getType() and isVisible()
    compareValue(t, fill.getType(), SlidesApp.FillType.NONE, 'Initial fill type should be NONE');
    t.false(fill.isVisible(), 'Initial fill should not be visible');
    t.is(fill.getSolidFill(), null, 'Initial solid fill should be null');

    // Test setSolidFill(String)
    fill.setSolidFill('#FF0000');
    compareValue(t, fill.getType(), SlidesApp.FillType.SOLID, 'After setSolidFill, type should be SOLID');
    t.true(fill.isVisible(), 'After setSolidFill, fill should be visible');

    // Test getSolidFill()
    const solidFill = fill.getSolidFill();
    t.is(solidFill.toString(), 'SolidFill', 'getSolidFill() should return SolidFill object');
    t.is(solidFill.getAlpha(), 1.0, 'Alpha should be 1.0 by default');

    // Test getColor() on SolidFill
    const color = solidFill.getColor();
    t.is(color.toString(), 'Color', 'getColor() should return Color object');
    t.is(color.getColorType().toString(), 'RGB', 'Color type should be RGB');
    t.is(color.asRgbColor().getRed(), 255, 'Red component should be 255');
    t.is(color.asRgbColor().getGreen(), 0, 'Green component should be 0');
    t.is(color.asRgbColor().getBlue(), 0, 'Blue component should be 0');

    // Test setTransparent()
    fill.setTransparent();
    compareValue(t, fill.getType(), SlidesApp.FillType.NONE, 'After setTransparent, type should be NONE');
    t.false(fill.isVisible(), 'After setTransparent, fill should not be visible');

    // Test setSolidFill(r, g, b)
    fill.setSolidFill(0, 255, 0);
    compareValue(t, fill.getType(), SlidesApp.FillType.SOLID, 'After setSolidFill(r,g,b), type should be SOLID');
    const greenSolidFill = fill.getSolidFill();
    const greenColor = greenSolidFill.getColor();
    t.is(greenColor.asRgbColor().getRed(), 0, 'Red component should be 0');
    t.is(greenColor.asRgbColor().getGreen(), 255, 'Green component should be 255');
    t.is(greenColor.asRgbColor().getBlue(), 0, 'Blue component should be 0');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesFill);
