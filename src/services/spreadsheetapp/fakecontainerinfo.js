import { Proxies } from "../../support/proxies.js";

/**
 * create a new FakeContainerInfo instance
 * @param  {...any} args
 * @returns {FakeContainerInfo}
 */
export const newFakeContainerInfo = (...args) => {
  return Proxies.guard(new FakeContainerInfo(...args));
};

/**
 * Access to the chart's container position.
 */
export class FakeContainerInfo {
  /**
   * @param {object} overlayPosition The overlayPosition object from Sheets API
   */
  constructor(overlayPosition) {
    this.__overlayPosition = overlayPosition || {};
  }

  /**
   * Returns the column index where the drawing is anchored.
   * @returns {number}
   */
  getAnchorColumn() {
    return (this.__overlayPosition.anchorCell?.columnIndex || 0) + 1;
  }

  /**
   * Returns the row index where the drawing is anchored.
   * @returns {number}
   */
  getAnchorRow() {
    return (this.__overlayPosition.anchorCell?.rowIndex || 0) + 1;
  }

  /**
   * Returns the horizontal offset in pixels from the anchor column.
   * @returns {number}
   */
  getOffsetX() {
    return this.__overlayPosition.offsetXPixels || 0;
  }

  /**
   * Returns the vertical offset in pixels from the anchor row.
   * @returns {number}
   */
  getOffsetY() {
    return this.__overlayPosition.offsetYPixels || 0;
  }

  toString() {
    return "ContainerInfo";
  }
}
