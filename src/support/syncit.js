// this one is locally patched for now
// import makeSynchronous from 'make-synchronous';
import path from "path";
import { Auth } from "./auth.js";
import { randomUUID } from "node:crypto";
import mime from "mime";
import { minFields } from "./helpers.js";
import { mergeParamStrings } from "./utils.js";
import {
  improveFileCache,
  checkResponse,
  getFromFileCache,
} from "./filecache.js";
import { checkResponseCacher } from "./fetchcacher.js";
import { docsCacher } from "./docscacher.js";
import { gmailCacher } from "./gmailcacher.js";
import { formsCacher } from "./formscacher.js";
import { slidesCacher } from "./slidescacher.js";
import { sheetsCacher } from "./sheetscacher.js";
import is from "@sindresorhus/is";
import { callSync } from "./workersync/synchronizer.js";

const manifestDefaultPath = "./appsscript.json";
const claspDefaultPath = "./.clasp.json";
const settingsDefaultPath = process.env.GF_SETTINGS_PATH || "./gasfakes.json";
const propertiesDefaultPath = "/tmp/gas-fakes/properties";
const cacheDefaultPath = "/tmp/gas-fakes/cache";
// note that functions like Sheets.newGridRange() etc create objects that contain get and set functions
// the makesynchronous functions need data that can be serialized. so we need to string/parse to normlaize them
const normalizeSerialization = (ob) =>
  is.nullOrUndefined(ob) || !is.object(ob)
    ? ob
    : JSON.parse(JSON.stringify(ob));

/**
 * check and register a result in cache
 * @param {import('./sxdrive.js').SxResult} the result of a sync api call
 * @return {import('./sxdrive.js').SxResult}
 */
const registerSx = (result, allow404 = false, fields) => {
  const { data, response } = result;
  checkResponse(data?.id, response, allow404);
  if (data?.id) {
    return {
      ...result,
      data: improveFileCache(data.id, data, fields),
    };
  } else {
    return result;
  }
};

const register = (id, cacher, result, allow404 = false, params) => {
  const { data, response } = result;

  if (checkResponseCacher(id, response, allow404, cacher)) {
    return {
      ...result,
      data: cacher.setEntry(id, params, data),
    };
  } else {
    return result;
  }
};

/**
 * sync a call to Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.method - update or create
 * @param {string} [p.file] the file meta data
 * @param {blob} [p.blob] the content
 * @param {string} [p.fields] the fields to return
 * @param {string} [p.mimeType] the mimeType to assign
 * @param {string} [p.fileId] the fileId - required of patching
 * @param {object} [p.params] any extra params
 * @return {import('./sxdrive.js').SxResult} from the drive api
 */
const fxStreamUpMedia = ({
  file = {},
  blob,
  fields = "",
  method = "create",
  fileId,
  params = {},
}) => {
  // merge the required fields with the minimum
  fields = mergeParamStrings(minFields, fields);
  const result = callSync("sxStreamUpMedia", {
    resource: file,
    bytes: blob ? blob.getBytes() : null,
    fields,
    method,
    mimeType: blob?.getContentType() || file.mimeType,
    fileId,
    params,
  });
  // check result and register in cache
  return registerSx(result, false, fields);
};

/**
 * sync a call to Drive api
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDrive = ({ prop, method, params, options }) => {
  return callSync("sxDrive", {
    prop,
    method,
    params: normalizeSerialization(params),
    options: normalizeSerialization(options),
  });
};

const fxGeneric = ({
  serviceName,
  prop,
  subProp,
  method,
  params,
  options,
  cacher,
  idField,
}) => {
  const { [idField]: resourceId, ...otherParams } = params;

  if (method === "get") {
    const data = cacher.getEntry(resourceId, otherParams);
    if (data) {
      return {
        data,
        response: {
          status: 200,
          fromCache: true,
        },
      };
    }
  }

  const result = callSync(`sx${serviceName}`, {
    subProp,
    prop,
    method,
    params: normalizeSerialization(params),
    options: normalizeSerialization(options),
  });

  if (method === "get") {
    return register(resourceId, cacher, result, false, otherParams);
  }

  if (resourceId) {
    cacher.clear(resourceId);
  }
  return result;
};

/**
 * sync a call to Drive api get
 * @param {object} p pargs
 * @param {string} p.id the file id
 * @param {boolean} [p.allowCache=true] whether to allow the result to come from cache
 * @param {boolean} [p.allow404=false] whether to allow 404 errors
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDriveGet = ({
  id,
  params,
  allow404 = false,
  allowCache = true,
  options,
}) => {
  // fixup the fields param
  // we'll fiddle with the scopes to populate cache
  params.fields = mergeParamStrings(minFields, params.fields || "");
  params.fileId = id;

  // now we check if it's in cache and already has the necessary fields
  // the cache will check the fields it already has against those requested
  if (allowCache) {
    const { cachedFile, good } = getFromFileCache(id, params.fields);
    if (good)
      return {
        data: cachedFile,
        // fake a good sxresponse
        response: {
          status: 200,
          fromCache: true,
        },
      };
  }

  // so we have to hit the API
  const result = callSync("sxDriveGet", {
    id,
    params: normalizeSerialization(params),
    options: normalizeSerialization(options),
  });

  // check result and register in cache
  return registerSx(result, allow404, params.fields);
};

/**
 * zipper
 * @param {object} p
 * @param {FakeBlob} p.blobs an array of blobs to be zipped
 * @returns {FakeBlob} a combined zip file
 */
