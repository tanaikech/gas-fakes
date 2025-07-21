import { Proxies } from '../../support/proxies.js';
import { ElementType } from '../enums/docsenums.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';


// all the specific methods for the subclasses should be set there.
const propsWaitingRoom = [
  'asBody',
  'asDate',
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
  'copy',
  'getAttributes',

  'getPreviousSibling',
 
  'isAtDocumentEnd',
  'removeFromParent',
  'setAttributes',
  ]

export class FakeElement {
  constructor(parent, se) {
    this.__parent = parent;
    this.__se = se;
    unimplementedProps(this, propsWaitingRoom)
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
    // This method is overridden by FakeParagraph. A base element is not a paragraph.
    return null;
  }


  /**
   * Gets the element's type.
   * @returns {GoogleAppsScript.Document.ElementType} The element's type.
   */
  getType() {
    // This will be overridden by subclasses. For a generic element, it's unsupported.
    return ElementType.UNSUPPORTED;
  }

  toString() {
    return 'Element';
  }
}