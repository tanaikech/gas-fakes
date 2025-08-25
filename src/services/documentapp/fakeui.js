/**
 * @file Provides a fake implementation of the Ui class for DocumentApp.
 */
import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';

/**
 * A fake implementation of the Ui class.
 * @class FakeUi
 * @implements {GoogleAppsScript.Document.Ui}
 * @see https://developers.google.com/apps-script/reference/document/ui
 */
class FakeUi {
  createAddonMenu() {
    return notYetImplemented('Ui.createAddonMenu');
  }

  createMenu(caption) {
    return notYetImplemented('Ui.createMenu');
  }

  showSidebar(userInterface) {
    return notYetImplemented('Ui.showSidebar');
  }
}

export const newFakeUi = (...args) => Proxies.guard(new FakeUi(...args));