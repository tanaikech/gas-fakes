import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance } from './testassist.js';
import { testDocsSection } from './testdocssections.js';

export const testDocsFooters = (pack) => {
  const testPack = pack || initTests();
  const { unit, fixes } = testPack;

  const { toTrash } = testDocsSection(testPack, {
    sectionType: 'Footer',
    addMethod: 'addFooter',
    getMethod: 'getFooter',
    dataPrefix: 'f'
  });

  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsFooters();
  ScriptApp.__behavior.trash()
  console.log('...cumulative docs cache performance', getDocsPerformance())
}
