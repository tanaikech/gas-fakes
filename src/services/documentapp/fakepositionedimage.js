import { Proxies } from '../../support/proxies.js';
import { FakeElement } from './fakeelement.js';
import { registerElement } from './elementRegistry.js';
import { notYetImplemented, signatureArgs } from '../../support/helpers.js';

export const newFakePositionedImage = (...args) => {
  return Proxies.guard(new FakePositionedImage(...args));
};

/**
 * A fake implementation of the PositionedImage class for DocumentApp.
 * @class FakePositionedImage
 * @extends {FakeElement}
 * @implements {GoogleAppsScript.Document.PositionedImage}
 * @see https://developers.google.com/apps-script/reference/document/positioned-image
 */
class FakePositionedImage extends FakeElement {
  constructor(shadowDocument, nameOrItem) {
    super(shadowDocument, nameOrItem);
  }

  __getPositionedObject() {
    if (this.__isDetached) {
      throw new Error('Detached PositionedImage is not yet supported.');
    }

    const elementItem = this.__elementMapItem;
    const positionedObjectId = elementItem.positionedObjectElement?.objectId;
    if (!positionedObjectId) {
      throw new Error('Element is not a valid positioned object.');
    }
    const { positionedObjects } = this.__shadowDocument.__unpackDocumentTab(this.__shadowDocument.resource);
    const positionedObject = positionedObjects?.[positionedObjectId];
    if (!positionedObject) {
      throw new Error(`Could not find positioned object with ID: ${positionedObjectId}`);
    }
    return { object: positionedObject, id: positionedObjectId };
  }

  getBlob() {
    const uri = this.__getPositionedObject().object.positionedObjectProperties.embeddedObject.imageProperties.contentUri;
    if (!uri) throw new Error('Image does not have a content URI to fetch.');
    return UrlFetchApp.fetch(uri).getBlob();
  }

  getAs(contentType) {
    return this.getBlob().getAs(contentType);
  }

  getHeight() {
    return this.__getPositionedObject().object.positionedObjectProperties.embeddedObject.size.height.magnitude;
  }

  getWidth() {
    return this.__getPositionedObject().object.positionedObjectProperties.embeddedObject.size.width.magnitude;
  }

  getLeftOffset() {
    return this.__getPositionedObject().object.positionedObjectProperties.positioning.leftOffset.magnitude;
  }

  getTopOffset() {
    return this.__getPositionedObject().object.positionedObjectProperties.positioning.topOffset.magnitude;
  }

  getLayout() {
    const { nargs, matchThrow } = signatureArgs(arguments, 'PositionedImage.getLayout');
    if (nargs !== 0) matchThrow();
    const layout = this.__getPositionedObject().object.positionedObjectProperties.positioning.layout;
    return DocumentApp.PositionedLayout[layout];
  }

  // Setters are not implemented due to API limitations
  setHeight(height) { return notYetImplemented('PositionedImage.setHeight'); }
  setWidth(width) { return notYetImplemented('PositionedImage.setWidth'); }
  setLeftOffset(offset) { return notYetImplemented('PositionedImage.setLeftOffset'); }
  setTopOffset(offset) { return notYetImplemented('PositionedImage.setTopOffset'); }
  setLayout(layout) { return notYetImplemented('PositionedImage.setLayout'); }

  toString() {
    return 'PositionedImage';
  }
}

registerElement('POSITIONED_IMAGE', newFakePositionedImage);

