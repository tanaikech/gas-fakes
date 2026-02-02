/**
 * SHEETS
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';
import { getSheetsApiClient } from '../services/advsheets/shapis.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sxSheets = async (Auth, { subProp, prop, method, params, options }) => {

  const apiClient = getSheetsApiClient();
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
    const redoCodes = [429, 500, 503, 408, 401]
    const isRetryable = redoCodes.includes(error?.code) ||
      redoCodes.includes(response?.status) ||
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ECONNRESET' ||
      error?.message?.includes('ETIMEDOUT') ||
      error?.message?.includes('ECONNRESET');

    if (isRetryable && i < maxRetries - 1) {
      if (error?.code === 401 || response?.status === 401) {
        Auth.invalidateToken();
        syncWarn(`Authentication error (401) on Sheets API call ${prop}.${method}. Invalidated token and retrying...`);
      }
      // add a random jitter to avoid thundering herd
      const jitter = Math.floor(Math.random() * 1000);
      syncWarn(`Retryable error on Sheets API call ${prop}.${method} (status: ${response?.status}). Retrying in ${delay + jitter}ms...`);
      await sleep(delay + jitter);
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