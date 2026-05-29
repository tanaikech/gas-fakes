import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesGroup = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Group and PageElement grouping methods', (t) => {
    const presName = `gas-fakes-test-group-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape1 = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 50, 100, 100);
    const shape2 = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 200, 200, 100, 100);

    // Test grouping
    const group = slide.group([shape1, shape2]);
    t.is(group.toString(), 'Group', 'group() should return a Group object');
    t.is(group.getPageElementType().toString(), 'GROUP', 'getPageElementType() should return GROUP enum');

    // Test getChildren()
    const children = group.getChildren();
    t.is(children.length, 2, 'Group should contain 2 children');
    t.is(children[0].getObjectId(), shape1.getObjectId(), 'First child should be shape1');
    t.is(children[1].getObjectId(), shape2.getObjectId(), 'Second child should be shape2');

    // Test ungroup()
    group.ungroup();
    t.truthy(t.threw(() => group.getChildren()), 'getChildren() after ungroup should throw exception');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesGroup);
