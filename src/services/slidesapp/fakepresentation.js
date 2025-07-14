import { Proxies } from '../../support/proxies.js';

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

  toString() {
    return 'Presentation';
  }
}