import { Proxies } from "../../support/proxies.js";
import { newFakeCellImage } from "./fakecellimage.js";

/**
 * Fake CellImageBuilder
 * @class FakeCellImageBuilder
 */
export class FakeCellImageBuilder {
  constructor() {
    this._properties = {};
  }

  build() {
    return newFakeCellImage(this._properties);
  }

  getAltTextDescription() {
    return this._properties.altTextDescription || null;
  }

  getAltTextTitle() {
    return this._properties.altTextTitle || null;
  }

  getContentUrl() {
    return this._properties.sourceUrl || null;
  }

  setAltTextDescription(description) {
    this._properties.altTextDescription = description;
    return this;
  }

  setAltTextTitle(title) {
    this._properties.altTextTitle = title;
    return this;
  }

  setSourceUrl(url) {
    this._properties.sourceUrl = url;
    return this;
  }

  toBuilder() {
    const builder = newFakeCellImageBuilder();
    builder._properties = { ...this._properties };
    return builder;
  }

  toString() {
    return 'CellImageBuilder';
  }
}

export const newFakeCellImageBuilder = (...args) => Proxies.guard(new FakeCellImageBuilder(...args));