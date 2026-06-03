import { Proxies } from '../../support/proxies.js';
import { newFakeSlide } from './fakeslide.js';
import { newFakeMaster } from './fakemaster.js';
import { newFakeNotesMaster } from './fakenotesmaster.js';
import { newFakeLayout } from './fakelayout.js';
import { newFakeColorScheme } from './fakecolorscheme.js';

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
   * @param {object} resource the presentation resurce from Slides API
   */
  constructor(resource) {
    this.__id = resource.presentationId;
  }
  get __file() {
    return DriveApp.getFileById(this.__id);
  }
  get __resource() {
    return Slides.Presentations.get(this.__id);
  }
  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }

  addEditor(emailAddress) {
    this.__file.addEditor(emailAddress);
    return this;
  }

  addEditors(emailAddresses) {
    this.__file.addEditors(emailAddresses);
    return this;
  }

  addViewer(emailAddress) {
    this.__file.addViewer(emailAddress);
    return this;
  }

  addViewers(emailAddresses) {
    this.__file.addViewers(emailAddresses);
    return this;
  }

  getEditors() {
    return this.__file.getEditors();
  }

  getViewers() {
    return this.__file.getViewers();
  }

  removeEditor(emailAddress) {
    this.__file.removeEditor(emailAddress);
    return this;
  }

  removeViewer(emailAddress) {
    this.__file.removeViewer(emailAddress);
    return this;
  }

  /**
   * Gets the ID of the presentation.
   * @returns {string} The presentation ID.
   */
  getId() {
    return this.__id;
  }

  /**
   * Gets the name of the presentation.
   * @returns {string} The presentation name.
   */
  getName() {
    return this.__resource.title;
  }

  setName(name) {
    this.__file.setName(name);
  }

  /**
   * Gets the URL of the presentation.
   * @returns {string} The presentation URL.
   */
  getUrl() {
    return `https://docs.google.com/presentation/d/${this.getId()}/edit`;
  }

  getPageHeight() {
    const size = this.__resource.pageSize;
    return this.__normalize(size?.height);
  }

  getPageWidth() {
    const size = this.__resource.pageSize;
    return this.__normalize(size?.width);
  }

  getNotesPageHeight() {
    const size = this.__resource.notesMaster?.notesVisualProperties?.pageSize || this.__resource.pageSize;
    return this.__normalize(size?.height);
  }

  getNotesPageWidth() {
    const size = this.__resource.notesMaster?.notesVisualProperties?.pageSize || this.__resource.pageSize;
    return this.__normalize(size?.width);
  }

  __normalize(val) {
    if (!val) return 0;
    if (typeof val === 'number') {
      return val > 5000 ? val / 12700 : val;
    }
    if (typeof val.magnitude === 'number') {
      const isEMU = val.unit === 'EMU' || val.magnitude > 5000;
      return isEMU ? val.magnitude / 12700 : val.magnitude;
    }
    return val || 0;
  }

  /**
   * Gets the masters in the presentation.
   * @returns {FakeMaster[]} The masters.
   */
  getMasters() {
    return (this.__resource.masters || []).map(m => newFakeMaster(m, this));
  }

  /**
   * Gets the layouts in the presentation.
   * @returns {FakeLayout[]} The layouts.
   */
  getLayouts() {
    return (this.__resource.layouts || []).map(l => newFakeLayout(l, this));
  }

  /**
   * Gets a master by its ID.
   * @param {string} id The master ID.
   * @returns {FakeMaster | null} The master, or null if not found.
   */
  getMasterById(id) {
    return this.getMasters().find(m => m.getObjectId() === id) || null;
  }

  /**
   * Gets the notes master in the presentation.
   * @returns {FakeNotesMaster | null} The notes master.
   */
  getNotesMaster() {
    const notesMaster = this.__resource.notesMaster;
    return notesMaster ? newFakeNotesMaster(notesMaster, this) : null;
  }

  /**
   * Gets the slides in the presentation.
   * @returns {FakeSlide[]} The slides.
   */
  getSlides() {
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

  getPageElementById(id) {
    const pages = [...this.getSlides(), ...this.getLayouts(), ...this.getMasters()];
    const nm = this.getNotesMaster();
    if (nm) pages.push(nm);

    for (const page of pages) {
        const el = page.getPageElementById(id);
        if (el) return el;
    }
    return null;
  }

  getSelection() {
    return null; // Mock
  }

  replaceAllText(findText, replaceText, matchCase = false) {
    const requests = [{
      replaceAllText: {
        replaceText,
        containsText: {
          text: findText,
          matchCase
        }
      }
    }];
    const response = Slides.Presentations.batchUpdate({ requests }, this.getId());
    return response.replies[0].replaceAllText.occurrencesChanged || 0;
  }

  /**
   * Appends a new slide to the presentation.
   * @param {string} [layout] The layout to use (optional).
   * @returns {FakeSlide} The new slide.
   */
  appendSlide(layout) {
    const objectId = `slide_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createSlide: {
        objectId,
        slideLayoutReference: layout ? { predefinedLayout: layout } : { predefinedLayout: 'BLANK' }
      }
    }];
    try {
      Slides.Presentations.batchUpdate({ requests }, this.getId());
    } catch (err) {
      // If it already exists, it means a previous attempt succeeded but timed out
      if (!err?.message?.includes('already exists')) throw err;
    }
    return this.getSlideById(objectId);
  }

  /**
   * Inserts a new slide at the specified index.
   * @param {number} index The index to insert at.
   * @param {string} [layout] The layout to use (optional).
   * @returns {FakeSlide} The new slide.
   */
  insertSlide(index, layout) {
    const objectId = `slide_${Math.random().toString(36).substring(2, 11)}`;
    const requests = [{
      createSlide: {
        objectId,
        insertionIndex: index,
        slideLayoutReference: layout ? { predefinedLayout: layout } : { predefinedLayout: 'BLANK' }
      }
    }];
    try {
      Slides.Presentations.batchUpdate({ requests }, this.getId());
    } catch (err) {
      if (!err?.message?.includes('already exists')) throw err;
    }
    return this.getSlideById(objectId);
  }

  toString() {
    return 'Presentation';
  }
}