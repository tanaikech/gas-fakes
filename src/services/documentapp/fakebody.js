import { Proxies } from '../../support/proxies.js';
import { newFakeParagraph } from './fakeparagraph.js';

// Placeholder for a future FakeBody implementation
class FakeBody {
    constructor(bodyResource) {

        this.__body = bodyResource;


        this.__content = this.__body?.content || [];
    }

    appendParagraph(text) {
        this.__content.push({paragraph: {elements: [{textRun: {content: text}}]}});
        return newFakeParagraph(text);
    }


    /**
     * Gets the text contents of the element as a string.
     * @returns {string} The text content.
     */
    getText() {
        if (!this.__body || !this.__body.content) {
            return '';
        }

        const text = this.__content.map(structuralElement => {
            if (structuralElement.paragraph) {
                return structuralElement.paragraph.elements?.map(element => {
                    if (element.textRun) {
                        return element.textRun.content;
                    }
                    return '';
                }).join('');
            }
            return '';
        }).join('');

        // Per documentation, remove the final trailing newline character.
        if (text.endsWith('\n')) {
          return text.slice(0, -1);
        }
        return text;
    }

    // methods like appendParagraph, etc. would go here
    toString() {

        return ScriptApp.isFake ? 'Body' : 'DocumentBodySection';
    }
}

export const newFakeBody = (...args) => Proxies.guard(new FakeBody(...args));



// I am making several design decisions which seem best for the tests, but may not match the real appscript api...

// 1 I am only allowing a default tab 

// 2 setting  a new para on a tab, will not autmatically be pushed to the document as well

// 3 because batchupdates hasnt been implemented to take out a few bugs for now, Im going to require you to use functions in FakeDocumentTab and FakeDocument to do the setting/getting of various things, so 


/**
 * Appends a paragraph to the document body (which appends it to a docment tab)
 * 
 * if we want tabs to be fully automatic then it would do something like this 
 * 
 *  FakeTab.FakeDocumentTab.appendParagraph(text)
 
 * however for now I am not doing this.
 * 
 *
 * and
 */