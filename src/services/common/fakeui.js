/**
 * @file Provides a fake implementation of the Ui class.
 */
import { Proxies } from '../../support/proxies.js';
import { notYetImplemented } from '../../support/helpers.js';

/**
 * A fake implementation of the Ui class.
 * @class FakeUi
 * @implements {GoogleAppsScript.Base.Ui}
 */
class FakeUi {
  createAddonMenu() {
    return notYetImplemented('Ui.createAddonMenu');
  }

  createMenu(caption) {
    return notYetImplemented('Ui.createMenu');
  }

  showSidebar(userInterface) {
    // In live GAS, this returns void and pushes to the client UI.
    // Locally, we set the dimensions to match a standard Sidebar (300px width).
    if (userInterface && typeof userInterface.setWidth === 'function') {
      userInterface.setWidth(300);
      userInterface.__framingType = 'sidebar';
    }
    // We log it so the developer knows the UI interaction occurred.
    console.log(`[gas-fakes] Ui.showSidebar triggered with Title: "${userInterface.getTitle ? userInterface.getTitle() : ''}"`);
    return this;
  }

  showModalDialog(userInterface, title) {
    // In live GAS, this returns void and pushes to the client UI.
    // Locally, we set the title and apply standard dialog styling to the HtmlOutput.
    if (userInterface && typeof userInterface.setTitle === 'function') {
      userInterface.setTitle(title);
      userInterface.__framingType = 'modal';
    }
    console.log(`[gas-fakes] Ui.showModalDialog triggered with Title: "${title}"`);
    return this;
  }
}

export const newFakeUi = (...args) => Proxies.guard(new FakeUi(...args));