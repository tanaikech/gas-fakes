/**
 * FORMS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from './auth.js';
import { syncWarn, syncError, syncLog } from './workersync/synclogger.js';
import { getFormsApiClient } from '../services/advforms/formsapis.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sxForms = async (Auth, { prop, subProp, method, params, options = {} }) => {

  const apiClient = getFormsApiClient();

  const maxRetries = 7;
  let delay = 1777;
  //syncLog (`in sxforms  ${prop} ${method} ${JSON.stringify(params)}}`)
  for (let i = 0; i < maxRetries; i++) {
    let response;
    let error;

    try {
      // Access the base property (e.g., 'forms'), then the sub-property if it exists (e.g., 'responses').
      let callish = apiClient[prop];
      if (subProp) {
        callish = callish[subProp];
      }
      response = await callish[method](params, options);
    } catch (err) {
      error = err;
      response = err.response;
    }

    const isRetryable = [429, 500, 503].includes(response?.status) || error?.code == 429;

    if (isRetryable && i < maxRetries - 1) {
      const jitter = Math.floor(Math.random() * 1000);
      syncWarn(`Retryable error on Forms API call ${prop}${subProp ? '.' + subProp : ''}.${method} (status: ${response?.status}). Retrying in ${delay + jitter}ms...`);
      await sleep(delay + jitter);
      delay *= 2;
      continue;
    }

    if (error || isRetryable) {
      syncError(`Failed in sxForms for ${prop}${subProp ? '.' + subProp : ''}.${method}`, error);
      return { data: null, response: responseSyncify(response) };
    }
    return { data: response.data, response: responseSyncify(response) };
  }
};