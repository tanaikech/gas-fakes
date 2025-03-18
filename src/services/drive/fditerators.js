import { Utils } from '../../support/utils.js'
import { newPeeker } from '../../support/peeker.js'
import { fileLister } from './fdworkers.js'
import { newFakeDriveFolder } from './fakedrivefolder.js'

// we can get all the permissions - need iterate in case theres more than a page (unlikely)
export const getPermissionIterator = ({
  id

}) => {
  const { assert } = Utils
  assert.string(id)

  /**
 * this generator will get chunks of matching permissions for a given file
 * and yield them 1 by 1 and handle paging if required
 */
  function* permissionsInk() {
    // the result tank
    let tank = []
    // the next page token
    let pageToken = null

    do {
      // if nothing in the tank, fill it upFdrive
      if (!tank.length) {
        const data = Drive.Permissions.list(id, { fields: "nextPageToken,permissions(emailAddress,photoLink,domain,displayName)" })
        const { permissions, nextPageToken } = data

        // the presence of a nextPageToken is the signal that there's more to come
        pageToken = nextPageToken

        // format the results into the folder or file object
        tank = permissions
      }

      // if we've got anything in the tank send back the oldest one
      if (tank.length) {
        yield tank.splice(0, 1)[0]
      }

      // if there's still anything left in the tank, 
      // or there's a page token to get more continue
    } while (pageToken || tank.length)
  }
  // create the iterator
  const fileit = permissionsInk()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(fileit)
}

/**
 * shared get any kind of file meta data 
 * @param {string} [parentId] the parent id 
 * @param {object[]} [qob] any additional queries
 * @param {boolean} folderTypes whether to get foldertypes 
 * @param {boolean} fileTypes whether to get fileTypes 
 * @returns {object} {Peeker}
 */
export const getFilesIterator = ({
  qob,
  parentId = null,
  folderTypes,
  fileTypes
}) => {

  const { assert } = Utils
  // parentId can be null to search everywhere
  if (!is.null(parentId)) assert.nonEmptyString(parentId)
  assert.boolean(folderTypes)
  assert.boolean(fileTypes)

  // DriveApp doesnt give option to specify these so this will be fixes
  const fields = `files(${minFields}),nextPageToken`

  /**
   * this generator will get chunks of matching files from the drive api
   * and yield them 1 by 1 and handle paging if required
   */
  function* filesink() {
    // the result tank
    let tank = []
    // the next page token
    let pageToken = null

    do {
      // if nothing in the tank, fill it upFdrive
      if (!tank.length) {
        const data = fileLister({
          qob, parentId, fields, folderTypes, fileTypes, pageToken
        })

        // the presence of a nextPageToken is the signal that there's more to come
        pageToken = data.nextPageToken


        // format the results into the folder or file object
        tank = data.files.map(settleClass)

      }

      // if we've got anything in the tank send back the oldest one
      if (tank.length) {
        yield tank.splice(0, 1)[0]
      }

      // if there's still anything left in the tank, 
      // or there's a page token to get more continue
    } while (pageToken || tank.length)
  }

  // create the iterator
  const fileit = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(fileit)

}

/**
 * this gets an intertor to fetch all the parents meta data
 * @param {FakeDriveMeta} {file} the meta data
 * @returns {object} {Peeker}
 */
export const getParentsIterator = ({
  file
}) => {
  const { assert } = Utils
  assert.object(file)
  assert.array(file.parents)

  function* filesink() {
    // the result tank, we just get them all by id
    let tank = file.parents.map(id => Drive.Files.get(id, {}, { allow404: false }))

    while (tank.length) {
      yield newFakeDriveFolder(tank.splice(0, 1)[0])
    }
  }

  // create the iterator
  const parentsIt = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(parentsIt)

}

