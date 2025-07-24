import { Proxies } from '../../support/proxies.js';
import { signatureArgs, unimplementedProps } from '../../support/helpers.js';
import { Utils } from '../../support/utils.js';
import { ElementType } from '../enums/docsenums.js';
import { FakeContainerElement } from './fakecontainerelement.js';

const { is } = Utils

class FakeBody  extends FakeContainerElement  {

  constructor(shadowDocument) {
  
    if (!shadowDocument) {
      throw new Error('shadowbody not sent to body constructor')
    }
    super (shadowDocument.shadowBody)
    this.__shadowDocument = shadowDocument;
  }
  

  get __content() {
    const content = this.__body.content
    if (!content) {
      throw new Error('body content not sent to body constructor')
    }
    return content
  }

  get __body() {
    const body = this.__shadowDocument.shadowBody
    if (!body) {
      throw new Error('body not sent to body constructor')
    }
    return body
  }

  /**
   * Gets the element's type.
   * @returns {GoogleAppsScript.Document.ElementType} The element's type.
   */
  getType() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'Body.getType');
    if (nargs !== 0) matchThrow();
    return ElementType[this.__body.containerType]
  }

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

    // how to find the paragraph I just inserted??
    // it'll match the startIndex of a newly appended paragraph
    const lengthAfter = this.__structuralElements.length
    if (lengthAfter !== lengthBefore + requests.length) {
      throw new Error(`length before ${lengthBefore} should be ${lengthBefore + requests.length} but its ${lengthAfter}`)
    }
    const newPara = this.structuralElements.find(f => f.startIndex === endIndexBefore)
    if (!newPara) {
      throw new Error("couldnt find new paragraph")
    }
    const element = newFakeElement (newPara, this)
    return newFakeParagraph(element)
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

  toString() {

    return ScriptApp.isFake ? 'Body' : 'DocumentBodySection';
  }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));
