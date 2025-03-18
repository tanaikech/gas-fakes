import { FakeDriveMeta } from "./fakedrivemeta.js"
import { Proxies } from '../../support/proxies.js'
import {  isFolder } from '../../support/helpers.js'
import { Syncit } from "../../support/syncit.js"
/**
 * basic fake File
 * mainly shared between folder and file
 * @class FakeDriveFile
 * @extends FakeDriveMeta
 * @returns {FakeDriveFile}
 */
class FakeDriveFile extends FakeDriveMeta {
  /**
   * 
   * @constructor 
   * @param {File} meta data from json api
   * @returns {FakeDriveFile}
   */
  constructor(meta) {
    super(meta)
    if (isFolder(meta)) {
      throw new Error(`file cant be a folder:` + JSON.stringify(meta))
    }
  }

  /**
   * get the file mimetype
   * @returns {string} the file mimetpe
   */
  getMimeType() {
    return this.__getDecorated("mimeType")
  }
  /**
   * 
   * @returns {FakeBlob}
   */
  getBlob() {
    // spawn child process to syncify getting content as by array
    const { data } = Syncit.fxDriveMedia({ id: this.getId() })
    // and blobify
    return Utilities.newBlob(data, this.getMimeType(), this.getName())
  }

  /**
   * 
   * @returns get a blob for the thumbnail if it exists
   * @returns {FakeBlob|null }
   */
  getThumbnail() {
    this.__decorateWithFields("hasThumbnail,thumbnailLink")
    if (!this.meta.hasThumbnail) return null

    return UrlFetchApp.fetch(this.meta.thumbnailLink).getBlob()
  }

  /**
   * returns the download url - this is the same as the webcontentlink
   * @return {string}
   */
  getDownloadUrl() {
    return this.__getDecorated("webContentLink")
  }

}

/**
 * create a new drive file instance
 * @param  {...any} args 
 * @returns {FakeDriveFile}
 */
export const newFakeDriveFile = (...args) => {
  return Proxies.guard(new FakeDriveFile(...args))
}