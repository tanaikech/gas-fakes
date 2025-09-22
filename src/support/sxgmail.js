/**
 * GMAIL
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';
import { getGmailApiClient } from '../services/advgmail/gmailapis.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sxGmail = async (Auth, { subProp, prop, method, params, options }) => {

  const apiClient = getGmailApiClient();
  const maxRetries = 7;
  let delay = 1777;
  const methodName = subProp ? `${prop}.${subProp}.${method}` : `${prop}.${method}`;

  for (let i = 0; i < maxRetries; i++) {
    let response;
    let error;
    try {
      const callish = subProp ? apiClient[prop][subProp] : apiClient[prop];
      response = await callish[method](params, options);
    } catch (err) {
      error = err;
      response = err.response;
    }

    const isRetryable = [429, 500, 503].includes(response?.status) || error?.code == 429;
    
    if (isRetryable && i < maxRetries - 1) {
      const jitter = Math.floor(Math.random() * 1000);
      syncWarn(`Retryable error on Gmail API call ${methodName} (status: ${response?.status}). Retrying in ${delay + jitter}ms...`);
      await sleep(delay + jitter);
      delay *= 2;
      continue;
    }

    if (error || isRetryable) {
      // Don't log 404 as an error, it's an expected outcome for some tests (e.g., get deleted item)
      if (response?.status !== 404) {
        syncError(`Failed in sxGmail for ${methodName}`, error);
      }
      return { data: null, response: responseSyncify(response) };
    }
    return {
      data: response.data,
      response: responseSyncify(response)
    };
  }
};