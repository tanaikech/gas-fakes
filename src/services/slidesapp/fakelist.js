import { Proxies } from '../../support/proxies.js';
import { newFakeParagraph } from './fakeparagraph.js';
import { newFakeTextRange } from './faketextrange.js';

/**
 * create a new FakeList instance
 * @param  {...any} args 
 * @returns {FakeList}
 */
export const newFakeList = (...args) => {
  return Proxies.guard(new FakeList(...args));
};

export class FakeList {
  constructor(listId, presentation, shape) {
    this.__listId = listId;
    this.__presentation = presentation;
    this.__shape = shape;
  }

  getListId() {
    return this.__listId;
  }

  getListParagraphs() {
    // Find all paragraphs in the shape that belong to this list
    return this.__shape.getText().getParagraphs().filter(p => {
        const style = p.getRange().getListStyle();
        return style.isInList() && style.getList().getListId() === this.__listId;
    });
  }

  toString() {
    return 'List';
  }
}
