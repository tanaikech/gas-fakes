/**
 * SHEETS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */
import path from 'path';
import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';

const shapisPath = "../services/advsheets/shapis.js";
const getModulePath = (relTarget) => path.resolve(import.meta.dirname, relTarget);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sxSheets = async (Auth, { subProp, prop, method, params, options }) => {
  const { getApiClient } = await import(getModulePath(shapisPath));
  const auth = Auth.getAuth();
  const apiClient = getApiClient(auth);
  const maxRetries = 7;
  let delay = 1777;

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
      syncWarn(`Retryable error on Sheets API call ${prop}.${method} (status: ${response?.status}). Retrying in ${delay}ms...`);
      await sleep(delay);
      delay *= 2;
      continue;
    }

    if (error || isRetryable) {
      syncError(`Failed in sxSheets for ${prop}.${method}`, error);
      return { data: null, response: responseSyncify(response) };
    }
    return {
      data: response.data,
      response: responseSyncify(response)
    };
  }
};