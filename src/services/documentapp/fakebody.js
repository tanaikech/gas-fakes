import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { FakeParagraph } from './fakeparagraph.js';
import { FakeElement } from './fakeelement.js';
import { ElementType } from '../enums/docsenums.js';
const { is } = Utils
const makeElement = FakeElement.makeElementFromApi
const propsWaitingRoom = [
  'getHeadingAttributes',
  'setHeadingAttributes',
  'getPreviousSibling',
  'appendPageBreak',
  'insertPageBreak',
  'getMarginBottom',
  'getMarginLeft',
  'getMarginRight',
  'getMarginTop',
  'getPageHeight',
  'getPageWidth',
  'setMarginBottom',
  'setMarginLeft',
  'setMarginRight',
  'setMarginTop',
  'setPageHeight',
  'setPageWidth',
  'getNextSibling',
  'removeFromParent',
  'getTables',
  'insertImage',
  'getImages',
  'removeChild',
  'appendTable',
  'getFootnotes',
  'getParagraphs',
  'getListItems',
  'appendHorizontalRule',
  'appendImage',

  'appendListItem',
  'insertHorizontalRule',
  'insertParagraph',
  'insertListItem',
  'insertTable',
  'getLinkUrl',
  'setLinkUrl',
  'isAtDocumentEnd',
  'merge',
  'setText',
  'asListItem',
  'asDate',
  'asText',
  'asBody',
  'asEquationFunction',
  'asEquationSymbol',
  'asFootnote',
  'asHorizontalRule',
  'asInlineDrawing',
  'asInlineImage',
  'asAnchoredDrawing',
  'asPageBreak',
  'asPerson',
  'asRichLink',
  'asCodeSnippet',
  'asEquation',
  'asFooterSection',
  'asFootnoteSection',
  'asHeaderSection',
  'asParagraph',
  'asTable',
  'asTableCell',
  'asTableOfContents',
  'asTableRow',
  'asVariable',
  'asEquationFunctionArgumentSeparator',


  'findElement',
  'clear',

  'getFontFamily',
  'setFontFamily',
  'getFontSize',
  'setFontSize',
  'getBackgroundColor',
  'setBackgroundColor',
  'getForegroundColor',
  'setForegroundColor',
  'isBold',
  'setUnderline',
  'setStrikethrough',
  'setItalic',
  'setBold',
  'isItalic',
  'isStrikethrough',
  'isUnderline',
  'findText',
  'setTextAlignment',
  'editAsText',
  'replaceText',
  'getTextAlignment',
  'getText',
  'setAttributes',
  'asCommentSection',
  'asDocumentElement',
  'asDocumentBodySection', // Body is already a DocumentBodySection
  'copy',
  'getAttributes']


class FakeBody extends FakeElement {

  constructor(container) {
    // container 
    if (!container) {
      throw new Error('container not sent to body constructor')
    }

    super(container);

    this.__container = container;


    unimplementedProps(this, propsWaitingRoom)
  }

  get __content() {
    const content = this.__body.content
    if (!content) {
      throw new Error('body content not sent to body constructor')
    }
    return content
  }

  get __body() {
    const body = this.__container.__doc?.body || this.__container.body
    if (!body) {
      throw new Error('body not sent to body constructor')
    }
    return body
  }


  get __document() {
    let doc = this.__container
    while (Reflect.has(doc, 'getParent')) {
      doc = doc.getParent()
    }
    if (!doc) {
      throw new Error("couldnt find document from body")
    }
    return doc
  }

  get __structuralElements() {
    // The API response can contain elements we don't support in DocumentApp, like sectionBreak.
    // We filter these out, mimicking the behavior of getNumChildren.
    return this.__content.filter(f => !f.sectionBreak);
  }

  get __children() {
    return this.__structuralElements.map(makeElement)
  }

