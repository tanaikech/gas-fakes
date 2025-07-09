import { google } from "googleapis";
import { Auth } from '../../support/auth.js'

let _client = null

export const getApiClient = (auth) => {
  if (!_client) {
    _client =  google.slides({version: 'v1', auth});
  }
  return _client
}

export const getAuthedClient = () => {

  if (!_client) {
    const auth = Auth.getAuth()
    return getApiClient (auth)
  }
  return _client
}
