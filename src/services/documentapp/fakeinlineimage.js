import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';
import { signatureArgs, notYetImplemented } from '../../support/helpers.js';

/**
 * Creates a new proxied FakeInlineImage instance.
 * @param {...any} args The arguments for the FakeInlineImage constructor.
 * @returns {FakeInlineImage} A new proxied FakeInlineImage instance.
 */
export const newFakeInlineImage = (...args) => {
  return Proxies.guard(new FakeInlineImage(...args));
};

/**
 * A fake implementation of the InlineImage class for DocumentApp.
 * @class FakeInlineImage
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.InlineImage}
 * @see https://developers.google.com/apps-script/reference/document/inline-image
 */
class FakeInlineImage extends FakeElement {
  /**
   * @param {import('./shadowdocument.js').ShadowDocument} shadowDocument The shadow document manager.
   * @param {string|object} nameOrItem The name of the element or the element's API resource.
   * @private
   */
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  /**
   * Gets the underlying inline object from the document resource.
   * @private
   * @returns {{object: object, id: string}} The inline object and its ID.
   */
  __getInlineObject() {
    if (this.__isDetached) {
      const inlineObject = this.__elementMapItem.__fullInlineObject;
      if (!inlineObject) {
        throw new Error('Detached image is missing its properties. Was it created with .copy()?');
      }
      return { object: inlineObject, id: inlineObject.objectId };
    }

    const elementItem = this.__elementMapItem;
    const inlineObjectId = elementItem.inlineObjectElement.inlineObjectId;
    const { inlineObjects } = this.__shadowDocument.__unpackDocumentTab(this.__shadowDocument.resource);
    const inlineObject = inlineObjects[inlineObjectId];
    if (!inlineObject) {
      throw new Error(`Could not find inline object with ID: ${inlineObjectId}`);
    }
    return { object: inlineObject, id: inlineObjectId };
  }

  /**
   * Sends an update request for an inline object property.
   * @private
   * @param {object} properties The properties to update.
   * @param {string} fields The fields mask.
   */
  __updateProperties(properties, fields) {
    if (this.__isDetached) {
      throw new Error('Cannot modify a detached element.');
    }
    // This functionality is not available in the public Docs API.
    // See: https://issuetracker.google.com/issues/172423234
    notYetImplemented('InlineImage property setters due to Docs API limitations');
  }

  copy() {
    const { object: inlineObject } = this.__getInlineObject();
    const detachedElement = super.copy();
    detachedElement.__elementMapItem.__fullInlineObject = inlineObject;
    return detachedElement;
  }

  getAltDescription() {
    return this.__getInlineObject().object.inlineObjectProperties.embeddedObject.description || null;
  }

  getAltTitle() {
    return this.__getInlineObject().object.inlineObjectProperties.embeddedObject.title || null;
  }

  getBlob() {
    const uri = this.__getInlineObject().object.inlineObjectProperties.embeddedObject.imageProperties.contentUri;
    if (!uri) throw new Error('Image does not have a content URI to fetch.');
    return UrlFetchApp.fetch(uri).getBlob();
  }

  getAs(contentType) {
    return this.getBlob().getAs(contentType);
  }

  getHeight() {
    return this.__getInlineObject().object.inlineObjectProperties.embeddedObject.size.height.magnitude;
  }

  getWidth() {
    return this.__getInlineObject().object.inlineObjectProperties.embeddedObject.size.width.magnitude;
  }

  getLinkUrl() {
    return this.__getInlineObject().object.inlineObjectProperties.embeddedObject.link?.url || null;
  }

  setAltDescription(description) {
    this.__updateProperties({ description }, 'description');
    return this;
  }

  setAltTitle(title) {
    this.__updateProperties({ title }, 'title');
    return this;
  }

  setHeight(height) {
    this.__updateProperties({ size: { height: { magnitude: height, unit: 'PT' } } }, 'size.height');
    return this;
  }

  setWidth(width) {
    this.__updateProperties({ size: { width: { magnitude: width, unit: 'PT' } } }, 'size.width');
    return this;
  }

  setLinkUrl(url) {
    this.__updateProperties({ link: { url } }, 'link.url');
    return this;
  }

  toString() {
    return 'InlineImage';
  }
}

registerElement('INLINE_IMAGE', newFakeInlineImage);