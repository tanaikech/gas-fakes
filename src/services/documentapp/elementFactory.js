import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { newFakeParagraph } from './fakeparagraph.js';
// import other element types as they are created...

const extractText = (se) => {
  if (!se || !se.paragraph || !se.paragraph.elements) return '';
  // The getText() method for a paragraph in Apps Script does not include the
  // trailing newline that marks the end of the paragraph in the API response.
  return se.paragraph.elements?.map(element => {
    return element.textRun ? element.textRun.content : '';
  }).join('').replace(/\n$/, '') || '';
};

export const createElement = (parent, se) => {
  if (!se) return null;

  if (se.paragraph) {
    return newFakeParagraph(extractText(se), parent, se);
  }

  // if (se.table) { ... }

  // Default to a base element for unsupported types
  return Proxies.guard(new FakeElement(parent, se));
};