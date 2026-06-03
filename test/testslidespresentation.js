import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesPresentation = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slides Presentation & Page Core', (t) => {
    const presName = `gas-fakes-test-pres-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    t.is(pres.getName(), presName, 'getName() should match created name');
    t.is(typeof pres.getPageHeight(), 'number', 'getPageHeight should return a number');
    t.is(typeof pres.getPageWidth(), 'number', 'getPageWidth should return a number');

    // Test User Management (Mock delegation)
    const email = 'test@example.com';
    pres.addEditor(email);
    const editors = pres.getEditors();
    t.true(editors.some(u => u.getEmail() === email), 'addEditor should reflect in getEditors');

    // Test Page Element lookup
    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
    const found = pres.getPageElementById(shape.getObjectId());
    t.truthy(found, 'getPageElementById should find element across slides');
    t.is(found.getObjectId(), shape.getObjectId(), 'Found element ID should match');

    // Test PageBackground
    const bg = slide.getBackground();
    t.is(bg.toString(), 'PageBackground', 'getBackground should return PageBackground');
    bg.setSolidFill('#00ff00');
    t.is(bg.getType().toString(), 'SOLID', 'Background type should be SOLID');
    bg.setTransparent();
    t.is(bg.getType().toString(), 'NONE', 'Background type should be NONE after setTransparent');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesPresentation);
