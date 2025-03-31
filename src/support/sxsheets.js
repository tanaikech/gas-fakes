/**
 * SHEETS
 * all these functions run as subprocesses and wait fo completion
 * thus turning async operations into sync
 * note 
 * - since the subprocess starts afresh it has to reimport all dependecies
 * - there is nocontext inhertiance
 * - arguments and returns must be serializable ie. primitives or plain objects
 * 
 * TODO - this slows down debuggng significantly as it has to keep restarting the debugger
 * - need to research how to get over that
 */

/**
 * serializable reponse from a sync call
 * @typedef SxResponse
 * @property {number} status
 * @property {string} statusText
 * @property {string} responseUrl
 * @property {boolean} fromCache
 */

/**
 * what's eventually returned from the sync call
 * @typedef SxResult
 * @property {*} data the data from the api call
 * @property {SxResponse} reponse the response from the api call
 */

/**
 * serialized blob
 * @typedef SerializedBlob 
 * @property {string} name
 * @property {byte[]} bytes 
 */




/**
 * sync a call to download data from drive
 * @param {object} p pargs
 * @param {string} p.id file id
 * @param { string} p.drapisPath the import path for the api code
 * @param { string} p.authPath the import path for the auth code
 * @param { string[]} p.scopes the scopres required for the operation
 * @return {SxResult} from the api
 */
export const sxDriveMedia = async ({ id, drapisPath, authPath, scopes }) => {

  const { Auth, responseSyncify } = await import(authPath)
  const { getApiClient } = await import(drapisPath)
  const { getStreamAsBuffer } = await import('get-stream');

  // the scopes are required to set up an appropriate auth
  Auth.setAuth(scopes)
  const auth = Auth.getAuth()

  // this is the node drive service
  const drive = getApiClient(auth)
  const streamed = await drive.files.get({
    fileId: id,
    alt: 'media'
  }, {
    responseType: 'stream'
  })
  const response = responseSyncify(streamed)

  if (response.status === 200) {
    const buf = await getStreamAsBuffer(streamed.data)
    const data = Array.from(buf)

    return {
      data,
      response
    }
  } else {
    return {
      data: null,
      response
    }
  }

}