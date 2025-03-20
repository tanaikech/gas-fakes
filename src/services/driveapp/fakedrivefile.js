import { FakeDriveMeta } from "./fakedrivemeta.js"
import { Proxies } from '../../support/proxies.js'
import { isFolder, isFakeFolder, argsMatchThrow } from '../../support/helpers.js'
import { Syncit } from "../../support/syncit.js"
import { FakeDriveFolder } from "./fakedrivefolder.js"
import { Utils } from "../../support/utils.js"
import { settleAsBlob } from "../utilities/fakeblob.js"
import {  improveFileCache } from "../../support/filecache.js"

const { is } = Utils

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

  /**
   * set the content to something else
   * @param {string} content apparently this can only be a string and not a blob 
   * @return {FakeDriveFile} self
   */
  setContent(content) {
    // for param checking
    const matchThrow = () => argsMatchThrow(Array.from(arguments))
    // apps script does a toString on the arg rather than failing
    if (!is.function (content?.toString)) {
      matchThrow()
    }
    
    // this remains its current mimetype even though its now text
    const blob = settleAsBlob(content.toString(), this.getMimeType(), this.getName())
    const data = Drive.Files.update({}, this.getId(), blob)
    
    // merge this with already known fields and improve cache
    this.meta = {...this.meta, ...data}
    improveFileCache(this.getId(), this.meta)
    return this

  }

  /**
   * make a copy
   * @param {FakeDriveFolder|string|null} [destinationOrName] where to copy it to/chaneg the name if required
   * @param {FakeDriveFolder} [destination] where to copy it to
   */
  makeCopy(destinationOrName, destination) {

    // default is same name as copied file
    let name = this.__getDecorated("name")

    // default is the parent of the file to be copied
    let parents = this.__getDecorated("parents")

    // for param checking
    const matchThrow = () => argsMatchThrow(Array.from(arguments))


    // check args make sense
    if (Utils.isNU(destination) && Utils.isNU(destinationOrName)) {
      // makecopy()
      // no args provided, we use the defaults
    } else if (isFakeFolder(destinationOrName)) {
      // makecopy (afolder)
      // destination is a folder, so no 2nd arg required
      parents = [destinationOrName.__getDecorated("id")]
      if (!Utils.isNU(destination)) matchThrow()
    } else if (!is.nonEmptyString(destinationOrName)) {
      // makecopy (notastring,...)
      // they tried to give a name but its not a string
      matchThrow()
    } else if (isFakeFolder(destination)) {
      // makecopy (a string,a folder)
      name = destinationOrName
      parents = [destination.__getDecorated("id")]
    } else if (Utils.isNU(destination)) {
      // makecopy (string)
      name = destinationOrName
    } else {
      // makecopy (string, notafolder)
      matchThrow()
    }

    const data = Drive.Files.copy({
      parents,
      name
    }, this.getId())


    return newFakeDriveFile(data)

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