import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { testDocsSection } from './testdocssections.js';
import { wrapupTest, trasher } from './testassist.js';

export const testDocsHeaders = (pack) => {
  const toTrash = [];
  const testPack = pack || initTests();
  const { unit, fixes } = testPack;

  const { toTrash: sectionTrash } = testDocsSection(testPack, {
    sectionType: 'Header',
    addMethod: 'addHeader',
    getMethod: 'getHeader',
    dataPrefix: 'h'
  });
  toTrash.push(...sectionTrash);

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testDocsHeaders);