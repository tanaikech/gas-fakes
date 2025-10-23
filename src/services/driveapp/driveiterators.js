import { minFields, folderType } from '../../support/helpers.js'
import { Utils } from '../../support/utils.js'
import { newPeeker } from '../../support/peeker.js'
const { assert, is } = Utils
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


  // parentId can be null to search everywhere
  if (!is.null(parentId)) assert.nonEmptyString(parentId)
  assert.boolean(folderTypes)
  assert.boolean(fileTypes)

  // DriveApp doesnt give option to specify these so this will be fixed
  const fields = `files(${minFields}),nextPageToken`

  /// in apps script the name field is title - if you use name it errors
  /// in the api the name field is the name - if you use tile if fails

  if (qob) {
    const regex = /(^|\s)title(\s*=\s*|\s+contains\s+|\s*!=\s*|\s*>\s*|\s*<\s*)/gi;
    qob = qob.map(f => {
      if (!is.string(f)) throw new Error (`invalid parameters ${JSON.stringify(qob)}`)
      return f.replace(regex, (match, p1, p2) => {
        // p1 is the start-of-string or whitespace before 'title'
        // p2 is the operator and surrounding whitespace
        return `${p1}name${p2}`;
      });
    })
  }
//qob = ["name contains 'Untitled' and '0AN2ExLh4POiZUk9PVA' in parents and mimeType != 'application/vnd.google-apps.folder'"]
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
        assert.array(data.files)
        assert.function(DriveApp.__settleClass)
        tank = data.files.map(DriveApp.__settleClass)

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
  // if its rott folder can be null
  const parents = is.null(file.parents) ? [] : file.parents
  assert.array(parents)
  // TODO we need to handle allowing access to root when sandbox is on
  // and would prevent it. - this still needs more thought on whether this is all handled properly
  // I think we should be ok because the individual file access will be blocked if not allowed
  // but we need to be able to get root folder if it's a parent of an allowed
  const rooter = (id) => (!ScriptApp.__behavior.isAccessible(id) && DriveApp.getRootFolder().getId() === id) ? 'root' : id
  function* filesink() {
    // the result tank, we just get them all by id - will return the usual minfields
    // and will also stick them in cache

    let tank = parents.map(id => Drive.Files.get(rooter(id), {}, { allow404: false }))

    // let them out, 1 at a time
    while (tank.length) {
      yield DriveApp.__settleClass(tank.splice(0, 1)[0])
    }
  }

  // create the iterator
  const parentsIt = filesink()

  // a regular iterator doesnt support the same methods 
  // as Apps Script so we'll fake that too
  return newPeeker(parentsIt)

}

/**
 * list  get any kind using the NODE client
 * @param {string} [parentId] the parent id 
 * @param {object|[object]} [qob] any additional queries
 * @param {string} [fields] the fields to fetch
 * @param {TODO} [options] mimic fetchapp options
 * @param {string} [pageToken=null] if we're doing a pagetoken kind of thing
 * @param {boolean} folderTypes whether to get foldertypes 
 * @param {boolean} fileTypes whether to get fileTypes 
 * @returns {object} a collection of files {response, data}
 */
const fileLister = ({
  qob, parentId, fields, folderTypes, fileTypes, pageToken = null
}) => {
  // enhance any already supplied query params
  qob = Utils.arrify(qob) || []
  qob = [...qob]
  if (parentId) {
    ScriptApp.__behavior.isAccessible(parentId) // will throw if not accessible
    qob.push(`'${parentId}' in parents`)
  }

  // wheteher we're getting files,folders or both
  if (!(folderTypes || fileTypes)) {
    throw new Error(`Must specify either folder type,file type or both`)
  }

  // exclusive xor - if they're both true we dont need to do any extra q filtering
  if (folderTypes !== fileTypes) {
    qob.push(`mimeType ${fileTypes ? "!" : ""}= '${folderType}'`)
  }

  const q = qob.map(f => `${f}`).join(" and ")
  let params = { q, fields }
  if (pageToken) {
    params.pageToken = pageToken
  }


  // this will have be synced from async
  try {
    const result = Drive.Files.list(params)
    return result
  } catch (err) {
    console.error(err)
    throw new Error(err)
  }

}