/**
 * @file Provides a fake implementation of the TableCell class.
 */

import { Proxies } from '../../support/proxies.js';
import { FakeContainerElement } from './fakecontainerelement.js';
import { getText } from './elementhelpers.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the TableCell class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.TableCell}
 * @see https://developers.google.com/apps-script/reference/document/table-cell
 */
export class FakeTableCell extends FakeContainerElement {
  constructor(structure, nameOrItem) {
    super(structure, nameOrItem);
  }

  /**
   * Gets the text content of the cell.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getText()
   */
  getText() {
    return getText(this);
  }
}

/**
 * Creates a new fake TableCell.
 * @param {...any} args The arguments for the FakeTableCell constructor.
 * @returns {FakeTableCell} A new proxied FakeTableCell instance.
 */
export const newFakeTableCell = (...args) => Proxies.guard(new FakeTableCell(...args));
registerElement('TABLE_CELL', newFakeTableCell);