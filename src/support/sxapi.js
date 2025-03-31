/**
 * sync a call to google api
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param { string} p.apiPath the import path for the api code
 * @param { string} p.authPath the import path for the auth code
 * @param { string[]} p.scopes the scopres required for the operation
 * @param {object} p.params the params to add to the request
 * @param {string} p.options additional options to the api call
 * @return {SxResult} from the api
 */
export const sxApi = async ({ prop, method, apiPath, authPath, scopes, params, options }) => {

  const { Auth, responseSyncify } = await import(authPath)
  const { getAuthedClient } = await import(apiPath)

  // the scopes are required to set up an appropriate auth
  Auth.setAuth(scopes)

  // this is the node drive service
  const apiClient = getAuthedClient()
  try {
    const response = await apiClient[prop][method](params, options)
    return {
      data: response.data,
      response: responseSyncify(response)
    }
  } catch (err) {
    console.error('failed in syncit fxapi', err)
    console.info(`was attempting ${prop}.${method} with params`, params)
    const response = err?.response
    return {
      data: null,
      response: responseSyncify(response)
    }
  }

}