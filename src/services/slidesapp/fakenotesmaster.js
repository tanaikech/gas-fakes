import { Proxies } from '../../support/proxies.js';
import { newFakeColorScheme } from './fakecolorscheme.js';
import { newFakePageBackground } from './fakepagebackground.js';
import { newFakePageElement } from './fakepageelement.js';

export const newFakeNotesMaster = (...args) => {
  return Proxies.guard(new FakeNotesMaster(...args));
};

export class FakeNotesMaster {
  constructor(resource, presentation) {
    this.__id = resource.objectId;
    this.__presentation = presentation;
  }

  get __resource() {
    const presentationResource = this.__presentation.__resource;
    const notesMaster = presentationResource.notesMaster;
    if (!notesMaster || notesMaster.objectId !== this.__id) {
      throw new Error(`NotesMaster with ID ${this.__id} not found`);
    }
    return notesMaster;
  }

  getObjectId() {
    return this.__id;
  }

  /**
   * Gets the background of the notes master.
   * @returns {FakePageBackground} The background.
   */
  getBackground() {
    return newFakePageBackground(this);
  }

  /**
   * Gets the color scheme of the notes master.
   * @returns {FakeColorScheme} The color scheme.
   */
  getColorScheme() {
    return newFakeColorScheme(this);
  }

  /**
   * Gets the list of page elements on the notes master.
   * @returns {FakePageElement[]} The page elements.
   */
  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => newFakePageElement(pe, this));
  }

  /**
   * Gets a page element by ID.
   * @param {string} id The ID.
   * @returns {FakePageElement|null} The element.
   */
  getPageElementById(id) {
    return this.getPageElements().find(pe => pe.getObjectId() === id) || null;
  }

  getGroups() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'GROUP')
      .map(pe => pe.asGroup());
  }

  getImages() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'IMAGE')
      .map(pe => pe.asImage());
  }

  getLines() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'LINE')
      .map(pe => pe.asLine());
  }

  getShapes() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'SHAPE')
      .map(pe => pe.asShape());
  }

  getTables() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'TABLE')
      .map(pe => pe.asTable());
  }

  getVideos() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'VIDEO')
      .map(pe => pe.asVideo());
  }

  getWordArts() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'WORD_ART')
      .map(pe => pe.asWordArt());
  }

  getSheetsCharts() {
    return this.getPageElements()
      .filter(pe => pe.getPageElementType().toString() === 'SHEETS_CHART')
      .map(pe => pe.asSheetsChart());
  }

  getPlaceholders() {
    return this.getPageElements().filter(pe => pe.__resource.shape?.placeholder || pe.__resource.image?.placeholder);
  }

  getPlaceholder(placeholderType, index = 0) {
    const typeStr = placeholderType.toString();
    return this.getPlaceholders().find(p => {
      const ph = p.__resource.shape?.placeholder || p.__resource.image?.placeholder;
      return ph.type === typeStr && (ph.index === index || (index === 0 && ph.index === undefined));
    }) || null;
  }

  toString() {
    return 'NotesMaster';
  }
}
