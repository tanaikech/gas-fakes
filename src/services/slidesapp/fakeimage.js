import { Proxies } from '../../support/proxies.js';
import { newFakeBlob } from '../utilities/fakeblob.js';
import { FakePageElement, PageElementRegistry } from './fakepageelement.js';
import { newFakeBorder } from './fakeborder.js';

export const newFakeImage = (...args) => {
  const image = Proxies.guard(new FakeImage(...args));
  return image;
};

PageElementRegistry.newFakeImage = newFakeImage;

export class FakeImage extends FakePageElement {
  constructor(resource, page) {
    super(resource, page);
  }

  /**
   * Returns a FakeBlob representing the image content.
   * @param {string} contentType - The MIME type.
   * @returns {FakeBlob}
   */
  getAs(contentType) {
    // Return a dummy blob for now
    return newFakeBlob([], contentType, 'image');
  }

  /**
   * Returns a FakeBlob representing the image content.
   * @returns {FakeBlob}
   */
  getBlob() {
    return this.getAs('image/png');
  }

  /**
   * Returns a FakeBorder object.
   * @returns {FakeBorder}
   */
  getBorder() {
    return newFakeBorder(this);
  }

  /**
   * Gets the URL to the image content.
   * @returns {string}
   */
  getContentUrl() {
    return this.__resource.image?.contentUrl || '';
  }

  /**
   * Gets the inherent height of the image.
   * @returns {number}
   */
  getInherentHeight() {
    const sourceProps = this.__resource.image?.sourceProperties;
    if (sourceProps && sourceProps.inherentHeight) {
      // Inherent dimensions are in EMUs. Normalize to PT.
      // 1 PT = 12700 EMU.
      // We don't use __normalize because it has a threshold that might skip small EMUs.
      const val = sourceProps.inherentHeight;
      return typeof val === 'number' ? val / 12700 : this.__normalize(val);
    }
    return this.getHeight();
  }

  /**
   * Gets the inherent width of the image.
   * @returns {number}
   */
  getInherentWidth() {
    const sourceProps = this.__resource.image?.sourceProperties;
    if (sourceProps && sourceProps.inherentWidth) {
      const val = sourceProps.inherentWidth;
      return typeof val === 'number' ? val / 12700 : this.__normalize(val);
    }
    return this.getWidth();
  }

  /**
   * Returns the parent placeholder or null.
   * @returns {FakePageElement | null}
   */
  getParentPlaceholder() {
    // Placeholder logic usually involves finding the element referenced by parentObjectId
    return null; 
  }

  /**
   * Returns the placeholder index or null.
   * @returns {number | null}
   */
  getPlaceholderIndex() {
    return this.__resource.image?.placeholder?.index ?? null;
  }

  /**
   * Returns the placeholder type.
   * @returns {PlaceholderType}
   */
  getPlaceholderType() {
    const type = this.__resource.image?.placeholder?.type;
    return type ? SlidesApp.PlaceholderType[type] : SlidesApp.PlaceholderType.NONE;
  }

  /**
   * Gets the source URL of the image.
   * @returns {string}
   */
  getSourceUrl() {
    return this.__resource.image?.sourceUrl || null;
  }

  toString() {
    return 'Image';
  }
}
