import { Proxies } from '../../support/proxies.js';
import { newFakeNotesPage } from './fakenotespage.js';
import { newFakeLayout } from './fakelayout.js';
import { newFakeMaster } from './fakemaster.js';
import { newFakePageElement } from './fakepageelement.js';
import { newFakePageBackground } from './fakepagebackground.js';

export const newFakeSlide = (...args) => {
  return Proxies.guard(new FakeSlide(...args));
};

/**
 * @class FakeSlide
 * A fake for the Slide class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/slides/slide
 */
export class FakeSlide {
  /**
   * @param {object} resource the slide resource from Slides API
   * @param {FakePresentation} presentation the parent presentation
   */
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const slide = (presentationResource.slides || []).find(s => s.objectId === this.__id);

    if (!slide) {
      throw new Error(`Slide with ID ${this.__id} not found`);
    }
    return slide;
  }

  /**
   * Gets the unique ID for the slide.
   * @returns {string} The slide ID.
   */
  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the notes page of the slide.
   * @returns {FakeNotesPage} The notes page.
   */
  getNotesPage() {
    const notesPage = this.__resource.slideProperties?.notesPage;
    return notesPage ? newFakeNotesPage(this) : null;
  }

  /**
   * Gets the layout the slide is based on.
   * @returns {FakeLayout} The layout.
   */
  getLayout() {
    const layoutId = this.__resource.slideProperties?.layoutObjectId;
    if (!layoutId) return null;

    // We need to find the layout in the presentation
    const presentationId = this.__presentation.getId();
    const presentation = Slides.Presentations.get(presentationId);
    const layout = presentation.layouts.find(l => l.objectId === layoutId);
    return layout ? newFakeLayout(layout, this.__presentation) : null;
  }



  /**
   * Gets the list of page elements on the slide.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => newFakePageElement(pe, this));
  }

  /**
   * Gets the background of the slide.
   * @returns {FakePageBackground} The background.
   */
  getBackground() {
    const background = this.__resource.pageBackgroundFill;
    return background ? newFakePageBackground(this) : null;
  }

  /**
   * Deletes the slide.
   */
  remove() {
    const presentationId = this.__presentation.getId();
    Slides.Presentations.batchUpdate([{
      deleteObject: {
        objectId: this.getObjectId()
      }
    }], presentationId);
  }

  /**
   * Duplicates the slide.
   * @returns {FakeSlide} The new slide.
   */
  duplicate() {
    const presentationId = this.__presentation.getId();
    const result = Slides.Presentations.batchUpdate([{
      duplicateObject: {
        objectId: this.getObjectId()
      }
    }], presentationId);

    // The result contains the new object ID
    const newObjectId = result.replies[0].duplicateObject.objectId;
    // We need to get the updated presentation to find the new slide resource
    const updatedPresentation = Slides.Presentations.get(presentationId);
    const newSlideResource = updatedPresentation.slides.find(s => s.objectId === newObjectId);
    return newFakeSlide(newSlideResource, this.__presentation);
  }

  /**
   * Moves the slide to a new position.
   * @param {number} index The new index.
   */
  move(index) {
    const presentationId = this.__presentation.getId();

    Slides.Presentations.batchUpdate([{
      updateSlidesPosition: {
        slideObjectIds: [this.getObjectId()],
        insertionIndex: index
      }
    }], presentationId);
  }

  toString() {
    return 'Slide';
  }
}
