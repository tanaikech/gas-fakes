import { Proxies } from '../../support/proxies.js';
import { newFakeSlide } from './fakeslide.js';

export const newFakePresentation = (...args) => {
  return Proxies.guard(new FakePresentation(...args));
};

/**
 * @class FakePresentation
 * A fake for the Presentation class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/slides/presentation
 */
export class FakePresentation {
  /**
   * @param {object} resource the presentation resource from Slides API
   */
  constructor(resource) {
    this.__resource = resource;
  }
  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }
  /**
   * Gets the ID of the presentation.
   * @returns {string} The presentation ID.
   */
  getId() {
    return this.__resource.presentationId;
  }

  /**
   * Gets the name of the presentation.
   * @returns {string} The presentation name.
   */
  getName() {
    return this.__resource.title;
  }

  /**
   * Gets the URL of the presentation.
   * @returns {string} The presentation URL.
   */
  getUrl() {
    return `https://docs.google.com/presentation/d/${this.getId()}/edit`;
  }

  /**
   * Gets the slides in the presentation.
   * @returns {FakeSlide[]} The slides.
   */
  getSlides() {
    // We need to ensure we have the latest resource
    const presentation = Slides.Presentations.get(this.getId());
    this.__resource = presentation;
    return (this.__resource.slides || []).map(s => newFakeSlide(s, this));
  }

  /**
   * Gets a slide by its ID.
   * @param {string} id The slide ID.
   * @returns {FakeSlide | null} The slide, or null if not found.
   */
  getSlideById(id) {
    return this.getSlides().find(s => s.getObjectId() === id) || null;
  }

  /**
   * Appends a new slide to the presentation.
   * @param {string} [layout] The layout to use (optional).
   * @returns {FakeSlide} The new slide.
   */
  appendSlide(layout) {
    const requests = [{
      createSlide: {
        slideLayoutReference: layout ? { predefinedLayout: layout } : { predefinedLayout: 'BLANK' }
      }
    }];
    const result = Slides.Presentations.batchUpdate(requests, this.getId());
    const newObjectId = result.replies[0].createSlide.objectId;
    return this.getSlideById(newObjectId);
  }

  /**
   * Inserts a new slide at the specified index.
   * @param {number} index The index to insert at.
   * @param {string} [layout] The layout to use (optional).
   * @returns {FakeSlide} The new slide.
   */
  insertSlide(index, layout) {
    const requests = [{
      createSlide: {
        insertionIndex: index,
        slideLayoutReference: layout ? { predefinedLayout: layout } : { predefinedLayout: 'BLANK' }
      }
    }];
    const result = Slides.Presentations.batchUpdate(requests, this.getId());
    const newObjectId = result.replies[0].createSlide.objectId;
    return this.getSlideById(newObjectId);
  }

  toString() {
    return 'Presentation';
  }
}