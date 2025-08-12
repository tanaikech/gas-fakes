/**
 * @file Provides a fake implementation of the TableCell class.
 */

import { FakeContainerElement } from './fakecontainerelement.js';
import { registerElement } from './elementRegistry.js';

/**
 * A fake implementation of the TableCell class.
 * @class
 * @extends {FakeContainerElement}
 * @implements {GoogleAppsScript.Document.TableCell}
 * @see https://developers.google.com/apps-script/reference/document/table-cell
 */
export class FakeTableCell extends FakeContainerElement {
  /**
   * Gets the text content of the cell.
   * @returns {string} The text content.
   * @see https://developers.google.com/apps-script/reference/document/table-cell#getText()
   */
  getText() {
    return ''; // Stub implementation
  }
}

/**
 * Creates a new fake TableCell.
 * @param {object} properties The properties for the TableCell.
 * @returns {FakeTableCell} The new fake TableCell.
 */
export const newFakeTableCell = (properties) => new FakeTableCell(properties);
registerElement('TABLE_CELL', newFakeTableCell);