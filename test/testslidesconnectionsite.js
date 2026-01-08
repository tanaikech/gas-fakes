
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher, compareValue } from './testassist.js';

export const testSlidesConnectionSite = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('ConnectionSite class methods', (t) => {
    const presName = `gas-fakes-test-connectionsite-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX);

    // Test getConnectionSites()
    const sites = shape.getConnectionSites();
    t.is(sites.length, 4, 'Should return 4 connection sites by default');

    // Test ConnectionSite methods on first site
    const site = sites[0];
    // In live GAS toString() often returns 'Object', so we check property instead
    t.truthy(site.getIndex() !== undefined, 'Should be a ConnectionSite object');
    t.is(site.getIndex(), 0, 'First site should have index 0');

    // Verify getPageElement() returns a PageElement (could be Shape)
    const element = site.getPageElement();
    t.truthy(element, 'Should return a page element');
    t.is(element.getObjectId(), shape.getObjectId(), 'Page element ID should match the shape');

    // Test Connector and Connection
    // Apps Script uses insertLine with LineCategory for connectors
    const connector = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, 10, 10, 100, 100);
    t.truthy(connector, 'Should return Line object (acting as connector)');

    // Initial connections should be null
    t.is(connector.getStartConnection(), null, 'Initial start connection should be null');
    t.is(connector.getEndConnection(), null, 'Initial end connection should be null');

    // Set connection
    connector.setStartConnection(sites[1]);
    const startConn = connector.getStartConnection();
    t.truthy(startConn, 'Start connection should exist after setting');

    // ConnectionSite object has getIndex()
    t.is(startConn.getIndex(), 1, 'Connected site index should match');

    // Test isConnector
    t.truthy(connector.isConnector(), 'Should be a connector');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesConnectionSite);
