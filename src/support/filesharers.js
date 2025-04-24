import { getPermissionIterator } from './fileiterators.js';
import { newFakeUser } from '../services/commonclasses/fakeuser.js';


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



const makeUserFromPermission = (permission) => {
  return newFakeUser({
    email: permission.emailAddress,
    photoUrl: permission.photoLink,
    name: permission.displayName,
    domain: permission.domain
  })
}