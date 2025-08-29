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
        return notYetImplemented('DocumentTab.addBookmark(position)');
    }

    addFooter() {
        return notYetImplemented('DocumentTab.addFooter()');
    }

    addFooter() {
        return this.__document.addFooter();
    }

    addHeader() {
        return this.__document.addHeader();
    }

    addNamedRange(name, range) {
        return notYetImplemented('DocumentTab.addNamedRange(name, range)');
    }

    getBookmark(id) {
        return notYetImplemented('DocumentTab.getBookmark(id)');
    }

    getBookmarks() {
        return notYetImplemented('DocumentTab.getBookmarks()');
    }

    getFooter() {
        return notYetImplemented('DocumentTab.getFooter()');
    }

    getFooter() {
        return this.__document.getFooter();
    }

    getFootnotes() {
        return notYetImplemented('DocumentTab.getFootnotes()');
    }

    getHeader() {
        return this.__document.getHeader();
    }

    getNamedRangeById(id) {
        return notYetImplemented('DocumentTab.getNamedRangeById(id)');
    }

    getNamedRanges() {
        return notYetImplemented('DocumentTab.getNamedRanges()');
    }

    newPosition(element, offset) {
        return notYetImplemented('DocumentTab.newPosition(element, offset)');
    }

    newRange() {
        return notYetImplemented('DocumentTab.newRange()');
    }


    toString() {
        return 'DocumentTab';
    }
}
