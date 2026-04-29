import { Proxies } from "../../support/proxies.js";
import { newFakeCellImageBuilder } from "./fakecellimagebuilder.js";

/**
 * Fake CellImage
 * @class FakeCellImage
 */
export class FakeCellImage {
  constructor(properties) {
    this._properties = properties || {};
  }

  getAltTextDescription() {
    return this._properties.altTextDescription || null;
  }

  getAltTextTitle() {
    return this._properties.altTextTitle || null;
  }

  getContentUrl() {
    const url = this._properties.sourceUrl || null;
    if (url && !url.includes('googleusercontent.com')) {
      throw new Error('Unexpected error while getting the method or property getContentUrl on object SpreadsheetApp.CellImage.');
    }
    return url;
  }

  toBuilder() {
    const builder = newFakeCellImageBuilder();
    if (this._properties.sourceUrl) builder.setSourceUrl(this._properties.sourceUrl);
    if (this._properties.altTextTitle) builder.setAltTextTitle(this._properties.altTextTitle);
    if (this._properties.altTextDescription) builder.setAltTextDescription(this._properties.altTextDescription);
    return builder;
  }

  toString() {
    return 'CellImage';
  }
}

export const newFakeCellImage = (...args) => Proxies.guard(new FakeCellImage(...args));