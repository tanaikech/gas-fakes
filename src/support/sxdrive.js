/**
 * DRIVE
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
 * Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.method - update or create
 * @param {string} [p.resource] the file meta data
 * @param {blob} [p.bytes] the content
 * @param {string} [p.fields] the fields to return
 * @param {string} [p.mimeType] the mimeType to assign
 * @param {string} [p.fileId] the fileId - required of patching
 * @param {string} [p.drapisPath] the resolved path to the api code
 * @param {string} [p.authPath] the resolved path to the auth code 
 * @param {string[]} [p.scopes] the scopes that the operation will need 
 * @param {object} [p.params] any extra params
 * @return {DriveResponse} from the drive api
 */
export const sxStreamUpMedia = async ({ resource, drapisPath, authPath, scopes, bytes, fields, method, mimeType, fileId, params, adcPath, projectId }) => {

  const { Auth, responseSyncify } = await import(authPath)
  const { getApiClient } = await import(drapisPath)
  const { default: intoStream } = await import('into-stream');

  Auth.setProjectId(projectId);
  Auth.setAuth(scopes, adcPath);
  const auth = Auth.getAuth()

  // this is the node drive service
  const drive = getApiClient(auth)

  // set up the media
  // if there is no media, it will create an empty version of the file
  let media = null
  if (bytes) {
    const buffer = Buffer.from(bytes)
    const body = intoStream(buffer)
    media = {
      mimeType,
      body
    }
  }

  try {
    const pack = {
      resource,
      fields,
      fileId,
      media,
      ...params
    }

    const created = await drive.files[method](pack)
    return {
      data: created.data,
      response: responseSyncify(created)
    }

  } catch (err) {
    console.error('failed in syncit fxStreamUpMedia', err)
    const response = err?.response
    return {
      data: null,
      response: responseSyncify(response)
    }
  }

}

/**
 * sync a call to download data from drive
 * @param {object} p pargs
 * @param {string} p.id file id
 * @param { string} p.drapisPath the import path for the api code
 * @param { string} p.authPath the import path for the auth code
 * @param { string[]} p.scopes the scopres required for the operation
 * @return {SxResult} from the api
 */
export const sxDriveMedia = async ({ id, drapisPath, authPath, scopes, adcPath, projectId }) => {

  const { Auth, responseSyncify } = await import(authPath)
  const { getApiClient } = await import(drapisPath)
  const { getStreamAsBuffer } = await import('get-stream');

  Auth.setProjectId(projectId);
  Auth.setAuth(scopes, adcPath);
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