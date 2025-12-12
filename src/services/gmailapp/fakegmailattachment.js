import { Proxies } from '../../support/proxies.js';
import { newFakeBlob } from '../utilities/fakeblob.js';

export const newFakeGmailAttachment = (...args) => Proxies.guard(new FakeGmailAttachment(...args));

/**
 * An attachment from Gmail.
 * @see https://developers.google.com/apps-script/reference/gmail/gmail-attachment
 */
class FakeGmailAttachment {
  constructor(attachmentResource) {
    this.__attachmentResource = attachmentResource;
    this.__fakeObjectType = 'GmailAttachment';
    
    // The attachment resource from the Gmail API has a `data` property which is base64 encoded.
    const decodedData = attachmentResource.data ? Utilities.base64Decode(attachmentResource.data) : [];
    this.__blob = newFakeBlob(decodedData, attachmentResource.mimeType, attachmentResource.filename);
  }

  getSize() {
    return this.__attachmentResource.size;
  }
  
  getHash() {
    // not implementing this for now, as it's not needed for createDraft
    // it should be a sha1 hash of the content
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, this.getBytes()).map((b) => (b + 256).toString(16).slice(-2)).join('');
  }

  // Delegate blob methods
  copyBlob() {
    return this.__blob.copyBlob();
  }
  
  getBytes() {
    return this.__blob.getBytes();
  }

  getContentType() {
    return this.__blob.getContentType();
  }

  getDataAsString(charset) {
    return this.__blob.getDataAsString(charset);
  }

  getName() {
    return this.__blob.getName();
  }
  
  isGoogleType() {
    return this.__blob.isGoogleType();
  }

  setBytes(data) {
    this.__blob.setBytes(data);
    return this;
  }

  setContentType(contentType) {
    this.__blob.setContentType(contentType);
    return this;
  }

  setContentTypeFromExtension() {
    this.__blob.setContentTypeFromExtension();
    return this;
  }

  setDataFromString(string, charset) {
    this.__blob.setDataFromString(string, charset);
    return this;
  }

  setName(name) {
    this.__blob.setName(name);
    return this;
  }

  toString() {
    return this.__fakeObjectType;
  }
}
