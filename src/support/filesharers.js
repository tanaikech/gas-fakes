import { getPermissionIterator } from './fileiterators.js';
import { newFakeUser } from '../services/common/fakeuser.js';


/**
 * get the file sharers
 * @param {string} id the file id
 * @param {string|string[]} roles the role or roles to filter by
 * @returns {FakeUser[]} the file viewers
 */
export const getSharers = (id, roles) => {
  let roleList = Array.isArray(roles) ? roles : [roles]
  
  // To match live Apps Script behavior:
  // If requesting 'writer' (editors), we must also include 'owner'
  if (roleList.includes('writer') && !roleList.includes('owner')) {
    roleList.push('owner');
  }
  
  // If requesting 'reader' (viewers), we must include 'writer' and 'owner'
  if ((roleList.includes('reader') || roleList.includes('commenter')) && !roleList.includes('writer')) {
    roleList.push('writer');
    if (!roleList.includes('owner')) roleList.push('owner');
  }

  const pit = getPermissionIterator({ id })
  const viewers = []
  while (pit.hasNext()) {
    const permission = pit.next()
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