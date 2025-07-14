/**
 * SLIDES
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import path from 'path';
import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';

const slapisPath = "../services/advslides/slapis.js";
const getModulePath = (relTarget) => path.resolve(import.meta.dirname, relTarget);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * sync a call to slides api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of slides eg 'presentations' for slides.presentations
 * @param {string} p.method the method of slides eg 'get' for slides.presentations.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the slides api
 */
export const sxSlides = async (Auth, { prop, method, params, options = {} }) => {
  const { getApiClient } = await import(getModulePath(slapisPath));
  const auth = Auth.getAuth();
  const apiClient = getApiClient(auth);

  const maxRetries = 7;
  let delay = 1777;

  for (let i = 0; i < maxRetries; i++) {
    let response;
    let error;

    try {
      const callish = apiClient[prop];
      response = await callish[method](params, options);
    } catch (err) {
      error = err;
      response = err.response;
    }

    const isQuotaError = response?.status === 429 || error?.code == 429;

    if (isQuotaError && i < maxRetries - 1) {
      syncWarn(`Quota error on Slides API call ${prop}.${method}. Retrying in ${delay}ms...`);
      await sleep(delay);
      delay *= 2;
      continue;
    }

    if (error || isQuotaError) {
      syncError(`Failed in sxSlides for ${prop}.${method}`, error);
      return { data: null, response: responseSyncify(response) };
    }
    return { data: response.data, response: responseSyncify(response) };
  }
};