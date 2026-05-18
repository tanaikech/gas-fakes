import { Proxies } from "../../support/proxies.js";

/**
 * create a new FakeOverGridImage instance
 * @param  {...any} args
 * @returns {FakeOverGridImage}
 */
export const newFakeOverGridImage = (...args) => {
  return Proxies.guard(new FakeOverGridImage(...args));
};

/**
 * basic fake FakeOverGridImage
 * @class FakeOverGridImage
 */
export class FakeOverGridImage {
  /**
   * @constructor
   * @param {Sheet} sheet
   * @param {Object} obj
   * @returns {FakeOverGridImage}
   */
  constructor(sheet, obj) {
    this.sheet = sheet;
    this.object = obj;
  }

  getAnchorCell() {
    return this.sheet.getRange(this.object.row + 1, this.object.col + 1);
  }

  getAnchorCellXOffset() {
    return this.object.anchorCellXOffset;
  }

  getAnchorCellYOffset() {
    return this.object.anchorCellYOffset;
  }

  getWidth() {
    return this.object.width;
  }

  getHeight() {
    return this.object.height;
  }

  setHeight(height) {
    this.object.height = height;
    return this;
  }

  setWidth(width) {
    this.object.width = width;
    return this;
  }

  setAltTextTitle(title) {
    this.object.altTextTitle = title;
    return this;
  }

  setAltTextDescription(description) {
    this.object.altTextDescription = description;
    return this;
  }

  deleteOverlaidDrawing() {
    // No-op for now as it's a mock
    return this;
  }
}
