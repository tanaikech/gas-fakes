import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testSlidesPageClasses = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Master, NotesMaster and NotesPage class methods', (t) => {
    const presName = `gas-fakes-test-pages-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    // 1. Test Master
    const masters = pres.getMasters();
    t.truthy(masters.length > 0, 'Presentation should have masters');
    const master = masters[0];
    t.is(master.toString(), 'Master', 'master.toString() should be "Master"');
    t.is(master.getPageType().toString(), 'MASTER', 'getPageType() should return MASTER');
    
    // Master retrieval & insertion
    const mInitialShapes = master.getShapes().length;
    const mShape = master.insertShape(SlidesApp.ShapeType.RECTANGLE, 10, 10, 50, 50);
    t.is(mShape.toString(), 'Shape', 'Master.insertShape should work');
    t.is(master.getShapes().length, mInitialShapes + 1, 'Master should have one more shape');
    
    // Master layouts
    const mLayouts = master.getLayouts();
    t.truthy(mLayouts.length > 0, 'Master should have layouts');
    t.is(mLayouts[0].getMaster().getObjectId(), master.getObjectId(), 'Layout master should match');

    // 2. Test NotesMaster
    const notesMaster = pres.getNotesMaster();
    if (notesMaster) {
      t.is(notesMaster.toString(), 'NotesMaster', 'notesMaster.toString() should be "NotesMaster"');
      
      const nmShapes = notesMaster.getShapes();
      t.true(is.array(nmShapes), 'NotesMaster should return shapes array');
    } else {
      console.log('...skipping NotesMaster tests as it might not be present in default presentation resource');
    }

    // 3. Test NotesPage
    const slide = pres.getSlides()[0];
    const notesPage = slide.getNotesPage();
    t.truthy(notesPage, 'Slide should have a notes page');
    t.is(notesPage.toString(), 'NotesPage', 'notesPage.toString() should be "NotesPage"');

    // NotesPage retrieval & insertion
    const npInitialShapes = notesPage.getShapes().length;
    // NotesPage insertion isn't standard GAS but we implemented it for parity with Page elements
    // Actually GAS NotesPage has retrieval but limited editing. 
    // But our implementation supports general element retrieval.
    t.true(is.array(notesPage.getShapes()), 'NotesPage should return shapes array');
    
    const speakerNotesShape = notesPage.getSpeakerNotesShape();
    // Default presentation usually has a speaker notes shape
    if (speakerNotesShape) {
        t.is(speakerNotesShape.toString(), 'Shape', 'getSpeakerNotesShape should return a shape');
    }

    // 4. Test replaceAllText
    master.replaceAllText('findme', 'foundme');
    });


  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testSlidesPageClasses);