const fxZipper = ({ blobs }) => {
  const dupCheck = new Set();
  const blobsContent = blobs.map((f, i) => {
    const ext = mime.getExtension(f.getContentType());
    const name = f.getName() || `Untitled${i + 1}${ext ? "." + ext : ""}`;
    if (dupCheck.has(name)) {
      throw new Error(`Duplicate filename ${name} not allowed in zip`);
    }
    dupCheck.add(name);
    return {
      name,
      bytes: f.getBytes(),
    };
  });

  return callSync("sxZipper", {
    blobsContent,
  });
};

/**
 * Unzipper
 * @param {object} p
 * @param {FakeBlob} p.blob the blob containing the zipped files
 * @returns {FakeBlob[]} each of the files unzipped
 */
const fxUnzipper = ({ blob }) => {
  const blobContent = {
    name: blob.getName(),
    bytes: blob.getBytes(),
  };

  return callSync("sxUnzipper", {
    blobContent,
  });
};

/**
 * initialize all the stuff at the beginning such as manifest content and settings
 * and register them all in Auth object for future reference
 * @param {object} p pargs
 * @param {string} p.manifestPath where to finfd the manifest by default
 * @param {string} p.claspPath where to find the clasp file by default
 * @param {string} p.settingsPath where to find the settings file
 * @param {string} p.cachePath the cache files
 * @param {string} p.propertiesPath the properties file location
 * @return {object} the finalized vesions of all the above
 */
const fxInit = ({
  manifestPath = manifestDefaultPath,
  claspPath = claspDefaultPath,
  settingsPath = settingsDefaultPath,
  cachePath = cacheDefaultPath,
  propertiesPath = propertiesDefaultPath,
} = {}) => {

  // this is the path of the runing main process
  const mainDir = path.dirname(process.argv[1]);

  // because this is all run in a synced subprocess it's not an async result
  const synced = callSync("sxInit", {
    claspPath,
    settingsPath,
    manifestPath,
    mainDir,
    cachePath,
    propertiesPath,
    fakeId: randomUUID(),
  });

  const {
    scopes,
    projectId,
    tokenInfo,
    accessToken,
    settings,
    manifest,
    clasp,
  } = synced;

  // set these values from the subprocess for the main project
  Auth.setProjectId(projectId);
  //Auth.setAuth(scopes)
  Auth.setTokenInfo(tokenInfo);
  //Auth.setAccessToken(accessToken)
  Auth.setSettings(settings);
  Auth.setClasp(clasp);
  Auth.setManifest(manifest);
  return synced;
};

/**
 * because we're using a file backed cache we need to syncit
 * it'll slow it down but it's necessary to emuate apps script behavior
 * @param {object} p params
 * @param {}
 * @returns {*}
 */
const fxStore = (storeArgs, method = "get", ...kvArgs) => {
  return callSync("sxStore", {
    method,
    kvArgs,
    storeArgs,
  });
};

const fxRefreshToken = () => {
  return callSync("sxRefreshToken");
};

/**
 * sync a call to Drive api to stream a download
 * @param {object} p pargs
 * @param {string} p.prop the prop of drive eg 'files' for drive.files
 * @param {string} p.method the method of drive eg 'list' for drive.files.list
 * @param {object} p.params the params to add to the request
 * @return {DriveResponse} from the drive api
 */
const fxDriveMedia = ({ id }) => {
  return callSync("sxDriveMedia", {
    id,
  });
};

/**
 * a sync version of fetching
 * @param {string} url the url to check
 * @param {object} options the options
 * @param {string[]} responseField the reponse fields to extract (we cant serialize native code)
 * @returns {reponse} urlfetch style reponse
 */
const fxFetch = (url, options, responseFields) => {
  return callSync("sxFetch", url, options, responseFields);
};

const fxSheets = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Sheets",
    cacher: sheetsCacher,
    idField: "spreadsheetId",
  });
const fxSlides = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Slides",
    cacher: slidesCacher,
    idField: "presentationId",
  });
const fxDocs = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Docs",
    cacher: docsCacher,
    idField: "documentId",
  });
const fxForms = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Forms",
    cacher: formsCacher,
    idField: "formId",
  });
const fxGmail = (args) =>
  fxGeneric({
    ...args,
    serviceName: "Gmail",
    cacher: gmailCacher,
    idField: "id",
  });

const fxGetImagesFromXlsx = (args) => callSync("sxGetImagesFromXlsx", args);

export const Syncit = {
  fxFetch,
  fxDrive,
  fxDriveMedia,
  fxDriveGet,
  fxInit,
  fxStore,
  fxZipper,
  fxUnzipper,
  fxStreamUpMedia,
  fxSheets,
  fxSlides,
  fxRefreshToken,
  fxDocs,
  fxForms,
  fxGmail,
  fxGetImagesFromXlsx
};
