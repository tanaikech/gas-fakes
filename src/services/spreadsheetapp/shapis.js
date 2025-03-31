import { google } from "googleapis";
import { Auth } from '../../support/auth.js'

let sheetsClient = null

export const getApiClient = (auth) => {
  if (!sheetsClient) {
    sheetsClient =  google.sheets({version: 'v4', auth});
  }
  return sheetsClient
}

export const getAuthedClient = () => {

  if (!sheetsClient) {
    const auth = Auth.getAuth()
    return getApiClient (auth)
  }
  return sheetsClient
}
