
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, compareValue } from './testassist.js';

export const testSlidesLineProps = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Line class properties and methods', (t) => {
    const presName = `gas-fakes-test-lineprops-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const line = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, 10, 20, 110, 120);

    // Test geometric properties
    t.is(Math.round(line.getLeft()), 10, 'Initial left should be 10');
    t.is(Math.round(line.getTop()), 20, 'Initial top should be 20');

    line.setLeft(50).setTop(60);
    t.is(Math.round(line.getLeft()), 50, 'Updated left should be 50');
    t.is(Math.round(line.getTop()), 60, 'Updated top should be 60');

    line.setWidth(100).setHeight(200);
    t.is(Math.round(line.getWidth()), 100, 'Updated width should be 100');
    t.is(Math.round(line.getHeight()), 200, 'Updated height should be 200');

    // Test appearance properties
    line.setWeight(2.5);
    t.is(line.getWeight(), 2.5, 'Weight should be 2.5');

    line.setDashStyle(SlidesApp.DashStyle.DASH);
    compareValue(t, line.getDashStyle(), SlidesApp.DashStyle.DASH, 'DashStyle should be DASH');

    line.setStartArrow(SlidesApp.ArrowStyle.STEALTH_ARROW);
    compareValue(t, line.getStartArrow(), SlidesApp.ArrowStyle.STEALTH_ARROW, 'StartArrow should be STEALTH_ARROW');

    line.setEndArrow(SlidesApp.ArrowStyle.FILL_ARROW);
    compareValue(t, line.getEndArrow(), SlidesApp.ArrowStyle.FILL_ARROW, 'EndArrow should be FILL_ARROW');

    // Test point positions
    const start = line.getStart();
    t.is(Math.round(start.getX()), 50, 'Start X should match left');
    t.is(Math.round(start.getY()), 60, 'Start Y should match top');

    line.setEnd(200, 300);
    const end = line.getEnd();
    t.is(Math.round(end.getX()), 200, 'End X should be close to 200');
    t.is(Math.round(end.getY()), 300, 'End Y should be close to 300');

    // Test PageElementType return value (Enum)
    compareValue(t, line.getPageElementType(), SlidesApp.PageElementType.LINE, 'PageElementType should be LINE enum');

    // Test metadata
    line.setTitle('My Line').setDescription('A test line');
    t.is(line.getTitle(), 'My Line', 'Title should match');
    t.is(line.getDescription(), 'A test line', 'Description should match');

    // Test linking
    line.setLinkUrl('https://example.com');
    const link = line.getLink();
    t.truthy(link, 'Link should exist');
    t.is(link.getUrl(), 'https://example.com', 'Link URL should match');
    compareValue(t, link.getLinkType(), SlidesApp.LinkType.URL, 'Link type should be URL');

    line.removeLink();
    t.is(line.getLink(), null, 'Link should be removed');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesLineProps);
