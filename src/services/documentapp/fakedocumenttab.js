import { Proxies } from '../../support/proxies.js';
import { newFakeBody } from './fakebody.js';
import { FakeElement } from './fakeelement.js';
import { notYetImplemented } from '../../support/helpers.js';

export const newFakeDocumentTab = (...args) => {
    return Proxies.guard(new FakeDocumentTab(...args));
}


/**
 * @class FakeDocumentTab
 * @implements {GoogleAppsScript.Document.DocumentTab}
 */
class FakeDocumentTab extends FakeElement {
    constructor(tab, document, tabResource) {
        super();
        this.__tab = tab;
        this.__document = document;
        this.__tabResource = tabResource;
        this.__body = newFakeBody(this.__tabResource.documentTab ? this.__tabResource.documentTab.body : undefined);

    }
    /**
     * Returns the parent document.
     * @returns {import('./fakebody.js').FakeBody} The body element.
     */

    /**
     * Retrieves the tab's Body.
     * @returns {import('./fakebody.js').FakeBody} The tab's Body.
     */
    getBody() {
        return this.__body;
    }

    addBookmark(position) {
        return this.__document.addBookmark(position);
    }

    addNamedRange(name, range) {
        return this.__document.addNamedRange(name, range);
    }

    getBookmark(id) {
        return this.__document.getBookmark(id);
    }

    getBookmarks() {
        return this.__document.getBookmarks();
    }

    getFooter() {
        return this.__document.getFooter();
    }

    getFootnotes() {
        return this.__document.getFootnotes();
    }

    getHeader() {
        return this.__document.getHeader();
    }

    getNamedRangeById(id) {
        return this.__document.getNamedRangeById(id);
    }

    getNamedRanges() {
        return this.__document.getNamedRanges();
    }

    newPosition(element, offset) {
        return this.__document.newPosition(element, offset);
    }

    newRange() {
        return this.__document.newRange();
    }


    toString() {
        return 'DocumentTab';
    }
}
