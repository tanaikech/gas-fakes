import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';
import { testDocsSection } from './testdocssections.js';

export const testDocsFooters = (pack) => {
  const toTrash = [];
  const testPack = pack || initTests();
  const { unit, fixes } = testPack;

  const { toTrash: sectionTrash } = testDocsSection(testPack, {
    sectionType: 'Footer',
    addMethod: 'addFooter',
    getMethod: 'getFooter',
    dataPrefix: 'f'
  });
  toTrash.push(...sectionTrash);

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsFooters);
