import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesSlide = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Slide class methods', (t) => {
    const presName = `gas-fakes-test-slide-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    // Test getSlides() and appendSlide()
    const initialSlides = pres.getSlides();
    t.is(initialSlides.length, 1, 'New presentation should have 1 slide by default');

    const slide2 = pres.appendSlide();
    const slidesAfterAppend = pres.getSlides();
    t.is(slidesAfterAppend.length, 2, 'Presentation should have 2 slides after append');
    t.is(slide2.getObjectId(), slidesAfterAppend[1].getObjectId(), 'Appended slide should be the last slide');

    // Test insertSlide()
    const slide3 = pres.insertSlide(1);
    const slidesAfterInsert = pres.getSlides();
    t.is(slidesAfterInsert.length, 3, 'Presentation should have 3 slides after insert');
    t.is(slide3.getObjectId(), slidesAfterInsert[1].getObjectId(), 'Inserted slide should be at the correct index');

    // Test getObjectId()
    t.true(is.nonEmptyString(slide2.getObjectId()), 'Slide should have an object ID');

    // Test duplicate()
    const duplicatedSlide = slide2.duplicate();
    const slidesAfterDuplicate = pres.getSlides();
    t.is(slidesAfterDuplicate.length, 4, 'Presentation should have 4 slides after duplicate');
    t.is(duplicatedSlide.toString(), 'Slide', 'Duplicated slide toString() should be "Slide"');

    // Test move()
    const slideToMove = slidesAfterDuplicate[0];
    const originalId = slideToMove.getObjectId();
    console.log('Slides before move:', slidesAfterDuplicate.map(s => s.getObjectId()));
    console.log('Moving slide with ID:', originalId, 'to index 2');

    slideToMove.move(2);

    const slidesAfterMove = pres.getSlides();
    console.log('Slides after move:', slidesAfterMove.map(s => s.getObjectId()));

    // Moving 0 to 2 means insert before item at index 2 (which is the 3rd item).
    // Original list: [s0, s1, s2, s3]
    // Move s0 to 2: [s1, s0, s2, s3] -> s0 is now at index 1.
    t.is(slidesAfterMove[1].getObjectId(), originalId, 'Slide should be moved to the correct index (1)');

    // Test remove()
    const slideToRemove = slidesAfterMove[0];
    const idToRemove = slideToRemove.getObjectId();
    slideToRemove.remove();
    const slidesAfterRemove = pres.getSlides();
    t.is(slidesAfterRemove.length, 3, 'Presentation should have 3 slides after remove');
    t.false(slidesAfterRemove.some(s => s.getObjectId() === idToRemove), 'Slide should be removed from presentation');

    // Test supporting objects (minimal check)
    t.is(slide2.getNotesPage().toString(), 'NotesPage', 'getNotesPage() should return a NotesPage object');
    t.is(slide2.getLayout().toString(), 'Layout', 'getLayout() should return a Layout object');
    const master = slide2.getLayout().getMaster();
    if (master) {
      t.is(master.toString(), 'Master', 'getLayout().getMaster() should return a Master object');
    }
    t.true(is.array(slide2.getPageElements()), 'getPageElements() should return an array');
  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesSlide);
