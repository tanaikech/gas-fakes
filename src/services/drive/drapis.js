import { google } from "googleapis";

let driveClient = null

export const getDriveClient = (auth) => {
  if (!driveClient) {
    driveClient =  google.drive({version: 'v3', auth});
  }
  return driveClient
}

/**
 * we can't serialize a return object from drive api
 * so we just select a few props from it
 * @param {SyncDriveResponse} result 
 * @returns 
 */
export const responseSyncify = (result) => ({
  status: result.status,
  statusText: result.statusText,
  responseUrl: result.request?.responseURL
})

