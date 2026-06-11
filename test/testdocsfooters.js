import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';
import { testDocsSections } from './testdocssections.js';

export const testDocsFooters = (pack) => {

  const testPack = pack || initTests();
  const { unit, fixes } = testPack;

  testDocsSections(testPack, {
    sectionType: 'Footer',
    addMethod: 'addFooter',
    getMethod: 'getFooter',
    dataPrefix: 'f'
  });

  if (!pack) {
    unit.report();
  }

  return { unit, fixes };
};

wrapupTest(testDocsFooters);
