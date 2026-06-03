import { Proxies } from '../../support/proxies.js';
import { newFakePageBackground } from './fakepagebackground.js';
import { newFakeColorScheme } from './fakecolorscheme.js';
import { newFakePageElement } from './fakepageelement.js';

export const newFakeNotesPage = (...args) => {
  return Proxies.guard(new FakeNotesPage(...args));
};

export class FakeNotesPage {
  constructor(slide) {
    this.__slide = slide;
  }

  get __resource() {
    const notesPage = this.__slide.__resource.slideProperties?.notesPage;
    if (!notesPage) {
      throw new Error(`NotesPage not found for slide ${this.__slide.getObjectId()}`);
    }
    return notesPage;
  }

  getObjectId() {
    return this.__resource.objectId;
  }

  getBackground() {
    return newFakePageBackground(this);
  }

  getColorScheme() {
    return newFakeColorScheme(this);
  }

  getPageElements() {
    return (this.__resource.pageElements || []).map(pe => newFakePageElement(pe, this));
  }

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

  getSpeakerNotesShape() {
    // In Google Slides, speaker notes are usually in a placeholder of type BODY or SLIDE_NUMBER on the notes page
    // Actually, there's a specific placeholder for speaker notes.
    return this.getPlaceholders().find(p => {
      const ph = p.__resource.shape?.placeholder;
      return ph?.type === 'BODY'; // Typical for speaker notes in API
    })?.asShape() || null;
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

  asLayout() { throw new Error('Cannot cast NotesPage to Layout'); }
  asSlide() { throw new Error('Cannot cast NotesPage to Slide'); }
  asMaster() { throw new Error('Cannot cast NotesPage to Master'); }

  toString() {
    return 'NotesPage';
  }
}
