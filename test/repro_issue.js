
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes';
import { initTests } from './testinit.js';
import { wrapupTest, trasher } from './testassist.js';

export const testReproStaleSlide = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section('Reproduction of stale slide resource', (t) => {
    const presName = `gas-fakes-repro-${new Date().getTime()}`;
    const pres = SlidesApp.create(presName);
    toTrash.push(DriveApp.getFileById(pres.getId()));

    const slide = pres.getSlides()[0];
    const slideId = slide.getObjectId();

    // Verify initial state (shouldn't have notes page or it handles it gracefully)
    // Actually, let's just use something we can change.
    // Let's rely on the fact that we can modify the slide via API and check if 'slide' instance sees it.

    // We'll perform a raw update to change the slide background or something visible in resource.
    // Or we can use pageElements.

    // Let's add a shape via raw API (or if FakeSlide had methods we'd use them, but it lacks addShape).
    // Presentation.appendSlide uses batchUpdate.

    // Let's update the background color via API.
    const requests = [{
      updatePageElementTransform: {
        objectId: slideId,
        transform: {
          scaleX: 2.0,
          unit: 'PT'
        },
        applyMode: 'RELATIVE'
      }
    }];
    // Wait, let's try something simpler. 
    // If we can't easily modify properties that FakeSlide exposes (getLayout, getBackground, etc.) without more complex setup.
    // FakeSlide.getObjectId() is constant.
    // FakeSlide.getPageElements() returns array of FakePageElement.

    // Let's insert a text box via raw API into this slide.
    const textBoxId = 'MyTextBox_' + new Date().getTime();
    Slides.Presentations.batchUpdate([{
      createShape: {
        objectId: textBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            height: { magnitude: 3000000, unit: 'EMU' },
            width: { magnitude: 3000000, unit: 'EMU' }
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 100000,
            translateY: 100000,
            unit: 'EMU'
          }
        }
      }
    }], pres.getId());

    // Now check if slide.getPageElements() includes the new shape.
    const elements = slide.getPageElements();
    const found = elements.some(e => e.getObjectId() === textBoxId);

    // In current implementation, 'slide' has cached resource, so it won't have the new element in 'pageElements' array.
    // So this assertion should fail if the bug exists.
    t.true(found, 'Slide should see the newly added page element (dynamic resource)');

  });

  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

// wrapupTest(testReproStaleSlide);
