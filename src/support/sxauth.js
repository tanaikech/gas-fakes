/**
 * Auth and Init
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import got from 'got';
import { Auth } from './auth.js';
import { syncError, syncLog } from './workersync/synclogger.js';
import { homedir } from 'os';
import {access, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path'


/**
 * initialize ke stuff at the beginning such as manifest content and settings
 * @param {object} p pargs
 * @param {string} p.manifestPath where to finfd the manifest by default
 * @param {string} p.authPath import the auth code 
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.settingsPath where to find the settings file
 * @param {string} p.mainDir the directory the main app is running from
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @param {string} p.fakeId a fake script id to use if one isnt in the settings
 * @return {object} the finalized vesions of all the above 
 */
export const sxInit = async ({ manifestPath, claspPath, settingsPath, mainDir, cachePath, propertiesPath, fakeId }) => {



  // get the settings and manifest


  // get a file and parse if it exists
  const getIfExists = async (file) => {
    try {
      const content = await readFile(file, { encoding: 'utf8' })
      syncLog(`...using ${file}`);
      return JSON.parse(content)

    } catch (err) {
      syncLog(`...didnt find ${file} ... skipping`);
      return {}
    }
  }

  // files are relative to this main path
  const settingsFile = path.resolve(mainDir, settingsPath)
  const settingsDir = path.dirname(settingsFile)


  // get the setting file if it exists
  const _settings = await getIfExists(path.resolve(mainDir, settingsFile))
  const settings = { ..._settings }

  // the content of the settings file take precedence over whatever is passed as the default
  // get the manifest and clasp file
  settings.manifest = settings.manifest || manifestPath
  settings.clasp = settings.clasp || claspPath
  const [manifest, clasp] = await Promise.all([
    getIfExists(path.resolve(mainDir, settings.manifest)),
    getIfExists(path.resolve(mainDir, settings.clasp))
  ])

  /// if we dont have a scriptId we need to check in clasp or make a fakeone
  settings.scriptId = settings.scriptId || clasp.scriptId || fakeId

  // if we don't have a documentID, then see if this is a bound one
  settings.documentId = settings.documentId || null

  // cache & props cache can also be set in settings
  settings.cache = settings.cache || cachePath
  settings.properties = settings.properties || propertiesPath

  syncLog(`...cache will be in ${settings.cache}`);
  syncLog(`...properties will be in ${settings.properties}`);

  // now update all that if anything has changed
  const strSet = JSON.stringify(settings, null, 2)
  if (JSON.stringify(_settings, null, 2) !== strSet) {
    await mkdir(settingsDir, { recursive: true })
    syncLog(`...writing to ${settingsFile}`);
    writeFile(settingsFile, strSet, { flag: 'w' })
  }

  // get the required scopes and set them
  const scopes = manifest.oauthScopes || []

  // Initialize auth. This is async and will discover the project ID.
  const auth = await Auth.setAuth(scopes);
  const projectId = Auth.getProjectId();
  const accessToken = await auth.getAccessToken()
  let tokenInfo = null
  try {
    tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json()
  } catch (err) {
    syncError (`failed to get access token info`)
  }

  /// these all jst exist in this sub process so we need to send them back to parent process
  return {
    scopes,
    projectId,
    tokenInfo,
    accessToken, // also return the token itself
    settings,
    manifest,
    clasp
  }
}

export const sxRefreshToken = async (Auth) => {
  const auth = Auth.getAuth();
  // force a refresh by clearing the cached credential
  auth.cachedCredential = null;
  const accessToken = await auth.getAccessToken();
  const tokenInfo = await got(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`).json();

  // update the worker's auth state
  Auth.setAccessToken(accessToken);
  Auth.setTokenInfo(tokenInfo);

  return { accessToken, tokenInfo };
};