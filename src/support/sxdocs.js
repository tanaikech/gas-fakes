/**
 * DOCS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import { responseSyncify } from './auth.js';
import { syncWarn, syncError, syncLog } from './workersync/synclogger.js';
import { getDocsApiClient } from '../services/advdocs/docapis.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * sync a call to docs api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of docs eg 'documents' for docs.documents
 * @param {string} p.method the method of docs eg 'get' for docs.documents.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the Docs api
 */
export const sxDocs = async (Auth, { prop, method, params, options = {} }) => {
  const apiClient = getDocsApiClient();
  // rate limit on docs is higher that the others so we may as well have a bigger delay
  const maxRetries = 7;
  let delay = 2789;
    //syncLog(JSON.stringify({ prop, method, params, options }))
  for (let i = 0; i < maxRetries; i++) {
    let response;
    let error;

    try {
      const callish = apiClient[prop]
      response = await callish[method](params, options);
    } catch (err) {
      error = err;
      response = err.response;
    }

    const isRetryable = [429, 500, 503].includes(response?.status) || error?.code == 429;

    if (isRetryable && i < maxRetries - 1) {
      // add a random jitter to avoid thundering herd
      const jitter = Math.floor(Math.random() * 1000);
      syncWarn(`Retryable error on Docs API call ${prop}.${method} (status: ${response?.status}). Retrying in ${delay + jitter}ms...`);
      await sleep(delay + jitter);
      delay *= 2;
      continue;
    }

    if (error || isRetryable) {
      syncError(`Failed in sxDocs for ${prop}.${method}`, error);
      return {
        data: null,
        response: responseSyncify(response)
      };
    }
    return {
      data: response.data,
      response: responseSyncify(response)
    };
  }
};