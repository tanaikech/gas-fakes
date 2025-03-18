
import { newFakeUser } from '../session/fakeuser.js';

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
export const fileLister = ({
  qob, parentId, fields, folderTypes, fileTypes, pageToken = null
}) => {
  // enhance any already supplied query params
  qob = Utils.arrify(qob) || []
  if (parentId) {
    qob.push(`'${parentId}' in parents`)
  }

  // wheteher we're getting files,folders or both
  if (!(folderTypes || fileTypes)) {
    throw new Error(`Must specify either folder type,file type or both`)
  }

  // exclusive xor - if they're both true we dont need to do any extra q filtering
  if (folderTypes !== fileTypes) {
    qob.push(`mimeType${fileTypes ? "!" : ""}='${folderType}'`)
  }

  const q = qob.map(f => `(${f})`).join(" and ")
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


/**
 * get the file sharers
 * @returns {FakeUser} the file viewers
 */
export const getSharers = (id, role) => {
  const pit = getPermissionIterator({ id })
  const viewers = []
  while (pit.hasNext()) {
    const permission = pit.next()
    if (permission.role === role && permission.type === "user") viewers.push(makeUserFromPermission(permission))
  }
  return viewers
}

export const makeUserFromPermission = (permission) => {
  return newFakeUser({
    email: permission.emailAddress,
    photoUrl: permission.photoLink,
    name: permission.displayName,
    domain: permission.domain
  })
}




