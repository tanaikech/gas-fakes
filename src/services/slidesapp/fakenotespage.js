import { Proxies } from '../../support/proxies.js';

export const newFakeNotesPage = (...args) => {
  return Proxies.guard(new FakeNotesPage(...args));
};

export class FakeNotesPage {
  constructor(slide) {
    this.__slide = slide;
  }
  get __resource() {
    // notesPage is a property of slideProperties
    const notesPage = this.__slide.__resource.slideProperties?.notesPage;
    return notesPage || null;
  }
  toString() {
    return 'NotesPage';
  }
}
