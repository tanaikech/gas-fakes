
import { ElementType } from "../enums/docsenums.js";
import { Utils } from "../../support/utils.js";
import { newFakeElement } from "./fakeelement.js";
import { newShadowParagraph } from "./shadow/paragraph.js";

const { getEnumKeys } = Utils

export const extractText = (se) => {
  if (!se || !se.paragraph || !se.paragraph.elements) return '';
  // The getText() method for a paragraph in Apps Script does not include the
  // trailing newline that marks the end of the paragraph in the API response.
  return se.paragraph.elements?.map(element => {
    return element.textRun ? element.textRun.content : '';
  }).join('').replace(/\n$/, '') || '';
};


export const getSeType = (se) => {
  const keys = getEnumKeys(ElementType)
  const [type] = Reflect.ownKeys(se)
    .map(f => f.toUpperCase())
    .filter(key => keys.includes(key))

  if (!type) {
    throw new Error('couldnt establish structural element type')
  }
  return type
}

let newFakeParagraphFactory;

/**
 * Injects the FakeParagraph factory to avoid circular dependencies.
 * @param {function} factory - The newFakeParagraph function.
 */
export const setParagraphFactory = (factory) => {
  newFakeParagraphFactory = factory;
};

export const create = (parent, se) => {
  const type = getSeType(se)
  switch (type) {
    case ElementType.PARAGRAPH:
      {
        if (!newFakeParagraphFactory) {
          throw new Error('Circular dependency not resolved: newFakeParagraphFactory is not set.');
        }
        const shadowDocument = parent.__shadowContainer.__shadowDocument;
        const shadowParagraph = newShadowParagraph(shadowDocument, se);
        return newFakeParagraphFactory(shadowParagraph, se);
      }
    default:
      return newFakeElement(parent, se);
  }
}