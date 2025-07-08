/**
 * sync a call to google api
 * @param {object} p pargs
 * @param {string} p.subProp sometimes theres an extra prop - eg sheets.spreadsheets.values.get = prop:spreadsheets, subprop: values
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param { string} p.apiPath the import path for the api code
 * @param { string} p.authPath the import path for the auth code
 * @param { string[]} p.scopes the scopres required for the operation
 * @param {object} p.params the params to add to the request
 * @param {string} p.options additional options to the api call
 * @return {SxResult} from the api
 */
export const sxApi = async ({ subProp, prop, method, apiPath, authPath, scopes, params, options, accessToken }) => {

  const { Auth, responseSyncify } = await import(authPath)
  let apiClient;

  if (accessToken) {
    const { google } = await import('googleapis');
    const { OAuth2Client } = await import('google-auth-library');
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });

    if (apiPath.includes('drapis')) {
      apiClient = google.drive({ version: 'v3', auth });
    } else if (apiPath.includes('shapis')) {
      apiClient = google.sheets({ version: 'v4', auth });
    } else {
      throw new Error(`Unknown apiPath in sxApi: ${apiPath}`);
    }
  } else {
    const { getAuthedClient } = await import(apiPath)
    await Auth.setProjectIdFromADC(scopes)
    Auth.setAuth(scopes)
    apiClient = getAuthedClient()
  }

  try {

    const callish = subProp ? apiClient[prop][subProp] : apiClient[prop] 
    const response = await callish[method](params, options)

    return {
      data: response.data,
      response: responseSyncify(response)
    }
  } catch (err) {
    console.error('failed in syncit fxapi', err)
    console.info(`was attempting ${prop}.${method} with params`, params, 'subprop', subProp)
    const response = err?.response
    return {
      data: null,
      response: responseSyncify(response)
    }
  }

}