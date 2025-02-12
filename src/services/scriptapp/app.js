// fake script app to get oauth token from application default credentials on Apps Script
// first set up and test ADC with required scopes - see https://ramblings.mcpher.com/application-default-credentials-with-google-cloud-and-workspace-apis
// Note that all async type functions have been converted to synch to make it Apps Script like

import { Syncit } from '../../support/syncit.js'
import { Auth } from '../../support/auth.js'
import { Proxies } from '../../support/proxies.js'

/**
 * fake ScriptApp.getOAuthToken 
 * @return {string} token
 */
const getOAuthToken = () => {
  // make a sync request in a subprocess to get an access token
  return Syncit.fxGetAccessToken()
}

const limitMode = (mode) => {
  if (mode !== ScriptApp.AuthMode.FULL) {
    throw new Error(`only ${ScriptApp.AuthMode.FULL} is supported as mode for now`)
  }
  // the scopes from the manifest should have been set
  if (!Auth.hasAuth()) {
    throw new Error(`manifest hasnt been initialized`)
  }
  return mode
}

/**
 * these have been converted with a sync version
 * @param {ScriptApp.AuthMode} mode mode to check
 * @returns null
 */
const requireAllScopes = (mode) => {
  limitMode(mode)
  return checkScopesMatch(Array.from(Auth.getAuthedScopes().keys()))
}

/**
 * these have been converted with a sync version
 * see https://developers.google.com/apps-script/reference/script/script-app#requireScopes(AuthMode,String)
 * @param {ScriptApp.AuthMode} mode mode to check
 * @param {string[]} required scopes required 
 * @returns null
 */
const requireScopes = (mode, required) => {
  // only supporting FULL for now
  limitMode(mode)
  return checkScopesMatch(required)
}

/**
 * a sync version of token checking
 * @param {string} token the token to check
 * @returns {object} access token info
 */
const checkToken = (accessToken) => {
  return Syncit.fxCheckToken(accessToken)
}

/**
 * check that all scopes requested have been asked for
 * @param {string[]} required 
 * @returns null
 */
const checkScopesMatch = (required) => {

  // we can do a sync version of the accesstoken fetch
  const token = getOAuthToken()
  const tokenInfo = checkToken(token)

  // now we're syncronous all the way
  const tokened = new Set(tokenInfo.scope.split(" "))

  // see which ones are missing
  const missing = required.filter(s => {
    // setting this scope causes gcloud to block - but we dot need it anywat as the default ADC allow it, so we have to skip it
    const ignore = "https://www.googleapis.com/auth/script.external_request"
    // if drive is authorized and drive.readonly is required that's okay too
    // if drive.readonly is authorized and drive is requested thats not
    return !(s === ignore || tokened.has(s.replace(/\.readonly$/, "")))
  })

  if (missing.length) {
    throw new Error(`These scopes are required but have not been authorized ${missing.join(",")}`)
  }
  return null

}

// This will eventually hold a proxy for ScriptApp
let _app = null


/**
 * adds to global space to mimic Apps Script behavior
 */
const name = "ScriptApp"

if (typeof globalThis[name] === typeof undefined) {

  console.log ('setting script app to global')

  const getApp = () => {

    // if it hasn't been intialized yet then do that
    if (!_app) {
      
      // we also need to do the manifest scopes thing and the project id
      const projectId = Syncit.fxGetProjectId()
      const manifest = Syncit.fxGetManifest()
      Auth.setProjectId (projectId)
      Auth.setManifestScopes(manifest)

      _app = {
        getOAuthToken,
        requireAllScopes,
        requireScopes,
        AuthMode: {
          FULL: 'FULL'
        }
      }


    }
    // this is the actual driveApp we'll return from the proxy
    return _app
  }


  Proxies.registerProxy(name, getApp)

}
