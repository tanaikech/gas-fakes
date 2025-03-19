import { FakeDriveMeta } from "./fakedrivemeta.js"
import { Proxies } from '../../support/proxies.js'
import { isFolder } from '../../support/helpers.js'
import { Syncit } from "../../support/syncit.js"
import { FakeDriveFolder } from "./fakedrivefolder.js"
import { Utils } from "../../support/utils.js"
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
   * make a copy
   * @param {FakeDriveFolder|string|null} [destinationOrName] where to copy it to/chaneg the name if required
   * @param {FakeDriveFolder} [destination] where to copy it to
   */
  makeCopy(destinationOrName, destination) {
    
    // default is same name as copied file
    let name = this.__getDecorated("name")

    // default is the parent of the file to be copied
    let parents = this.__getDecorated("parents")
    const nargs = arguments.length

    // for param checking
    const metaFolder = (item) => isFolder(item?.meta) ? "DriveApp.Folder" : is(item)
    const passedTypes = [metaFolder(destinationOrName), metaFolder(destination)]
      .slice(0, nargs).map(Utils.capital).join(",")
    const matchThrow = (mess = "") => {
      throw new Error(`The parameters (${passedTypes}) don't match the method ${mess}`)
    }

    // check args make sense
    if (Utils.isNU(destination) && Utils.isNU(destinationOrName)) {
      // makecopy()
      // no args provided, we use the defaults
    } else if (isFolder(destinationOrName?.meta)) {
      // makecopy (afolder)
      // destination is a folder, so no 2nd arg required
      parents = [destinationOrName.__getDecorated("id")]
      if (!Utils.isNU(destination)) matchThrow()
    } else if (!is.nonEmptyString(destinationOrName)) {
      // makecopy (notastring,...)
      // they tried to give a name but its not a string
      matchThrow()
    } else if (isFolder(destination?.meta)) {
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