import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesLayout = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Layout class methods', (t) => {
    const presName = `gas-fakes-test-layout-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const layouts = pres.getLayouts();
    t.truthy(layouts.length > 0, 'Presentation should have layouts');

    const layout = layouts[0];
    t.is(layout.toString(), 'Layout', 'layout.toString() should be "Layout"');
    t.is(layout.getPageType().toString(), 'LAYOUT', 'getPageType() should return LAYOUT');

    // Test getLayoutName()
    t.true(is.string(layout.getLayoutName()), 'getLayoutName() should return a string');

    // Test getMaster()
    const master = layout.getMaster();
    t.truthy(master, 'Layout should have a master');
    t.is(master.toString(), 'Master', 'master.toString() should be "Master"');

    // Test retrieval methods
    const initialShapes = layout.getShapes().length;
    
    // Test insertion
    const shape = layout.insertShape(SlidesApp.ShapeType.RECTANGLE, 10, 10, 100, 100);
    t.is(shape.toString(), 'Shape', 'insertShape() should return a Shape');
    t.is(layout.getShapes().length, initialShapes + 1, 'Layout should have 1 more shape after insertion');

    const textBox = layout.insertTextBox('Hello Layout', 120, 10, 100, 50);
    t.is(textBox.getText().asString(), 'Hello Layout\n', 'insertTextBox should set text');
    t.is(layout.getShapes().length, initialShapes + 2, 'Layout should have 2 more shapes');

    const table = layout.insertTable(3, 3, 10, 120, 200, 100);
    t.is(table.toString(), 'Table', 'insertTable() should return a Table');
    t.is(layout.getTables().length, 1, 'Layout should have 1 table');

    const imageUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
    const image = layout.insertImage(imageUrl, 10, 250, 100, 50);
    t.is(image.toString(), 'Image', 'insertImage() should return an Image');
    t.is(layout.getImages().length, 1, 'Layout should have 1 image');

    const line = layout.insertLine(SlidesApp.LineCategory.STRAIGHT, 250, 10, 300, 100);
    t.is(line.toString(), 'Line', 'insertLine() should return a Line');
    t.is(layout.getLines().length, 1, 'Layout should have 1 line');

    // Test getPageElementById
    const element = layout.getPageElementById(shape.getObjectId());
    t.is(element.getObjectId(), shape.getObjectId(), 'getPageElementById should return correct element');

    // Test replaceAllText
    layout.replaceAllText('Hello', 'Goodbye');
    t.is(textBox.getText().asString(), 'Goodbye Layout\n', 'replaceAllText should work on layout');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesLayout);
