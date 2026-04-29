import { getPermissionIterator } from './fileiterators.js';
import { newFakeUser } from '../services/common/fakeuser.js';


/**
 * get the file sharers
 * @param {string} id the file id
 * @param {string|string[]} roles the role or roles to filter by
 * @returns {FakeUser[]} the file viewers
 */
export const getSharers = (id, roles) => {
  const roleList = Array.isArray(roles) ? roles : [roles]
  const pit = getPermissionIterator({ id })
  const viewers = []
  while (pit.hasNext()) {
    const permission = pit.next()
    // console.log(`...DEBUG: permission for ${id}:`, JSON.stringify(permission))
    if (roleList.includes(permission.role) && permission.type === "user") viewers.push(makeUserFromPermission(permission))
  }
  return viewers
}



const makeUserFromPermission = (permission) => {
  return newFakeUser({
    email: permission.emailAddress,
    photoUrl: permission.photoLink,
    name: permission.displayName,
    domain: permission.domain
  })
}