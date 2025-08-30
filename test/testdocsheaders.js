import '../main.js';
import { initTests } from './testinit.js';
import { trasher, getDocsPerformance } from './testassist.js';
import { testDocsSection } from './testdocssections.js';

export const testDocsHeaders = (pack) => {
  const testPack = pack || initTests();
  const { unit, fixes } = testPack;

  const { toTrash } = testDocsSection(testPack, {
    sectionType: 'Header',
    addMethod: 'addHeader',
    getMethod: 'getHeader',
    dataPrefix: 'h'
  });

  if (!pack) {
    unit.report();
  }

  trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testDocsHeaders();
  ScriptApp.__behavior.trash()
  console.log('...cumulative docs cache performance', getDocsPerformance())
}
