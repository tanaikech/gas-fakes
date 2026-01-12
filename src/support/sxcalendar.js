/**
 * CALENDAR
 * all these functions run in the worker
 * thus turning async operations into sync
 * note
 * - arguments and returns must be serializable ie. primitives or plain objects
 */

import { responseSyncify } from './auth.js';
import { syncWarn, syncError } from './workersync/synclogger.js';
import { getCalendarApiClient } from '../services/advcalendar/clapis.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * sync a call to calendar api
 * @param {object} Auth the auth object
 * @param {object} p pargs
 * @param {string} p.prop the prop of calendar eg 'calendars' for calendar.calendars
 * @param {string} p.method the method of calendar eg 'get' for calendar.calendars.get
 * @param {object} p.params the params to add to the request
 * @param {object} p.options gaxios options
 * @return {import('./sxdrive.js').SxResult} from the Calendar api
 */
export const sxCalendar = async (Auth, { prop, method, params, options = {} }) => {

  const apiClient = getCalendarApiClient();

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

    const isRetryable = [429, 500, 503].includes(response?.status) || 
      error?.code == 429 ||
      (response?.status === 403 && (
        error?.message?.toLowerCase().includes('usage limit') ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.errors?.some(e => ['rateLimitExceeded', 'userRateLimitExceeded', 'calendarUsageLimitsExceeded'].includes(e.reason))
      ));

    if (isRetryable && i < maxRetries - 1) {
      // add a random jitter to avoid thundering herd
      const jitter = Math.floor(Math.random() * 1000);
      syncWarn(`Retryable error on Calendar API call ${prop}.${method} (status: ${response?.status}). Retrying in ${delay + jitter}ms...`);
      await sleep(delay + jitter);
      delay *= 2;
      continue;
    }

    if (error || isRetryable) {
      syncError(`Failed in sxCalendar for ${prop}.${method}`, error);
      return { data: null, response: responseSyncify(response) };
    }
    return { data: response.data, response: responseSyncify(response) };
  }
};
