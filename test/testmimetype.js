import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest } from './testassist.js';

export const testMimeType = (pack) => {
  const { unit } = pack || initTests();

  unit.section('MimeType basics', (t) => {
    t.true(is.object(MimeType), 'MimeType should be an object');

    // Test some common MimeTypes
    t.is(MimeType.GOOGLE_DOCS, 'application/vnd.google-apps.document', 'GOOGLE_DOCS should have correct value');
    t.is(MimeType.GOOGLE_SHEETS, 'application/vnd.google-apps.spreadsheet', 'GOOGLE_SHEETS should have correct value');
    t.is(MimeType.GOOGLE_SLIDES, 'application/vnd.google-apps.presentation', 'GOOGLE_SLIDES should have correct value');
    t.is(MimeType.GOOGLE_FORMS, 'application/vnd.google-apps.form', 'GOOGLE_FORMS should have correct value');
    t.is(MimeType.FOLDER, 'application/vnd.google-apps.folder', 'FOLDER should have correct value');

    t.is(MimeType.PDF, 'application/pdf', 'PDF should have correct value');
    t.is(MimeType.JPEG, 'image/jpeg', 'JPEG should have correct value');
    t.is(MimeType.PNG, 'image/png', 'PNG should have correct value');
    t.is(MimeType.CSS, 'text/css', 'CSS should have correct value');
    t.is(MimeType.CSV, 'text/csv', 'CSV should have correct value');
    t.is(MimeType.HTML, 'text/html', 'HTML should have correct value');
    t.is(MimeType.JAVASCRIPT, 'application/javascript', 'JAVASCRIPT should have correct value');
    t.is(MimeType.PLAIN_TEXT, 'text/plain', 'PLAIN_TEXT should have correct value');
    t.is(MimeType.ZIP, 'application/zip', 'ZIP should have correct value');
  });

  if (!pack) {
    unit.report();
  }
  return { unit };
};

wrapupTest(testMimeType);
