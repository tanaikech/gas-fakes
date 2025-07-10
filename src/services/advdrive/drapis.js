import { google } from "googleapis";
import { Auth } from '../../support/auth.js'

export const getApiClient = (auth) => {
  return google.drive({ version: 'v3', auth });
}

export const getAuthedClient = () => {
  const auth = Auth.getAuth()
  return getApiClient(auth)
}