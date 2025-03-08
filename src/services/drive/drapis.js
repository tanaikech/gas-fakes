import { google } from "googleapis";
import { Auth } from '../../support/auth.js'

let driveClient = null

export const getApiClient = (auth) => {
  if (!driveClient) {
    driveClient =  google.drive({version: 'v3', auth});
  }
  return driveClient
}

export const getAuthedClient = () => {

  if (!driveClient) {
    const auth = Auth.getAuth()
    return getApiClient (auth)
  }
  return driveClient
}