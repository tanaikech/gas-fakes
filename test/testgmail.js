import is from '@sindresorhus/is';
import '../main.js';
import { initTests } from './testinit.js';
import { getGmailPerformance, wrapupTest, getDrivePerformance, trasher } from './testassist.js';

export const testGmail = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('gmail labels', (t) => {

  });


  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testGmail);