  getChild(index) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.getChild');
    const children = this.__children
    if (nargs !== 1 || !is.integer(index) || index < 0 || index >= children.length) {
      matchThrow()
    }
    return children[index]
  }

  getChildIndex(child) {
    // children don't have a specific id to indentify them so we need to use various strategies depening on the type
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.getChildIndex');
    if (nargs !== 1 || !is.nonEmptyObject(child)) {
      matchThrow()
    }
    // now search through the children
    const children = this.__children;
  }

  /**
   * Gets the element's type.
   * @returns {GoogleAppsScript.Document.ElementType} The element's type.
   */
  getType() {
    return ElementType.BODY_SECTION;
  }
  getNumChildren() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.getNumChildren');
    // Can be a string or a Paragraph object``
    if (nargs) {
      matchThrow()
    }
    return this.__children.length
  }
  get __segmentId() {
    // TODO - for now we'll assume we're ading to the end of the document
    // if we're appending somewhere else, we need the establish the segment id of the parent
    return ""
  }
  /**
   * Appends a paragraph to the document body.
   * @param {string|FakeParagraph} text - The text or Paragraph to append.
   * @returns {FakeParagraph} The created Paragraph.
   */
  appendParagraph(textOrParagraph) {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.appendParagraph');
    // Can be a string or a Paragraph object``
    const isText = is.string(textOrParagraph)
    if (nargs !== 1 || (!isText & !(is.object(textOrParagraph) && text.toString() === 'Paragraph'))) {
      matchThrow()
    }
    // if we're adding a paragraph it must not already be attached
    // a new paragraph made with copy doesnt have a parent so is acceptable
    if (!isText && textOrParagraph.getParent()) {
      throw new Error('Exception: Element must be detached.');
    }

    // TODO
    // there isn'tactually a way to make a request that includes all a ready made paragraph's children
    // so for now we'll just insert its text, but we need to revisit this to handle any para children
    const text = isText ? textOrParagraph : textOrParagraph.getText()
    const insertText = Docs.newInsertTextRequest().setText(text)

    // if we're going to append a paragraph, we need to locate the endindex if the current children
    // TODO we can only handle the main body here - stil need to handle other things
    const lengthBefore = this.__structuralElements.length
    const se = this.__structuralElements[lengthBefore - 1]
    // TODO is it possible to have a doc with no structural elements?
    if (!se) {
      throw new Error("couldnt find any structural elements")
    }
    const endIndexBefore = se.endIndex || 0


    // since we're appending we dont need to calculate the location
    insertText.setEndOfSegmentLocation(Docs.newEndOfSegmentLocation().setSegmentId(this.__segmentId))
    const requests = [{ insertText }]
    Docs.Documents.batchUpdate({ requests }, this.__document.getId());

    // refresh the local copy of the document with the data from the update?
    this.__document.__doc = DocumentApp.openById(this.__document.getId());
    this.__container = this.__document.__doc


    // how to find the paragraph I just inserted??
    // it'll match the startIndex of a newly appended paragraph
    const lengthAfter = this.__structuralElements.length
    if (lengthAfter !== lengthBefore + requests.length) {
      throw new Error(`length before ${lengthBefore} should be ${lengthBefore + requests.length} but its ${lengthAfter}`)
    }
    const newPara = this.structuralElements.find(f => f.startIndex === endIndexBefore && makeElement(f).getType() === ElementType.PARAGRAPH)
    if (!newPara) {
      throw new Error("couldnt find new paragraph")
    }
    return makeElement(newPara)
  }

  /**
   * Searches the contents of the element for a descendant of the specified type, starting from the optional RangeElement.
   * findElement(elementType, from) This implementation focuses on paragraphs and textRuns within the document body. It iterates through structural elements, then paragraph elements, and finally, textRun elements to locate the first matching element, while taking into account where the search should start (from). It's important to note that this current implementation returns right away the structuralElement.
   * @param {ElementType} elementType 
   * @param {FakeRangeElement}[from=FakeRangeElement] 
   * @returns {FakeRangeElement}
   * 
   */
  findElement(elementType, from) {
    /* example usage
        NOTE: 
            calling without the from argument will return the first,
            repeatedly calling without the from argument will be an endless loop
    
        let result = null
        while (result = body.findElement(DocumentApp.ElementType.PARAGRAPH), result) {
            const e = result.getElement().asParagraph()
            console.log (e.getText())
        }
     */


  }


  /**
   * Gets the text contents of the element as a string.
   * @returns {string} The text content.
   */
  getText() {
    if (!this.__document.__doc?.body || !this.__document.__doc.body.content) return ''

    const text = this.__document.__doc.body.content.map(structuralElement => {
      if (structuralElement.paragraph) {
        return structuralElement.paragraph.elements?.map(element => {
          return element.textRun ? element.textRun.content : '';
        }).join('');
      }
      return '';
    }).join('');

    // Per documentation, remove the final trailing newline character.
    if (text.length > 0 && text.endsWith("\\n")) {
      return text.slice(0, -1);
    }
    return text;
  }
  toString() {

    return ScriptApp.isFake ? 'Body' : 'DocumentBodySection';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));
