
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testDebugMove = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Debug Slide Move', (t) => {
    const presName = `gas-fakes-debug-move-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    // Create 4 slides: [0, 1, 2, 3]
    // 0 is default
    const s1 = pres.appendSlide();
    const s2 = pres.appendSlide();
    const s3 = pres.appendSlide();

    // Check IDs
    const slides = pres.getSlides();
    console.log('Initial Order:');
    slides.forEach((s, i) => console.log(`Index ${i}: ${s.getObjectId()}`));

    // Move slide at index 0 to index 2
    // Expected: [1, 2, 0, 3]
    const slideToMove = slides[0];
    const originalId = slideToMove.getObjectId();

    console.log(`Moving ID ${originalId} (Index 0) to Index 2`);

    slideToMove.move(2);

    // Check IDs after move
    const slidesAfter = pres.getSlides();
    console.log('After Move Order:');
    slidesAfter.forEach((s, i) => console.log(`Index ${i}: ${s.getObjectId()}`));

    t.is(slidesAfter[2].getObjectId(), originalId, 'Slide should be moved to index 2');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

if (ScriptApp.isFake) testDebugMove();
