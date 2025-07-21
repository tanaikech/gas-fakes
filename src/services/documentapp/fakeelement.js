import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { ElementType } from '../enums/docsenums.js';

// the subclasses like paragraph are extensions of element, so we'll implement the shared ones here
// with placeholders for the others which we'll remove as they are implemented in the subclass
const propsWaitingRoom = [ 
  'addPositionedImage',
  'appendHorizontalRule',
  'appendInlineImage',
  'appendPageBreak',
  'appendText',
  'asAnchoredDrawing',
  'asBody',
  'asCodeSnippet',
  'asCommentSection',
  'asDate',
  'asDocumentBodySection',
  'asDocumentElement',
  'asEquation',
  'asEquationFunction',
  'asEquationFunctionArgumentSeparator',
  'asEquationSymbol',
  'asFooterSection',
  'asFootnote',
  'asFootnoteSection',
  'asHeaderSection',
  'asHorizontalRule',
  'asInlineDrawing',
  'asInlineImage',
  'asListItem',
  'asPageBreak',
  'asPerson',
  'asRichLink',
  'asTable',
  'asTableCell',
  'asTableOfContents',
  'asTableRow',
  'asText',
  'asVariable',
  'clear',
  'copy',
  'editAsText',
  'findElement',
  'findText',
  'getAlignment',
  'getAttributes',
  'getBackgroundColor',
  'getChild',
  'getChildIndex',
  'getFontFamily',
  'getFontSize',
  'getForegroundColor',
  'getIndentEnd',
  'getIndentFirstLine',
  'getIndentStart',
  'getLineSpacing',
  'getLinkUrl',
  'getNextSibling',
  'getNumChildren',
  'getPositionedImage',
  'getPositionedImages',
  'getPreviousSibling',
  'getSpacingAfter',
  'getSpacingBefore',
  'getText',
  'getTextAlignment',
  'insertHorizontalRule',
  'insertInlineImage',
  'insertPageBreak',
  'insertText',
  'isAtDocumentEnd',
  'isBold',
  'isItalic',
  'isLeftToRight',
  'isStrikethrough',
  'isUnderline',
  'merge',
  'removeChild',
  'removeFromParent',
  'removePositionedImage',
  'replaceText',
  'setAlignment',
  'setAttributes',
  'setBackgroundColor',
  'setBold',
  'setFontFamily',
  'setFontSize',
  'setForegroundColor',
  'setIndentEnd',
  'setIndentFirstLine',
  'setIndentStart',
  'setItalic',
  'setLeftToRight',
  'setLineSpacing',
  'setLinkUrl',
  'setSpacingAfter',
  'setSpacingBefore',
  'setStrikethrough',
  'setText',
  'setTextAlignment',
  'setUnderline',
];

/**
 * generic class for an element
 * in docs everything is an element, including the body
 * an elelement can presetn its subclass with methids like asParagraph, asBody etc
 */
export class FakeElement {
  /**
   * the parent will be the containg elemement
   * @param {DocumentBase} ??
   * @param {FakeElement} parent 
   * @param {object} se the structural element to build the element from
   * @param {*} se 
   */
  constructor(parent, se) {
    this.__parent = parent || null;
    this.__se = se || null;
    this.__propsWaitingRoom = propsWaitingRoom;
    unimplementedProps(this, this.__propsWaitingRoom);
  }

  /**
   * Gets the element's parent element.
   * @returns {FakeElement|null} The parent element, or null if the element has no parent.
   */
  getParent() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Element.getParent');
    if (nargs !== 0) matchThrow();
    return this.__parent;
  }

  /**
   * Returns this element as a Paragraph. If the element is not a paragraph,
   * this method returns null.
   * @returns {import('./fakeparagraph.js').FakeParagraph|null} The element as a Paragraph or null.
   */
  asParagraph() {
    // Overridden by FakeParagraph.
    return null;
  }

  /**
   * Gets the element's type.
   * @returns {GoogleAppsScript.Document.ElementType} The element's type.
   */
  getType() {
    if (this.__se && this.__se.paragraph) {
      return ElementType.PARAGRAPH;
    }
    // Add other types here...
    return ElementType.UNSUPPORTED;
  }

  /**
   * Gets the text contents of the element as a string. For most elements, this is empty.
   * @returns {string} The text content.
   */
  getText() {
    return '';
  }

  toString() {
    return 'Element';
  }
}

export const newFakeElement = (...args) => Proxies.guard(new FakeElement(...args));
