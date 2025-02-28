import { google } from "googleapis";

let driveClient = null

export const getApiClient = (auth) => {
  if (!driveClient) {
    driveClient =  google.drive({version: 'v3', auth});
  }
  return driveClient
}