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

    // Test scaling methods on child element (shape1 has defined size)
    const initialHeight = shape1.getHeight();
    const initialWidth = shape1.getWidth();
    shape1.scaleHeight(1.5);
    shape1.scaleWidth(2.0);
    t.truthy(Math.abs(shape1.getHeight() - initialHeight * 1.5) < 0.5, 'scaleHeight should scale the height by 1.5');
    t.truthy(Math.abs(shape1.getWidth() - initialWidth * 2.0) < 0.5, 'scaleWidth should scale the width by 2.0');

    // Test rotation methods
    t.is(group.getRotation(), 0, 'initial group rotation should be 0');
    group.setRotation(45);
    t.is(group.getRotation(), 45, 'getRotation should return 45 after setRotation(45)');

    // Test selection methods
    try {
      t.truthy(group.select(), 'select() should execute successfully');
      t.truthy(group.select(false), 'select(false) should execute successfully');
    } catch (e) {
      t.truthy(
        e.message.includes('active presentation'),
        'select() should throw active presentation exception on live GAS'
      );
    }

    // Test duplicate method
    const dupElement = group.duplicate();
    t.is(dupElement.toString(), 'PageElement', 'duplicate() should return a PageElement');
    t.not(dupElement.getObjectId(), group.getObjectId(), 'duplicated group should have a different object ID');

    const dupGroup = dupElement.asGroup();
    t.is(dupGroup.toString(), 'Group', 'asGroup() on duplicated element should return a Group');
    t.is(dupGroup.getChildren().length, 2, 'duplicated group should contain 2 children');

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
