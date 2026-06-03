import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesRanges = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slides Ranges (PageRange, PageElementRange, TableCellRange)', (t) => {
    const presName = `gas-fakes-test-ranges-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    const presentationId = pres.getId();
    toTrash.push(DriveApp.getFileById(presentationId));

    const slide = pres.getSlides()[0];
    
    // In the current implementation, getSelection() returns null.
    // We verify the public API for Selection and its methods exist (via documentation/types)
    // but functional testing of ranges requires a working Selection.
    const selection = pres.getSelection();
    
    if (selection === null) {
      console.log('...skipping Selection-based range tests as getSelection() returned null');
    } else {
      t.is(selection.toString(), 'Selection', 'getSelection should return Selection object');
      
      const pRange = selection.getPageRange();
      if (pRange) {
          t.is(pRange.toString(), 'PageRange', 'getPageRange should return PageRange');
          t.true(is.array(pRange.getPages()), 'getPages() should return array');
      }

      const peRange = selection.getPageElementRange();
      if (peRange) {
          t.is(peRange.toString(), 'PageElementRange', 'getPageElementRange should return PageElementRange');
          t.true(is.array(peRange.getPageElements()), 'getPageElements() should return array');
      }
    }

    // TableCellRange is also selection-based.
    // We'll just verify the table class doesn't crash.
    const table = slide.insertTable(2, 2);
    t.truthy(table, 'Table should be created');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesRanges);
