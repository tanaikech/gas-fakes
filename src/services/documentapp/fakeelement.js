import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils
import { makeNrPrefix } from './shadowhelpers.js'
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
   * @param {object} se the structural element to build the element from
   * @param {*} se 
   */
  constructor(structure, name) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'ContainerElement');
    if (nargs !== 2 || !is.object(structure) || !is.nonEmptyString(name) || !name.startsWith(makeNrPrefix(null))) {
      matchThrow();
    }
    this.__structure = structure
    this.__name = name;
  }

  get __elementMapItem() {
    const item = this.__structure.elementMap.get(this.__name)
    if (!item) {
      throw new Error(`element with name ${this.__name} not found`);
    }
    return item
  }

  get __twig() {
    return this.__elementMapItem.__twig
  }

  getParent() {
    // the body doesnt have a parent
    if (!this.__twig.parent) return null

    const name = this.__twig.parent.name
    const item = this.__structure.elementMap.get(name)
    if (!item) {
      throw new Error(`element with name ${name} not found`);
    }
    return newFakeElement(this.__structure, name)

  }



  getType() {
    const item = this.__elementMapItem
    const type = item.__type
    const enumType = ElementType[type]
    if (!enumType) {
      throw new Error(`element with type ${type} not found`);
    }
    return enumType
  }


  toString() {
    return 'Element';
  }
}

export const newFakeElement = (...args) => Proxies.guard(new FakeElement(...args));
