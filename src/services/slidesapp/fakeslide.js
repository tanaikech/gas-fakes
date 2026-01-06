import { Proxies } from '../../support/proxies.js';
import {
  newFakeNotesPage,
  newFakeLayout,
  newFakeMaster,
  newFakePageElement,
  newFakePageBackground
} from './fakesupporting.js';

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
    return notesPage ? newFakeNotesPage(notesPage) : null;
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
    return layout ? newFakeLayout(layout) : null;
  }

  /**
   * Gets the master the slide is based on.
   * @returns {FakeMaster} The master.
   */
  getMaster() {
    const masterId = this.__resource.slideProperties?.masterObjectId;
    if (!masterId) return null;

    // We need to find the master in the presentation
    const presentationId = this.__presentation.getId();
    const presentation = Slides.Presentations.get(presentationId);
    const master = presentation.masters.find(m => m.objectId === masterId);
    return master ? newFakeMaster(master) : null;
  }

  /**
   * Gets the list of page elements on the slide.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => newFakePageElement(pe));
  }

  /**
   * Gets the background of the slide.
   * @returns {FakePageBackground} The background.
   */
  getBackground() {
    const background = this.__resource.pageBackgroundFill;
    return background ? newFakePageBackground(background) : null;
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

    // Calculate current index to adjust insertionIndex if moving forward
    const slides = this.__presentation.__resource.slides || [];
    const currentIndex = slides.findIndex(s => s.objectId === this.getObjectId());

    let insertionIndex = index;
    if (currentIndex !== -1 && index > currentIndex) {
      insertionIndex = index + 1;
    }

    Slides.Presentations.batchUpdate([{
      updateSlidesPosition: {
        slideObjectIds: [this.getObjectId()],
        insertionIndex: insertionIndex
      }
    }], presentationId);
  }

  toString() {
    return 'Slide';
  }
}
