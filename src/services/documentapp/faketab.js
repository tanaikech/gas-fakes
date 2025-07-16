import { Proxies } from '../../support/proxies.js';
import { newFakeDocumentTab } from './fakedocumenttab.js';
import { notYetImplemented } from '../../support/helpers.js';
import * as Enums from '../enums/docsenums.js'


export const newFakeTab = (...args) => {
    return Proxies.guard(new FakeTab(...args));
};

/**
 * @class FakeTab
 * @implements {GoogleAppsScript.Document.Tab}
 */
class FakeTab {

    constructor(document, tabResource, docName) {
        this.__document = document;
        this.__tabResource = tabResource;
        this.__documentTab = newFakeDocumentTab(this, this.__document, tabResource);
        this.__docName = docName;
    }

    asDocumentTab() {

        return this.__documentTab;
    }

    getChildTabs() {
        return [];
    }


    getDocument(){
      return this.__document;
    }

    getId() {
        return this.__tabResource.tabProperties?.tabId || 'default_tab_id';
    }

    getTitle() {
      return this.__tabResource.tabProperties?.title || "Tab 1";
    }

    getIndex() {
        return this.__tabResource.tabProperties?.index;
    }

    getType() {
      if (this.__tabResource.documentTab) {
        return Enums.TabType.DOCUMENT_TAB;
      }
      return notYetImplemented("Tab.getType for non-document tabs");
    }

    toString() {
        return 'Tab';
    }
}