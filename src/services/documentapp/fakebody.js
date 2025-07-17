import { Proxies } from '../../support/proxies.js';
import { signatureArgs } from '../../support/helpers.js';
import is from '@sindresorhus/is';
import {newFakeParagraph} from './fakeparagraph.js';
import {FakeParagraph} from './fakeparagraph.js';

// Placeholder for a future FakeBody implementation
class FakeBody {
    constructor(document) {
        this.__document = document;
    }
    /**
     * Searches the contents of the element for a descendant of the specified type, starting from the optional RangeElement.
     * findElement(elementType, from) This implementation focuses on paragraphs and textRuns within the document body. It iterates through structural elements, then paragraph elements, and finally, textRun elements to locate the first matching element, while taking into account where the search should start (from). It's important to note that this current implementation returns right away the structuralElement.
     * @param {ElementType} elementType 
     * @param {FakeRangeElement}[from=FakeRangeElement] 
     * @returns {FakeRangeElement}
     * 
     */
    findElement (elementType, from) {
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
     * Appends a paragraph to the document body.
     * @param {string|FakeParagraph} text - The text or Paragraph to append.
     * @returns {FakeParagraph} The created Paragraph.
     */
    appendParagraph (text) {
        // currently a very naive gemini created implementation
        const {nargs, matchThrow} = signatureArgs(arguments, 'Body.appendParagraph');
        // Can be a string or a Paragraph object``
        if (nargs !== 1 || (!is.string(text) && text.toString() !== 'Paragraph')) {
            matchThrow()
        }
        const paragraphText = is.string(text) ? text : text.getText();

        // startIndex is assigned by the api - if it doesnt have one then this is a constructed paragraph``
        if (text instanceof FakeParagraph && Reflect.has(text, "startIndex")) {
            // Trying to append an already attached paragraph
            throw new Error('Exception: Element must be detached.');
        }


        // To create a new paragraph, we must prepend a newline to the text.
        // This creates a paragraph break before inserting the new content.
        const textToInsert = "\\n" + paragraphText;

        // Find the insertion point, which is just before the final newline of the body.
        const content = this.__document.__doc.body?.content;
        const lastElement = content[content.length - 1];
        const insertionIndex = lastElement.endIndex - 1;

        const requests = [
            {
            insertText: {
                location: { index: insertionIndex },
                text: textToInsert,
            },
        }, ];

        // Use the advanced Docs service to perform the update. This also invalidates the document cache.
        Docs.Documents.batchUpdate({requests}, this.__document.getId());

        // Refresh the document's internal state to reflect the change
        this.__document.__doc = Docs.Documents.get(this.__document.getId());

        return newFakeParagraph(paragraphText);
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

export const newFakeBody = (document) => Proxies.guard(new FakeBody(document));
