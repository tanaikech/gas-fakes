/**
 * SLIDES
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';
import { getSlidesApiClient } from '../services/advslides/slapis.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * sync a call to slides api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of slides eg 'presentations' for slides.presentations
 * @param {string} p.method the method of slides eg 'get' for slides.presentations.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the Slides api
 */
export const sxSlides = async (Auth, { prop, method, params, options = {} }) => {

  const apiClient = getSlidesApiClient();

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

    const redoCodes = [429, 500, 503, 408, 401]
    const isRetryable = redoCodes.includes(error?.code) || redoCodes.includes(response?.status)

    if (isRetryable && i < maxRetries - 1) {
      if (error?.code === 401 || response?.status === 401) {
        Auth.invalidateToken();
        syncWarn(`Authentication error (401) on Slides API call ${prop}.${method}. Invalidated token and retrying...`);
      }
      // add a random jitter to avoid thundering herd
      const jitter = Math.floor(Math.random() * 1000);
      syncWarn(`Retryable error on Slides API call ${prop}.${method} (status: ${response?.status}). Retrying in ${delay + jitter}ms...`);
      await sleep(delay + jitter);
      delay *= 2;
      continue;
    }

    if (error || isRetryable) {
      syncError(error?.message)
      syncError(error?.code)
      syncError(error?.stack)
      syncError(`Failed in sxSlides for ${prop}.${method}`);
      return { data: null, response: responseSyncify(response) };
    }
    return { data: response.data, response: responseSyncify(response) };
  }
};